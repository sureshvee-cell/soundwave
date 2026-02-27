import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { ok, err, getAuthUser, route } from "@/lib/api-helpers";

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

export const GET = route(async (req: NextRequest, { params }: Ctx) => {
  const authUser = await getAuthUser(req);
  const track = await prisma.track.findUnique({
    where:   { id: params.id },
    include: { album: { select: { id: true, title: true, coverUrl: true, isPremium: true } } },
  });
  if (!track) return err("Track not found", 404);

  let isLiked = false;
  if (authUser) {
    const like = await prisma.trackLike.findUnique({
      where: { userId_trackId: { userId: authUser.sub, trackId: track.id } },
    });
    isLiked = !!like;
  }
  return ok({ ...track, isLiked });
});
