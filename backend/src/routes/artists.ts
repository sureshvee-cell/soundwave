import { Router } from "express";
import { z }      from "zod";
import { prisma } from "../server";
import { authenticate, optionalAuth, type AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// GET /api/artists
router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 20, genre } = z.object({
      page:  z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(50).default(20),
      genre: z.string().optional(),
    }).parse(req.query);

    const where = genre ? { genres: { some: { genre: { slug: genre } } } } : {};
    const [artists, total] = await Promise.all([
      prisma.artist.findMany({
        where,
        orderBy: { monthlyListeners: "desc" },
        skip:    (page - 1) * limit,
        take:    limit,
        include: {
          genres:  { include: { genre: true } },
          _count:  { select: { followers: true, albums: true } },
        },
      }),
      prisma.artist.count({ where }),
    ]);

    res.json({
      success: true,
      data: { items: artists, total, page, limit, hasMore: page * limit < total },
    });
  } catch (err) { next(err); }
});

// GET /api/artists/:id
router.get("/:id", optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const artist = await prisma.artist.findFirst({
      where: { OR: [{ id: req.params.id }, { slug: req.params.id }] },
      include: {
        genres:  { include: { genre: true } },
        albums:  {
          where:   { isPublished: true },
          orderBy: { releaseDate: "desc" },
          include: { _count: { select: { tracks: true } } },
        },
        _count:  { select: { followers: true } },
      },
    });
    if (!artist) throw new AppError(404, "Artist not found");

    let isFollowing = false;
    if (req.user) {
      const follow = await prisma.artistFollow.findUnique({
        where: { userId_artistId: { userId: req.user.id, artistId: artist.id } },
      });
      isFollowing = !!follow;
    }

    res.json({
      success: true,
      data: { ...artist, followerCount: artist._count.followers, isFollowing },
    });
  } catch (err) { next(err); }
});

// POST /api/artists/:id/follow
router.post("/:id/follow", authenticate, async (req: AuthRequest, res, next) => {
  try {
    await prisma.artistFollow.upsert({
      where:  { userId_artistId: { userId: req.user!.id, artistId: req.params.id } },
      update: {},
      create: { userId: req.user!.id, artistId: req.params.id },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.delete("/:id/follow", authenticate, async (req: AuthRequest, res, next) => {
  try {
    await prisma.artistFollow.deleteMany({
      where: { userId: req.user!.id, artistId: req.params.id },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// GET /api/artists/:id/stats (artist dashboard)
router.get("/:id/stats", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const artist = await prisma.artist.findFirst({
      where: { OR: [{ id: req.params.id }, { userId: req.user!.id }] },
    });
    if (!artist) throw new AppError(404, "Artist not found");
    if (artist.userId !== req.user!.id && req.user!.role !== "ADMIN") throw new AppError(403, "Forbidden");

    const [totalStreams, followerCount, albumCount] = await Promise.all([
      prisma.streamLog.count({ where: { track: { artistId: artist.id } } }),
      prisma.artistFollow.count({ where: { artistId: artist.id } }),
      prisma.album.count({ where: { artistId: artist.id, isPublished: true } }),
    ]);

    res.json({
      success: true,
      data: {
        totalStreams,
        monthlyListeners: artist.monthlyListeners,
        followers:        followerCount,
        albumCount,
      },
    });
  } catch (err) { next(err); }
});

export default router;
