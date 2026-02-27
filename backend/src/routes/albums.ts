import { Router } from "express";
import { z }      from "zod";
import { prisma } from "../server";
import { authenticate, optionalAuth, requireRole, type AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// GET /api/albums — list published albums with filters
router.get("/", optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const { page = 1, limit = 20, genre, sort = "popular", type } = z.object({
      page:  z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(50).default(20),
      genre: z.string().optional(),
      sort:  z.enum(["popular", "recent", "title"]).default("popular"),
      type:  z.enum(["album", "single", "ep"]).optional(),
    }).parse(req.query);

    const where: Record<string, unknown> = { isPublished: true };
    if (type) where.type = type.toUpperCase();
    if (genre) where.genres = { some: { genre: { slug: genre } } };

    const orderBy = sort === "popular" ? { playCount: "desc" as const }
                  : sort === "recent"  ? { releaseDate: "desc" as const }
                  : { title: "asc" as const };

    const [albums, total] = await Promise.all([
      prisma.album.findMany({
        where,
        orderBy,
        skip:    (page - 1) * limit,
        take:    limit,
        include: {
          artist: { select: { id: true, name: true, slug: true, verified: true } },
          genres: { include: { genre: true } },
          _count: { select: { tracks: true, likes: true } },
        },
      }),
      prisma.album.count({ where }),
    ]);

    // Add isLiked for authenticated users
    let likedAlbumIds = new Set<string>();
    if (req.user) {
      const likes = await prisma.albumLike.findMany({
        where:  { userId: req.user.id, albumId: { in: albums.map(a => a.id) } },
        select: { albumId: true },
      });
      likedAlbumIds = new Set(likes.map(l => l.albumId));
    }

    const enriched = albums.map(a => ({
      ...a,
      trackCount: a._count.tracks,
      likeCount:  a._count.likes,
      isLiked:    likedAlbumIds.has(a.id),
    }));

    res.json({
      success: true,
      data: { items: enriched, total, page, limit, hasMore: page * limit < total },
    });
  } catch (err) { next(err); }
});

// GET /api/albums/trending
router.get("/trending", async (_req, res, next) => {
  try {
    const albums = await prisma.album.findMany({
      where:   { isPublished: true },
      orderBy: { playCount: "desc" },
      take:    20,
      include: {
        artist: { select: { id: true, name: true, slug: true, verified: true } },
        genres: { include: { genre: true } },
        _count: { select: { tracks: true, likes: true } },
      },
    });
    res.json({ success: true, data: albums });
  } catch (err) { next(err); }
});

// GET /api/albums/new-releases
router.get("/new-releases", async (_req, res, next) => {
  try {
    const albums = await prisma.album.findMany({
      where:   { isPublished: true },
      orderBy: { releaseDate: "desc" },
      take:    20,
      include: {
        artist: { select: { id: true, name: true, slug: true, verified: true } },
        _count: { select: { tracks: true, likes: true } },
      },
    });
    res.json({ success: true, data: albums });
  } catch (err) { next(err); }
});

// GET /api/albums/:id
router.get("/:id", optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const album = await prisma.album.findFirst({
      where: { OR: [{ id: req.params.id }, { slug: req.params.id }], isPublished: true },
      include: {
        artist:  { select: { id: true, name: true, slug: true, verified: true, avatarUrl: true } },
        tracks:  { orderBy: [{ discNumber: "asc" }, { trackNumber: "asc" }], include: { genre: true } },
        genres:  { include: { genre: true } },
        _count:  { select: { likes: true } },
      },
    });
    if (!album) throw new AppError(404, "Album not found");

    let isLiked = false;
    if (req.user) {
      const like = await prisma.albumLike.findUnique({ where: { userId_albumId: { userId: req.user.id, albumId: album.id } } });
      isLiked = !!like;
    }

    res.json({ success: true, data: { ...album, likeCount: album._count.likes, isLiked } });
  } catch (err) { next(err); }
});

