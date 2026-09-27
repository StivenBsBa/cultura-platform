import { NextRequest } from "next/server";
import { apiData, apiError } from "@/lib/api/response";
import { rateLimit } from "@/lib/cache/redis";
import { locationService } from "@/lib/services/location.service";
import { reverseLocationSchema } from "@/lib/validations/location.schema";

export async function GET(request: NextRequest) {
  const parsed = reverseLocationSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return apiError("Coordenadas inválidas", 422);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (!(await rateLimit(`locations:reverse:${ip}`, 20, 60)).allowed)
    return apiError("Too many requests", 429);
  try {
    return apiData(await locationService.reverse(parsed.data.lat, parsed.data.lng));
  } catch {
    return apiError("No fue posible obtener la dirección", 503);
  }
}
