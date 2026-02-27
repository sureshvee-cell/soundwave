import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { ok, err, parseBody, getAuthUser, requireRole, route } from "@/lib/api-helpers";

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

// GET /api/albums/[id]
export const GET = route(async (req: NextRequest, { params }: Ctx) => {
  const authUser = await getAuthUser(req);
  const album = await prisma.album.findFirst({
    where:   { OR: [{ id: params.id }, { slug: params.id }], isPublished: true },
    include: {
      artist: { select: { id: true, name: true, slug: true, verified: true, avatarUrl: true } },
      tracks: { orderBy: [{ discNumber: "asc" }, { trackNumber: "asc" }] },
      _count: { select: { likes: true } },
    },
  });
  if (!album) return err("Album not found", 404);

  let isLiked = false;
  if (authUser) {
    const like = await prisma.albumLike.findUnique({
      where: { userId_albumId: { userId: authUser.sub, albumId: album.id } },
    });
    isLiked = !!like;
  }
  return ok({ ...album, likeCount: album._count.likes, isLiked });
});

// PATCH /api/albums/[id]
export const PATCH = route(async (req: NextRequest, { params }: Ctx) => {
  const authUser = await requireRole(req, "ARTIST", "ADMIN");
  const album = await prisma.album.findUnique({ where: { id: params.id }, include: { artist: true } });
  if (!album)                                            return err("Album not found", 404);
  if (album.artist.userId !== authUser.sub && authUser.role !== "ADMIN") return err("Forbidden", 403);

  const body = await parseBody(req, z.object({
    title:       z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    coverUrl:    z.string().url().optional(),
    isPremium:   z.boolean().optional(),
  }));

  const updated = await prisma.album.update({ where: { id: params.id }, data: body });
  return ok(updated);
});

// DELETE /api/albums/[id]
export const DELETE = route(async (req: NextRequest, { params }: Ctx) => {
  const authUser = await requireRole(req, "ARTIST", "ADMIN");
  const album = await prisma.album.findUnique({ where: { id: params.id }, include: { artist: true } });
  if (!album)                                            return err("Album not found", 404);
  if (album.artist.userId !== authUser.sub && authUser.role !== "ADMIN") return err("Forbidden", 403);

  await prisma.album.delete({ where: { id: params.id } });
  return ok({ message: "Album deleted" });
});
