import { Router } from "express";
import { prisma } from "../server";

const router = Router();

router.get("/featured", async (_req, res, next) => {
  try {
    const featured = await prisma.album.findMany({
      where:   { isPublished: true },
      orderBy: { playCount: "desc" },
      take:    5,
      include: { artist: { select: { id: true, name: true, slug: true } } },
    });
    res.json({ success: true, data: featured });
  } catch (err) { next(err); }
});

router.get("/new-releases", async (_req, res, next) => {
  try {
    const albums = await prisma.album.findMany({
      where:   { isPublished: true },
      orderBy: { releaseDate: "desc" },
      take:    10,
      include: { artist: { select: { id: true, name: true, slug: true, verified: true } } },
    });
    res.json({ success: true, data: albums });
  } catch (err) { next(err); }
});

export default router;
