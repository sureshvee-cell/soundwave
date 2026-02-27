import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { ok, err, parseSearchParams, route } from "@/lib/api-helpers";

export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const { q, limit } = parseSearchParams(req.nextUrl.searchParams, z.object({
    q:     z.string().min(1).max(100),
    limit: z.coerce.number().min(1).max(50).default(20),
  }));

  const [tracks, albums, artists] = await Promise.all([
    prisma.track.findMany({
      where: { title: { contains: q, mode: "insensitive" }, album: { isPublished: true } },
      take:  limit,
      include: { album: { select: { id: true, title: true, coverUrl: true } } },
    }),
    prisma.album.findMany({
      where: { OR: [{ title: { contains: q, mode: "insensitive" } }, { artist: { name: { contains: q, mode: "insensitive" } } }], isPublished: true },
      take:  limit,
      include: { artist: { select: { id: true, name: true, slug: true, verified: true } }, _count: { select: { tracks: true } } },
    }),
    prisma.artist.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      take:  limit,
      include: { _count: { select: { followers: true } } },
    }),
  ]);

  return ok({ tracks, albums, artists });
});
