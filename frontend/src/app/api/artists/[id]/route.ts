import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { ok, err, getAuthUser, route } from "@/lib/api-helpers";

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

export const GET = route(async (req: NextRequest, { params }: Ctx) => {
  const authUser = await getAuthUser(req);
  const artist = await prisma.artist.findFirst({
    where:   { OR: [{ id: params.id }, { slug: params.id }] },
    include: {
      genres:  { include: { genre: true } },
      albums:  { where: { isPublished: true }, orderBy: { releaseDate: "desc" }, include: { _count: { select: { tracks: true } } } },
      _count:  { select: { followers: true } },
    },
  });
  if (!artist) return err("Artist not found", 404);

  let isFollowing = false;
  if (authUser) {
    const follow = await prisma.artistFollow.findUnique({
      where: { userId_artistId: { userId: authUser.sub, artistId: artist.id } },
    });
    isFollowing = !!follow;
  }
  return ok({ ...artist, followerCount: artist._count.followers, isFollowing });
});
