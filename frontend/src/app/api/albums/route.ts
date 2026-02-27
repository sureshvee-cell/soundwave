import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { ok, created, err, parseBody, getAuthUser, requireRole, parseSearchParams, route } from "@/lib/api-helpers";

// GET /api/albums — paginated list with filters
export const GET = route(async (req: NextRequest) => {
  const authUser = await getAuthUser(req);
  const { page, limit, genre, sort, type } = parseSearchParams(
    req.nextUrl.searchParams,
    z.object({
      page:  z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(50).default(20),
      genre: z.string().optional(),
      sort:  z.enum(["popular", "recent", "title"]).default("popular"),
      type:  z.enum(["ALBUM", "SINGLE", "EP"]).optional(),
    })
  );

  const where: Record<string, unknown> = { isPublished: true };
  if (type)  where.type  = type;
  if (genre) where.genres = { some: { genre: { slug: genre } } };

  const orderBy = sort === "popular" ? { playCount: "desc" as const }
                : sort === "recent"  ? { releaseDate: "desc" as const }
                : { title: "asc" as const };

  const [albums, total] = await Promise.all([
    prisma.album.findMany({
      where, orderBy,
      skip:    (page - 1) * limit,
      take:    limit,
      include: {
        artist: { select: { id: true, name: true, slug: true, verified: true } },
        _count: { select: { tracks: true, likes: true } },
      },
    }),
    prisma.album.count({ where }),
  ]);

  let likedIds = new Set<string>();
  if (authUser) {
    const likes = await prisma.albumLike.findMany({
      where:  { userId: authUser.sub, albumId: { in: albums.map(a => a.id) } },
      select: { albumId: true },
    });
    likedIds = new Set(likes.map(l => l.albumId));
  }

  return ok({
    items:   albums.map(a => ({ ...a, trackCount: a._count.tracks, likeCount: a._count.likes, isLiked: likedIds.has(a.id) })),
    total, page, limit, hasMore: page * limit < total,
  });
});

// POST /api/albums — create (artist only)
export const POST = route(async (req: NextRequest) => {
  const authUser = await requireRole(req, "ARTIST", "ADMIN");
  const body = await parseBody(req, z.object({
    title:       z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    coverUrl:    z.string().url(),
    releaseDate: z.string(),
    type:        z.enum(["ALBUM", "SINGLE", "EP"]).default("ALBUM"),
    isPremium:   z.boolean().default(false),
    genreIds:    z.array(z.string()).optional(),
  }));

  const artist = await prisma.artist.findUnique({ where: { userId: authUser.sub } });
  if (!artist) return err("Artist profile not found", 404);

  const slug  = `${body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
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

  return created(album);
});
