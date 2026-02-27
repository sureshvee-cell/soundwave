import prisma from "@/lib/db";
import { ok, route } from "@/lib/api-helpers";

export const GET = route(async () => {
  const plans = await prisma.subscriptionPlan.findMany({
    where:   { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return ok(plans);
});
