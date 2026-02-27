import { Router } from "express";
import { z }      from "zod";
import { prisma } from "../server";

const router = Router();

// GET /api/search?q=query&limit=20
router.get("/", async (req, res, next) => {
  try {
    const { q, limit } = z.object({
      q:     z.string().min(1).max(100),
      limit: z.coerce.number().min(1).max(50).default(20),
    }).parse(req.query);

    const search = q.toLowerCase();

    const [tracks, albums, artists] = await Promise.all([
      prisma.track.findMany({
        where: {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
          ],
          album: { isPublished: true },
        },
        take:    limit,
        include: {
          album:  { select: { id: true, title: true, coverUrl: true } },
        },
      }),
      prisma.album.findMany({
        where: {
          OR: [
            { title:  { contains: search, mode: "insensitive" } },
            { artist: { name: { contains: search, mode: "insensitive" } } },
          ],
          isPublished: true,
        },
        take:    limit,
        include: {
          artist: { select: { id: true, name: true, slug: true, verified: true } },
          _count: { select: { tracks: true } },
        },
      }),
      prisma.artist.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { genres: { some: { genre: { name: { contains: search, mode: "insensitive" } } } } },
          ],
        },
        take:    limit,
        include: {
          _count: { select: { followers: true, albums: true } },
        },
      }),
    ]);

    res.json({ success: true, data: { tracks, albums, artists } });
  } catch (err) { next(err); }
});

export default router;
