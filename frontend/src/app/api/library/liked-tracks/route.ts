import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { ok, requireAuth, route } from "@/lib/api-helpers";

export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const authUser = await requireAuth(req);
  const likes = await prisma.trackLike.findMany({
    where:   { userId: authUser.sub },
    orderBy: { likedAt: "desc" },
    include: { track: { include: { album: { select: { id: true, title: true, coverUrl: true } } } } },
  });
  return ok(likes.map(l => ({ ...l.track, likedAt: l.likedAt, isLiked: true })));
});
