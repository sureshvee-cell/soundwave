import { NextRequest } from "next/server";
import { z } from "zod";
import prisma  from "@/lib/db";
import { ok, requireAuth, route } from "@/lib/api-helpers";
export const dynamic = 'force-dynamic';
export const POST = route(async (req: NextRequest) => {
  await requireAuth(req);
  const body = await req.json().catch(() => ({}));
  const { refreshToken } = z.object({ refreshToken: z.string().optional() }).parse(body);
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } }).catch(() => {});
  }
  return ok({ message: "Logged out successfully" });
});
