import { NextRequest } from "next/server";
import { z } from "zod";
import prisma  from "@/lib/db";
import { ok, err, parseBody, signAccess, signRefresh, verifyRefresh, route } from "@/lib/api-helpers";

export const dynamic = 'force-dynamic';

export const POST = route(async (req: NextRequest) => {
  const { refreshToken } = await parseBody(req, z.object({ refreshToken: z.string() }));

  let payload;
  try {
    payload = await verifyRefresh(refreshToken);
  } catch {
    return err("Invalid refresh token", 401);
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.expiresAt < new Date()) {
    return err("Refresh token expired or revoked", 401);
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) return err("User not found", 401);

  // Rotate tokens
  await prisma.refreshToken.delete({ where: { token: refreshToken } });
  const [newAccess, newRefresh] = await Promise.all([
    signAccess(user.id, user.role, user.email),
    signRefresh(user.id),
  ]);
  await prisma.refreshToken.create({
    data: { token: newRefresh, userId: user.id, expiresAt: new Date(Date.now() + 7 * 86400000) },
  });

  return ok({ accessToken: newAccess, refreshToken: newRefresh, expiresIn: 3600 });
});
