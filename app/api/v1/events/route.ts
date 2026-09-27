import { NextRequest } from "next/server";
import { currentActor } from "@/lib/auth/session";
import { serviceError } from "@/lib/api/handler";
import { apiData, apiError, apiList } from "@/lib/api/response";
import { rateLimit } from "@/lib/cache/redis";
import { eventService } from "@/lib/services/event.service";
import { eventCreateSchema, eventQuerySchema } from "@/lib/validations/event.schema";

export async function GET(request: NextRequest) {
  const parsed = eventQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return apiError("Invalid query", 422);
  try {
    const result = await eventService.list(parsed.data);
    return apiList(result.data, parsed.data.page, parsed.data.pageSize, result.total);
  } catch (error) {
    return serviceError(error);
  }
}
export async function POST(request: NextRequest) {
  const actor = await currentActor();
  if (!actor) return apiError("Unauthorized", 401);
  const rate = await rateLimit(`event-create:${actor.id}`, 20, 3600);
  if (!rate.allowed) return apiError("Too many requests", 429);
  const parsed = eventCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("Invalid event data", 422);
  try {
    return apiData(await eventService.create(actor, parsed.data), 201);
  } catch (error) {
    return serviceError(error);
  }
}
