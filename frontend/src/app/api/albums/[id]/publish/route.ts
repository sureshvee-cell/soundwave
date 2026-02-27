import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { ok, err, requireRole, route } from "@/lib/api-helpers";

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

export const POST = route(async (req: NextRequest, { params }: Ctx) => {
  const authUser = await requireRole(req, "ARTIST", "ADMIN");
  const album = await prisma.album.findUnique({
    where:   { id: params.id },
    include: { artist: true, _count: { select: { tracks: true } } },
  });
  if (!album) return err("Album not found", 404);
  if (album.artist.userId !== authUser.sub && authUser.role !== "ADMIN") return err("Forbidden", 403);
  if (album._count.tracks === 0) return err("Cannot publish an album with no tracks", 400);

  const updated = await prisma.album.update({ where: { id: params.id }, data: { isPublished: true } });
  return ok(updated);
});
