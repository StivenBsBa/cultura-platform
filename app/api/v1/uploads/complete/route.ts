import { NextRequest } from "next/server";
import { z } from "zod";
import { apiData, apiError } from "@/lib/api/response";
import { currentActor } from "@/lib/auth/session";
import { mediaRepository } from "@/lib/repositories/media.repository";
import { inspectUploadedImage, verifyUploadedObject } from "@/lib/storage/upload.service";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/lib/storage/upload.service";
const schema = z.object({ objectKey: z.string().min(1), alt: z.string().max(250).optional() });
export async function POST(request: NextRequest) {
  const actor = await currentActor();
  if (!actor) return apiError("Unauthorized", 401);
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success || !input.data.objectKey.match(new RegExp(`^[a-z]+/${actor.id}/`)))
    return apiError("Invalid object", 422);
  const object = await verifyUploadedObject(input.data.objectKey);
  if (!object) return apiError("Object not found", 404);
  if (
    !object.ContentType ||
    !ALLOWED_IMAGE_TYPES.includes(object.ContentType as (typeof ALLOWED_IMAGE_TYPES)[number])
  )
    return apiError("Formato no permitido. Usa JPG, PNG o WebP.", 422);
  if (!object.ContentLength || object.ContentLength > MAX_IMAGE_SIZE)
    return apiError("La imagen no puede superar 5 MB.", 422);
  const existing = await mediaRepository.findByObjectKey(input.data.objectKey);
  if (existing) {
    if (existing.ownerId !== actor.id) return apiError("Invalid object", 422);
    return apiData(existing);
  }
  let dimensions: { width: number | null; height: number | null };
  try {
    dimensions = await inspectUploadedImage(input.data.objectKey, object.ContentType);
  } catch {
    return apiError("El archivo no coincide con el formato de imagen declarado.", 422);
  }
  return apiData(
    await mediaRepository.create({
      url: `/api/v1/uploads/object?key=${encodeURIComponent(input.data.objectKey)}`,
      objectKey: input.data.objectKey,
      alt: input.data.alt,
      mimeType: object.ContentType,
      size: object.ContentLength,
      width: dimensions.width,
      height: dimensions.height,
      provider: "RUSTFS",
      ownerId: actor.id,
    }),
    201,
  );
}