// POST /api/albums — create (artist only)
router.post("/", authenticate, requireRole("ARTIST", "ADMIN"), async (req: AuthRequest, res, next) => {
  try {
    const schema = z.object({
      title:       z.string().min(1).max(200),
      description: z.string().max(2000).optional(),
      coverUrl:    z.string().url(),
      releaseDate: z.string().datetime(),
      type:        z.enum(["ALBUM", "SINGLE", "EP"]).default("ALBUM"),
      isPremium:   z.boolean().default(false),
      genreIds:    z.array(z.string()).optional(),
    });
    const body = schema.parse(req.body);

    const artist = await prisma.artist.findUnique({ where: { userId: req.user!.id } });
    if (!artist) throw new AppError(404, "Artist profile not found");

    const slug = `${body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    const album = await prisma.album.create({
      data: {
        ...body,
        slug,
        artistId:    artist.id,
        releaseDate: new Date(body.releaseDate),
        genres:      body.genreIds ? { create: body.genreIds.map(gId => ({ genreId: gId })) } : undefined,
      },
      include: { artist: { select: { id: true, name: true, slug: true, verified: true } } },
    });

    res.status(201).json({ success: true, data: album });
  } catch (err) { next(err); }
});

// PATCH /api/albums/:id
router.patch("/:id", authenticate, requireRole("ARTIST", "ADMIN"), async (req: AuthRequest, res, next) => {
  try {
    const album = await prisma.album.findUnique({ where: { id: req.params.id }, include: { artist: true } });
    if (!album) throw new AppError(404, "Album not found");
    if (album.artist.userId !== req.user!.id && req.user!.role !== "ADMIN") throw new AppError(403, "Forbidden");

    const schema = z.object({
      title:       z.string().min(1).max(200).optional(),
      description: z.string().max(2000).optional(),
      coverUrl:    z.string().url().optional(),
      isPremium:   z.boolean().optional(),
    });
    const body    = schema.parse(req.body);
    const updated = await prisma.album.update({ where: { id: req.params.id }, data: body });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

// POST /api/albums/:id/publish
router.post("/:id/publish", authenticate, requireRole("ARTIST", "ADMIN"), async (req: AuthRequest, res, next) => {
  try {
    const album = await prisma.album.findUnique({ where: { id: req.params.id }, include: { artist: true, _count: { select: { tracks: true } } } });
    if (!album) throw new AppError(404, "Album not found");
    if (album.artist.userId !== req.user!.id && req.user!.role !== "ADMIN") throw new AppError(403, "Forbidden");
    if (album._count.tracks === 0) throw new AppError(400, "Cannot publish an album with no tracks");

    const updated = await prisma.album.update({ where: { id: req.params.id }, data: { isPublished: true } });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

// POST/DELETE /api/albums/:id/like
router.post("/:id/like", authenticate, async (req: AuthRequest, res, next) => {
  try {
    await prisma.albumLike.upsert({
      where:  { userId_albumId: { userId: req.user!.id, albumId: req.params.id } },
      update: {},
      create: { userId: req.user!.id, albumId: req.params.id },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.delete("/:id/like", authenticate, async (req: AuthRequest, res, next) => {
  try {
    await prisma.albumLike.deleteMany({ where: { userId: req.user!.id, albumId: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// DELETE /api/albums/:id
router.delete("/:id", authenticate, requireRole("ARTIST", "ADMIN"), async (req: AuthRequest, res, next) => {
  try {
    const album = await prisma.album.findUnique({ where: { id: req.params.id }, include: { artist: true } });
    if (!album) throw new AppError(404, "Album not found");
    if (album.artist.userId !== req.user!.id && req.user!.role !== "ADMIN") throw new AppError(403, "Forbidden");
    await prisma.album.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Album deleted" });
  } catch (err) { next(err); }
});

export default router;
