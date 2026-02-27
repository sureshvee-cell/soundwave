import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { ok, route } from "@/lib/api-helpers";

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

export const POST = route(async (_req: NextRequest, { params }: Ctx) => {
  await prisma.track.update({
    where: { id: params.id },
    data:  { playCount: { increment: 1 } },
  }).catch(() => {}); // best-effort
  return ok({ recorded: true });
});
