import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z }  from "zod";
import prisma  from "@/lib/db";
import { ok, created, err, parseBody, signAccess, signRefresh, route } from "@/lib/api-helpers";

const schema = z.object({
  email:       z.string().email(),
  password:    z.string().min(8).max(100),
  username:    z.string().min(3).max(30).regex(/^[a-z0-9_]+$/i),
  displayName: z.string().min(1).max(50),
  role:        z.enum(["LISTENER", "ARTIST"]).default("LISTENER"),
});

export const POST = route(async (req: NextRequest) => {
  const body = await parseBody(req, schema);

  // Check uniqueness
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: body.email.toLowerCase() }, { username: body.username.toLowerCase() }] },
  });
  if (existing) return err("Email or username already taken", 409);

  const passwordHash = await bcrypt.hash(body.password, 12);

  const user = await prisma.user.create({
    data: {
      email:       body.email.toLowerCase(),
      username:    body.username.toLowerCase(),
      displayName: body.displayName,
      passwordHash,
      role:        body.role,
      subscription: { create: { tier: "FREE", status: "ACTIVE" } },
      ...(body.role === "ARTIST" ? {
        artist: { create: { name: body.displayName, slug: body.username.toLowerCase() } }
      } : {}),
    },
    include: { subscription: true, artist: true },
  });

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
