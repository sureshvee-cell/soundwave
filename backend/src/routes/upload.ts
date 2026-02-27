import { Router }     from "express";
import multer          from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { prisma }      from "../server";
import { authenticate, requireRole, type AuthRequest } from "../middleware/auth";
import { AppError }    from "../middleware/errorHandler";

const router = Router();

const s3 = new S3Client({
  region:      process.env.AWS_REGION!,
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const ALLOWED_AUDIO = ["audio/mpeg", "audio/wav", "audio/flac", "audio/aac", "audio/ogg"];
const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp"];

const storage = multer.memoryStorage();
const upload  = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max
  fileFilter(_req, file, cb) {
    if ([...ALLOWED_AUDIO, ...ALLOWED_IMAGE].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(400, `File type not allowed: ${file.mimetype}`));
    }
  },
});

async function uploadToS3(buffer: Buffer, key: string, contentType: string): Promise<string> {
  await s3.send(new PutObjectCommand({
    Bucket:      process.env.S3_BUCKET!,
    Key:         key,
    Body:        buffer,
    ContentType: contentType,
    ACL:         "public-read",
  }));
  return `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

// POST /api/upload/cover — upload album cover art
router.post("/cover", authenticate, requireRole("ARTIST", "ADMIN"), upload.single("file"), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file) throw new AppError(400, "No file uploaded");
    if (!ALLOWED_IMAGE.includes(req.file.mimetype)) throw new AppError(400, "Only images are allowed");

    const key = `covers/${uuidv4()}.${req.file.originalname.split(".").pop()}`;
    const url = await uploadToS3(req.file.buffer, key, req.file.mimetype);

    res.json({ success: true, data: { url } });
  } catch (err) { next(err); }
});

// POST /api/albums/:albumId/tracks — upload a track
router.post("/tracks/:albumId", authenticate, requireRole("ARTIST", "ADMIN"), upload.single("audio"), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file) throw new AppError(400, "No audio file uploaded");
    if (!ALLOWED_AUDIO.includes(req.file.mimetype)) throw new AppError(400, "Only audio files allowed");

    const album = await prisma.album.findUnique({
      where:   { id: req.params.albumId },
      include: { artist: true },
    });
    if (!album) throw new AppError(404, "Album not found");
    if (album.artist.userId !== req.user!.id) throw new AppError(403, "Forbidden");

    const { title, trackNumber, duration, isPremium, isExplicit } = req.body;

    const key = `audio/${uuidv4()}.${req.file.originalname.split(".").pop()}`;
    const audioUrl = await uploadToS3(req.file.buffer, key, req.file.mimetype);

    const slug  = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    const track = await prisma.track.create({
      data: {
        albumId:     album.id,
        artistId:    album.artistId,
        title,
        slug,
        audioUrl,
        duration:    parseInt(duration) || 0,
        trackNumber: parseInt(trackNumber) || 1,
        isPremium:   isPremium === "true",
        isExplicit:  isExplicit === "true",
      },
    });

    res.status(201).json({ success: true, data: track });
  } catch (err) { next(err); }
});

export default router;
