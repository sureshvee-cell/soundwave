import prisma from "@/lib/db";
import { ok, route } from "@/lib/api-helpers";

export const GET = route(async () => {
  const tracks = await prisma.track.findMany({
    where:   { album: { isPublished: true } },
    orderBy: { playCount: "desc" },
    take:    50,
    include: { album: { select: { id: true, title: true, coverUrl: true } } },
  });
  return ok(tracks);
});
