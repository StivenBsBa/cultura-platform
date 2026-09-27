import { NextRequest } from "next/server";
import { z } from "zod";
import { currentActor } from "@/lib/auth/session";
import { serviceError } from "@/lib/api/handler";
import { apiData, apiError, apiValidationError } from "@/lib/api/response";
import { placeService } from "@/lib/services/place.service";
import { placeUpdateSchema } from "@/lib/validations/place.schema";
const paramsSchema = z.object({ id: z.string().cuid() });
export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const id = paramsSchema.safeParse(await context.params);
  if (!id.success) return apiError("Invalid id", 422);
  const place = await placeService.findPublicById(id.data.id);
  return place ? apiData(place) : apiError("Not found", 404);
}
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const actor = await currentActor();
  if (!actor) return apiError("Unauthorized", 401);
  const id = paramsSchema.safeParse(await context.params);
  const data = placeUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!id.success) return apiValidationError("Identificador inválido.", id.error.issues);
  if (!data.success) return apiValidationError("Revisa los campos del lugar.", data.error.issues);
  try {
    return apiData(await placeService.update(actor, id.data.id, data.data));
  } catch (error) {
    return serviceError(error);
  }
}
export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const actor = await currentActor();
  if (!actor) return apiError("Unauthorized", 401);
  const id = paramsSchema.safeParse(await context.params);
  if (!id.success) return apiError("Invalid id", 422);
  try {
    await placeService.delete(actor, id.data.id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return serviceError(error);
  }
}
