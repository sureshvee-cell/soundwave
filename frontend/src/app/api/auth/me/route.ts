import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { ok, err, requireAuth, route } from "@/lib/api-helpers";

export const GET = route(async (req: NextRequest) => {
  const authUser = await requireAuth(req);
  const user = await prisma.user.findUnique({
    where:   { id: authUser.sub },
    include: { subscription: true, artist: { select: { id: true, slug: true, verified: true } } },
  });
  if (!user) return err("User not found", 404);
  const { passwordHash: _, ...safeUser } = user;
  return ok(safeUser);
});
