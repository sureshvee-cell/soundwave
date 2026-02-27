import prisma from "@/lib/db";
import { ok, route } from "@/lib/api-helpers";

export const GET = route(async () => {
  const genres = await prisma.genre.findMany({ orderBy: { name: "asc" } });
  return ok(genres);
});
