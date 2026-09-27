import { NextRequest } from "next/server";
import { currentActor } from "@/lib/auth/session";
import { serviceError } from "@/lib/api/handler";
import { apiData, apiError } from "@/lib/api/response";
import { favoriteService } from "@/lib/services/favorite.service";
import { favoriteSchema } from "@/lib/validations/favorite.schema";
export async function GET() {
  const actor = await currentActor();
  return actor ? apiData(await favoriteService.list(actor.id)) : apiError("Unauthorized", 401);
}
export async function POST(request: NextRequest) {
  const actor = await currentActor();
  if (!actor) return apiError("Unauthorized", 401);
  const parsed = favoriteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("Invalid favorite", 422);
  try {
    return apiData(
      await favoriteService.add(actor.id, parsed.data.type, parsed.data.targetId),
      201,
    );
  } catch (error) {
    return serviceError(error);
  }
}
export async function DELETE(request: NextRequest) {
  const actor = await currentActor();
  if (!actor) return apiError("Unauthorized", 401);
  const parsed = favoriteSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return apiError("Invalid favorite", 422);
  try {
    await favoriteService.remove(actor.id, parsed.data.type, parsed.data.targetId);
    return new Response(null, { status: 204 });
  } catch (error) {
    return serviceError(error);
  }
}
