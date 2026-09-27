import { NextRequest } from "next/server";
import { z } from "zod";
import { getObject } from "@/lib/storage/s3";
import { mediaRepository } from "@/lib/repositories/media.repository";
const keySchema = z.string().regex(/^[a-z]+\/[a-z0-9]+\/[a-z0-9_-]+\/[a-f0-9-]+\.(jpg|png|webp)$/i);
export async function GET(request: NextRequest) {
  const mediaId = z.string().cuid().safeParse(request.nextUrl.searchParams.get("id"));
  const legacyKey = keySchema.safeParse(request.nextUrl.searchParams.get("key"));
  let key: string | null = null;
  if (mediaId.success) key = (await mediaRepository.findById(mediaId.data))?.objectKey ?? null;
  else if (legacyKey.success) {
    // Compatibilidad con URLs antiguas: una key sola no da acceso al bucket.
    // Debe existir una fila MediaAsset que la registre explícitamente.
    const media =
      (await mediaRepository.findByObjectKey(legacyKey.data)) ??
      (await mediaRepository.findByLegacyKey(legacyKey.data));
    key = media?.objectKey ?? (media ? legacyKey.data : null);
  }
  if (!key) return new Response("Not found", { status: 404 });
  try {
    const result = await getObject(key);
    if (!result.Body) return new Response("Not found", { status: 404 });
    return new Response(await result.Body.transformToWebStream(), {
      headers: {
        "Content-Type": result.ContentType ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
