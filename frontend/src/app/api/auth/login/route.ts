import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z }  from "zod";
import prisma  from "@/lib/db";
import { err, created, parseBody, signAccess, signRefresh, route } from "@/lib/api-helpers";

export const POST = route(async (req: NextRequest) => {
  const { email, password } = await parseBody(req, z.object({
    email:    z.string().email(),
    password: z.string().min(1),
  }));

  const user = await prisma.user.findUnique({
    where:   { email: email.toLowerCase() },
    include: { subscription: true, artist: true },
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return err("Invalid email or password", 401);
  }

  const [accessToken, refreshToken] = await Promise.all([
    signAccess(user.id, user.role, user.email),
    signRefresh(user.id),
  ]);
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 86400000) },
  });

  const { passwordHash: _, ...safeUser } = user;
  return created({ user: safeUser, tokens: { accessToken, refreshToken, expiresIn: 3600 } });
});
