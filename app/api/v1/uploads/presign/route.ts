import { NextRequest } from "next/server";
import { z } from "zod";
import { apiData, apiError, apiValidationError } from "@/lib/api/response";
import { currentActor } from "@/lib/auth/session";
import { rateLimit } from "@/lib/cache/redis";
import { createUpload } from "@/lib/storage/upload.service";
const schema = z.object({
  kind: z.enum(["EVENT", "PLACE", "USER", "CATEGORY"]),
  entityId: z.string().cuid().optional(),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"], {
    message: "Formato no permitido. Usa JPG, PNG o WebP.",
  }),
  size: z
    .number()
    .int()
    .positive()
    .max(5 * 1024 * 1024, "La imagen no puede superar 5 MB."),
  filename: z.string().max(255),
});
export async function POST(request: NextRequest) {
  const actor = await currentActor();
  if (!actor) return apiError("Unauthorized", 401);
  const rate = await rateLimit(`upload:${actor.id}`, 30, 3600);
  if (!rate.allowed) return apiError("Too many requests", 429);
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return apiValidationError("Datos de imagen inválidos.", input.error.issues);
  try {
    return apiData(await createUpload({ ownerId: actor.id, ...input.data }), 201);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_SIZE")
      return apiError("La imagen no puede superar 5 MB.", 422);
    if (error instanceof Error && error.message === "INVALID_FORMAT")
      return apiError("Formato no permitido. Usa JPG, PNG o WebP.", 422);
    return apiError("No fue posible preparar la subida.", 500);
  }
}
