import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { ok, parseSearchParams, route } from "@/lib/api-helpers";

export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const { page, limit, genre } = parseSearchParams(
    req.nextUrl.searchParams,
    z.object({
      page:  z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(50).default(20),
      genre: z.string().optional(),
    })
  );

  const where = genre ? { genres: { some: { genre: { slug: genre } } } } : {};
  const [artists, total] = await Promise.all([
    prisma.artist.findMany({
      where,
      orderBy: { monthlyListeners: "desc" },
      skip:    (page - 1) * limit,
      take:    limit,
      include: {
        genres: { include: { genre: true } },
        _count: { select: { followers: true, albums: true } },
      },
    }),
    prisma.artist.count({ where }),
  ]);

  return ok({ items: artists, total, page, limit, hasMore: page * limit < total });
});
