import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { ok, err, requireAuth, route } from "@/lib/api-helpers";

type Ctx = { params: { id: string } };

export const GET = route(async (req: NextRequest, { params }: Ctx) => {
  const authUser = await requireAuth(req);

  const track = await prisma.track.findUnique({
    where:   { id: params.id },
    include: { album: true },
  });
  if (!track) return err("Track not found", 404);

  // Premium gate: check if track/album is premium and user has subscription
  if (track.isPremium || track.album.isPremium) {
    const sub = await prisma.subscription.findUnique({ where: { userId: authUser.sub } });
    const hasPremium = sub && sub.status === "ACTIVE" && sub.tier !== "FREE";

    if (!hasPremium) {
      // Return 30-second preview URL for free users
      return ok({ url: track.previewUrl ?? null, isPreview: true });
    }
  }

  // Log play asynchronously (don't block the response)
  prisma.streamLog.create({
    data: {
      trackId:    track.id,
      userId:     authUser.sub,
      platform:   req.headers.get("x-platform") ?? "web",
      durationMs: 0,
    },
  }).catch(console.error);

  // In production with Vercel Blob: the audioUrl IS the public blob URL
  // For signed private blobs use: getDownloadUrl(track.audioUrl)
  return ok({ url: track.audioUrl, isPreview: false });
});
