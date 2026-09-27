import { NextRequest } from "next/server";
import { z } from "zod";
import { currentActor } from "@/lib/auth/session";
import { canManageUsers } from "@/lib/permissions";
import { apiData, apiError, apiValidationError } from "@/lib/api/response";
import { mediaRepository } from "@/lib/repositories/media.repository";
import { deleteObject } from "@/lib/storage/s3";
const schema = z.object({ id: z.string().cuid() });

const updateSchema = z.object({ alt: z.string().trim().max(180).nullable() });

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const actor = await currentActor();
  if (!actor || !canManageUsers(actor)) return apiError("Forbidden", 403);
  const id = schema.safeParse(await context.params);
  const data = updateSchema.safeParse(await request.json().catch(() => null));
  if (!id.success) return apiValidationError("Identificador inválido.", id.error.issues);
  if (!data.success) return apiValidationError("Revisa la descripción.", data.error.issues);
  try {
    return apiData(await mediaRepository.updateAlt(id.data.id, data.data.alt || null));
  } catch {
    return apiError("Not found", 404);
  }
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const actor = await currentActor();
  if (!actor || !canManageUsers(actor)) return apiError("Forbidden", 403);
  const parsed = schema.safeParse(await context.params);
  if (!parsed.success) return apiError("Invalid id", 422);
  const media = await mediaRepository.findById(parsed.data.id);
  if (!media) return apiError("Not found", 404);
  const usage = await mediaRepository.usage(media.id);
  if (
    usage.avatars ||
    usage.eventCovers ||
    usage.placeCovers ||
    usage.eventContent ||
    usage.placeContent
  ) {
    const references = [
      usage.avatars && `${usage.avatars} avatar(es)`,
      usage.eventCovers && `${usage.eventCovers} portada(s) de evento`,
      usage.placeCovers && `${usage.placeCovers} portada(s) de lugar`,
      usage.eventContent && `${usage.eventContent} contenido(s) de evento`,
      usage.placeContent && `${usage.placeContent} contenido(s) de lugar`,
    ].filter(Boolean);
    return apiError(`La imagen está en uso: ${references.join(", ")}.`, 409);
  }
  try {
    const key =
      media.objectKey ??
      (media.url.includes("?key=") ? decodeURIComponent(media.url.split("?key=")[1]) : media.url);
    if (/^[a-z]+\/[a-z0-9]+\/[a-z0-9_-]+\/[a-f0-9-]+\.(jpg|png|webp)$/i.test(key))
      await deleteObject(key);
    await mediaRepository.remove(media.id);
    return new Response(null, { status: 204 });
  } catch {
    return apiError("Unable to delete media", 500);
  }
}
