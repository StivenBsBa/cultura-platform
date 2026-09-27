import { NextRequest } from "next/server";
import { apiData, apiError } from "@/lib/api/response";
import { locationService } from "@/lib/services/location.service";
import { citiesQuerySchema } from "@/lib/validations/location.schema";

export async function GET(request: NextRequest) {
  const parsed = citiesQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return apiError("Región inválida", 422);
  return apiData(await locationService.cities(parsed.data.regionId));
}
