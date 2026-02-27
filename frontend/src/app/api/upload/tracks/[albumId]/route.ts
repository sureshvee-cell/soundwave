/**
 * Audio Track Upload — uses Vercel Blob Storage
 * Large audio files (up to 500MB) are supported via Vercel Blob.
 *
 * Vercel serverless functions have a 4.5MB body limit — to upload
 * large files, use the client-side multipart approach with
 * @vercel/blob's `upload()` client helper, OR use server-side
 * streaming as shown here.
 *
 * For production large-file uploads, consider using Vercel Blob's
 * client-side upload pattern: https://vercel.com/docs/storage/vercel-blob/client-upload
 */

import { NextRequest } from "next/server";
import { put }   from "@vercel/blob";
import { z }     from "zod";
import prisma    from "@/lib/db";
import { ok, err, parseBody, requireRole, route } from "@/lib/api-helpers";

type Ctx = { params: { albumId: string } };

export const POST = route(async (req: NextRequest, { params }: Ctx) => {
  const authUser = await requireRole(req, "ARTIST", "ADMIN");

  const album = await prisma.album.findUnique({
    where:   { id: params.albumId },
    include: { artist: true },
  });
  if (!album)                                    return err("Album not found", 404);
  if (album.artist.userId !== authUser.sub && authUser.role !== "ADMIN") return err("Forbidden", 403);

  const formData = await req.formData();
  const audio    = formData.get("audio") as File | null;
  if (!audio) return err("No audio file provided", 400);

  const allowed  = ["audio/mpeg", "audio/wav", "audio/flac", "audio/aac", "audio/ogg", "audio/x-wav"];
  if (!allowed.includes(audio.type)) return err(`Audio type not allowed: ${audio.type}`, 400);

  // Parse track metadata from form fields
  const meta = z.object({
    title:       z.string().min(1).max(200),
    trackNumber: z.coerce.number().min(1).default(1),
    duration:    z.coerce.number().min(1),
    isPremium:   z.enum(["true", "false"]).transform(v => v === "true").default("false"),
    isExplicit:  z.enum(["true", "false"]).transform(v => v === "true").default("false"),
  }).parse(Object.fromEntries(formData.entries()));

  const ext      = audio.name.split(".").pop() ?? "mp3";
  const filename = `audio/${params.albumId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const blob = await put(filename, audio, {
    access:      "public",
    contentType: audio.type,
  });

  const slug  = `${meta.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
  const track = await prisma.track.create({
    data: {
      albumId:     album.id,
      artistId:    album.artistId,
      title:       meta.title,
      slug,
      audioUrl:    blob.url,
      duration:    meta.duration,
      trackNumber: meta.trackNumber,
      isPremium:   meta.isPremium,
      isExplicit:  meta.isExplicit,
    },
  });

  return ok(track, 201);
});
