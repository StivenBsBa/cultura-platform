import { NextRequest } from "next/server";
import { rateLimit } from "@/lib/cache/redis";
import { apiData, apiError } from "@/lib/api/response";
import { locationService } from "@/lib/services/location.service";
import { locationSearchSchema } from "@/lib/validations/location.schema";

export async function GET(request: NextRequest) {
  const parsed = locationSearchSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return apiError("Consulta inválida", 422);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (!(await rateLimit(`locations:${ip}`, 30, 60)).allowed)
    return apiError("Too many requests", 429);
  return apiData(await locationService.search(parsed.data.q));
}
