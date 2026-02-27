import prisma from "@/lib/db";
import { ok, route } from "@/lib/api-helpers";

export const GET = route(async () => {
  const albums = await prisma.album.findMany({
    where:   { isPublished: true },
    orderBy: { playCount: "desc" },
    take:    20,
    include: {
      artist: { select: { id: true, name: true, slug: true, verified: true } },
      _count: { select: { tracks: true, likes: true } },
    },
  });
  return ok(albums.map(a => ({ ...a, trackCount: a._count.tracks, likeCount: a._count.likes })));
});
