/**
 * Cover Art Upload — uses Vercel Blob Storage
 * Replaces the AWS S3 upload from the Express backend.
 *
 * Vercel Blob gives you a globally CDN-distributed object store
 * with a simple API. Files are publicly readable by default.
 */

import { NextRequest } from "next/server";
import { put }         from "@vercel/blob";
import { ok, err, requireRole, route } from "@/lib/api-helpers";

export const POST = route(async (req: NextRequest) => {
  await requireRole(req, "ARTIST", "ADMIN");

  const formData = await req.formData();
  const file     = formData.get("file") as File | null;

  if (!file) return err("No file provided", 400);

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) return err(`File type not allowed: ${file.type}`, 400);
  if (file.size > 10 * 1024 * 1024) return err("File too large (max 10MB)", 400);

  const ext      = file.name.split(".").pop() ?? "jpg";
  const filename = `covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const blob = await put(filename, file, {
    access:      "public",
    contentType: file.type,
  });

  return ok({ url: blob.url, pathname: blob.pathname });
});

// Next.js App Router config — required for file uploads
export const config = { api: { bodyParser: false } };
