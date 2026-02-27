import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { ok, requireAuth, route } from "@/lib/api-helpers";

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

export const POST = route(async (req: NextRequest, { params }: Ctx) => {
  const authUser = await requireAuth(req);
  await prisma.artistFollow.upsert({
    where:  { userId_artistId: { userId: authUser.sub, artistId: params.id } },
    update: {},
    create: { userId: authUser.sub, artistId: params.id },
  });
  return ok({ following: true });
});

export const DELETE = route(async (req: NextRequest, { params }: Ctx) => {
  const authUser = await requireAuth(req);
  await prisma.artistFollow.deleteMany({ where: { userId: authUser.sub, artistId: params.id } });
  return ok({ following: false });
});
