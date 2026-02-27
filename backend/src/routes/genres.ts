import { Router } from "express";
import { prisma } from "../server";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const genres = await prisma.genre.findMany({ orderBy: { name: "asc" } });
    res.json({ success: true, data: genres });
  } catch (err) { next(err); }
});

export default router;
