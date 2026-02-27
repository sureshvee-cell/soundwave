import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { ok, requireAuth, route } from "@/lib/api-helpers";

type Ctx = { params: { id: string } };

export const POST = route(async (req: NextRequest, { params }: Ctx) => {
  const authUser = await requireAuth(req);
  await prisma.albumLike.upsert({
    where:  { userId_albumId: { userId: authUser.sub, albumId: params.id } },
    update: {},
    create: { userId: authUser.sub, albumId: params.id },
  });
  return ok({ liked: true });
});

export const DELETE = route(async (req: NextRequest, { params }: Ctx) => {
  const authUser = await requireAuth(req);
  await prisma.albumLike.deleteMany({ where: { userId: authUser.sub, albumId: params.id } });
  return ok({ liked: false });
});
