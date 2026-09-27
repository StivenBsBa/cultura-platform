import { NextRequest } from "next/server";
import { apiData, apiError, apiValidationError } from "@/lib/api/response";
import { rateLimit } from "@/lib/cache/redis";
import { userService } from "@/lib/services/user.service";
import { registerSchema } from "@/lib/validations/user.schema";
import { serviceError } from "@/lib/api/handler";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const rate = await rateLimit(`register:${ip}`, 5, 3600);
  if (!rate.allowed) return apiError("Too many attempts", 429);
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return apiValidationError("Revisa los campos de registro.", parsed.error.issues);
  try {
    return apiData(await userService.register(parsed.data), 201);
  } catch (error) {
    return serviceError(error);
  }
}
