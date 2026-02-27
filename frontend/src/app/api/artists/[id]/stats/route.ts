import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { ok, err, requireAuth, route } from "@/lib/api-helpers";

type Ctx = { params: { id: string } };

export const GET = route(async (req: NextRequest, { params }: Ctx) => {
  const authUser = await requireAuth(req);
  const artist = await prisma.artist.findFirst({
    where: { OR: [{ id: params.id }, { userId: authUser.sub }] },
  });
  if (!artist) return err("Artist not found", 404);
  if (artist.userId !== authUser.sub && authUser.role !== "ADMIN") return err("Forbidden", 403);

  const artistTrackIds = await prisma.track.findMany({
    where:  { artistId: artist.id },
    select: { id: true },
  });
  const trackIds = artistTrackIds.map(t => t.id);

  const [totalStreams, followerCount, albumCount] = await Promise.all([
    prisma.streamLog.count({ where: { trackId: { in: trackIds } } }),
    prisma.artistFollow.count({ where: { artistId: artist.id } }),
    prisma.album.count({ where: { artistId: artist.id, isPublished: true } }),
  ]);

  return ok({ totalStreams, monthlyListeners: artist.monthlyListeners, followers: followerCount, albumCount });
});
