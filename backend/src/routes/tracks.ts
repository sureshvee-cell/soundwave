import { Router }  from "express";
import { z }       from "zod";
import { prisma }  from "../server";
import { authenticate, optionalAuth, type AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// GET /api/tracks/charts
router.get("/charts", async (_req, res, next) => {
  try {
    const tracks = await prisma.track.findMany({
      where:   { album: { isPublished: true } },
      orderBy: { playCount: "desc" },
      take:    50,
      include: {
        album:  { select: { id: true, title: true, coverUrl: true } },
        genre:  true,
      },
    });
    res.json({ success: true, data: tracks });
  } catch (err) { next(err); }
});

// GET /api/tracks/:id
router.get("/:id", optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const track = await prisma.track.findUnique({
      where:   { id: req.params.id },
      include: {
        album:  { select: { id: true, title: true, coverUrl: true, isPremium: true, artistId: true } },
        genre:  true,
      },
    });
    if (!track) throw new AppError(404, "Track not found");

    let isLiked = false;
    if (req.user) {
      const like = await prisma.trackLike.findUnique({
        where: { userId_trackId: { userId: req.user.id, trackId: track.id } },
      });
      isLiked = !!like;
    }

    res.json({ success: true, data: { ...track, isLiked } });
  } catch (err) { next(err); }
});

// GET /api/tracks/:id/stream — return signed stream URL
router.get("/:id/stream", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const track = await prisma.track.findUnique({
      where:   { id: req.params.id },
      include: { album: true },
    });
    if (!track) throw new AppError(404, "Track not found");

    // Check premium access
    if (track.isPremium || track.album.isPremium) {
      const sub = await prisma.subscription.findUnique({ where: { userId: req.user!.id } });
      if (!sub || sub.status !== "ACTIVE" || sub.tier === "FREE") {
        // Return preview URL for free users
        return res.json({
          success: true,
          data: { url: track.previewUrl || null, isPreview: true },
        });
      }
    }

    // Log stream
    prisma.streamLog.create({
      data: {
        trackId:    track.id,
        userId:     req.user!.id,
        platform:   req.headers["x-platform"] as string || "web",
        durationMs: 0, // updated client-side
      },
    }).catch(() => {});

    // In production: generate signed S3 URL
    // const url = await generateSignedUrl(track.audioUrl, 3600);
    res.json({ success: true, data: { url: track.audioUrl, isPreview: false } });
  } catch (err) { next(err); }
});

// POST /api/tracks/:id/play — increment play count
router.post("/:id/play", optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    await prisma.track.update({
      where: { id: req.params.id },
      data:  { playCount: { increment: 1 } },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// POST/DELETE /api/tracks/:id/like
router.post("/:id/like", authenticate, async (req: AuthRequest, res, next) => {
  try {
    await prisma.trackLike.upsert({
      where:  { userId_trackId: { userId: req.user!.id, trackId: req.params.id } },
      update: {},
      create: { userId: req.user!.id, trackId: req.params.id },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.delete("/:id/like", authenticate, async (req: AuthRequest, res, next) => {
  try {
    await prisma.trackLike.deleteMany({
      where: { userId: req.user!.id, trackId: req.params.id },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// DELETE /api/tracks/:id
router.delete("/:id", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const track = await prisma.track.findUnique({
      where:   { id: req.params.id },
      include: { album: { include: { artist: true } } },
    });
    if (!track) throw new AppError(404, "Track not found");
    if (track.album.artist.userId !== req.user!.id && req.user!.role !== "ADMIN") {
      throw new AppError(403, "Forbidden");
    }
    await prisma.track.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Track deleted" });
  } catch (err) { next(err); }
});

export default router;
