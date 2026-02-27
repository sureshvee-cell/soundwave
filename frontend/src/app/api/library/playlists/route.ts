import { NextRequest } from "next/server";
import { z } from "zod";
import prisma  from "@/lib/db";
import { ok, created, parseBody, requireAuth, route } from "@/lib/api-helpers";

export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const authUser = await requireAuth(req);
  const playlists = await prisma.playlist.findMany({
    where:   { userId: authUser.sub },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { tracks: true } } },
  });
  return ok(playlists.map(p => ({ ...p, trackCount: p._count.tracks })));
});

export const POST = route(async (req: NextRequest) => {
  const authUser = await requireAuth(req);
  const { name, description } = await parseBody(req, z.object({
    name:        z.string().min(1).max(100),
    description: z.string().max(500).optional(),
  }));
  const playlist = await prisma.playlist.create({
    data: { userId: authUser.sub, name, description },
  });
  return created(playlist);
});
