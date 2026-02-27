import { Router } from "express";
import { z }      from "zod";
import { prisma } from "../server";
import { authenticate, type AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/library/liked-tracks
router.get("/liked-tracks", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const likes = await prisma.trackLike.findMany({
      where:   { userId: req.user!.id },
      orderBy: { likedAt: "desc" },
      include: { track: { include: { album: { select: { id: true, title: true, coverUrl: true } } } } },
    });
    res.json({ success: true, data: likes.map(l => ({ ...l.track, likedAt: l.likedAt })) });
  } catch (err) { next(err); }
});

// GET /api/library/liked-albums
router.get("/liked-albums", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const likes = await prisma.albumLike.findMany({
      where:   { userId: req.user!.id },
      orderBy: { likedAt: "desc" },
      include: { album: { include: { artist: { select: { id: true, name: true, slug: true, verified: true } }, _count: { select: { tracks: true } } } } },
    });
    res.json({ success: true, data: likes.map(l => ({ ...l.album, likedAt: l.likedAt })) });
  } catch (err) { next(err); }
});

// GET /api/library/recently-played
router.get("/recently-played", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const recent = await prisma.recentlyPlayed.findMany({
      where:   { userId: req.user!.id },
      orderBy: { playedAt: "desc" },
      take:    50,
      distinct: ["trackId"],
      include: {
        track: { include: { album: { select: { id: true, title: true, coverUrl: true } } } },
      },
    });
    res.json({ success: true, data: recent });
  } catch (err) { next(err); }
});

// GET /api/library/playlists
router.get("/playlists", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const playlists = await prisma.playlist.findMany({
      where:   { userId: req.user!.id },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { tracks: true } } },
    });
    res.json({ success: true, data: playlists });
  } catch (err) { next(err); }
});

// POST /api/library/playlists
router.post("/playlists", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { name, description } = z.object({
      name:        z.string().min(1).max(100),
      description: z.string().max(500).optional(),
    }).parse(req.body);

    const playlist = await prisma.playlist.create({
      data: { userId: req.user!.id, name, description },
    });
    res.status(201).json({ success: true, data: playlist });
  } catch (err) { next(err); }
});

// POST /api/library/playlists/:id/tracks
router.post("/playlists/:id/tracks", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { trackId } = z.object({ trackId: z.string() }).parse(req.body);
    const count = await prisma.playlistTrack.count({ where: { playlistId: req.params.id } });
    await prisma.playlistTrack.upsert({
      where:  { playlistId_trackId: { playlistId: req.params.id, trackId } },
      update: {},
      create: { playlistId: req.params.id, trackId, position: count + 1 },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// DELETE /api/library/playlists/:id/tracks/:trackId
router.delete("/playlists/:id/tracks/:trackId", authenticate, async (req: AuthRequest, res, next) => {
  try {
    await prisma.playlistTrack.deleteMany({
      where: { playlistId: req.params.id, trackId: req.params.trackId },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// GET /api/library/followed-artists
router.get("/followed-artists", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const follows = await prisma.artistFollow.findMany({
      where:   { userId: req.user!.id },
      include: { artist: { include: { _count: { select: { followers: true } } } } },
      orderBy: { followedAt: "desc" },
    });
    res.json({ success: true, data: follows.map(f => f.artist) });
  } catch (err) { next(err); }
});

export default router;
