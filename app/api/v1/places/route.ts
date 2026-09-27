import { NextRequest } from "next/server";
import { currentActor } from "@/lib/auth/session";
import { serviceError } from "@/lib/api/handler";
import { apiData, apiError, apiList } from "@/lib/api/response";
import { rateLimit } from "@/lib/cache/redis";
import { placeService } from "@/lib/services/place.service";
import { placeCreateSchema, placeQuerySchema } from "@/lib/validations/place.schema";
export async function GET(request: NextRequest) {
  const parsed = placeQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return apiError("Invalid query", 422);
  try {
    if (parsed.data.lat !== undefined && parsed.data.lng !== undefined && parsed.data.radius)
      return apiData(
        await placeService.nearby(parsed.data.lat, parsed.data.lng, parsed.data.radius),
      );
    const result = await placeService.list(parsed.data);
    return apiList(result.data, parsed.data.page, parsed.data.pageSize, result.total);
  } catch (error) {
    return serviceError(error);
  }
}
export async function POST(request: NextRequest) {
  const actor = await currentActor();
  if (!actor) return apiError("Unauthorized", 401);
  const rate = await rateLimit(`place-create:${actor.id}`, 20, 3600);
  if (!rate.allowed) return apiError("Too many requests", 429);
  const parsed = placeCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("Invalid place data", 422);
  try {
    return apiData(await placeService.create(actor, parsed.data), 201);
  } catch (error) {
    return serviceError(error);
  }
}
