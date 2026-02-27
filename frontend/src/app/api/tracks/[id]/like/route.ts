import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { ok, requireAuth, route } from "@/lib/api-helpers";

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

export const POST = route(async (req: NextRequest, { params }: Ctx) => {
  const authUser = await requireAuth(req);
  await prisma.trackLike.upsert({
    where:  { userId_trackId: { userId: authUser.sub, trackId: params.id } },
    update: {},
    create: { userId: authUser.sub, trackId: params.id },
  });
  return ok({ liked: true });
});

export const DELETE = route(async (req: NextRequest, { params }: Ctx) => {
  const authUser = await requireAuth(req);
  await prisma.trackLike.deleteMany({ where: { userId: authUser.sub, trackId: params.id } });
  return ok({ liked: false });
});
