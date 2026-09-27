import { NextRequest } from "next/server";
import { z } from "zod";
import { apiData, apiValidationError } from "@/lib/api/response";
import { currentActor } from "@/lib/auth/session";
import { apiError, apiList } from "@/lib/api/response";
import { canManageUsers } from "@/lib/permissions";
import { userRepository } from "@/lib/repositories/user.repository";
import { paginationSchema } from "@/lib/validations/common";
import { adminUserUpdateSchema } from "@/lib/validations/user.schema";
export async function GET(request: NextRequest) {
  const actor = await currentActor();
  if (!actor) return apiError("Unauthorized", 401);
  if (!canManageUsers(actor)) return apiError("Forbidden", 403);
  const parsed = paginationSchema
    .extend({ search: z.string().trim().max(100).optional() })
    .safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return apiError("Invalid query", 422);
  const [data, total] = await Promise.all([
    userRepository.findMany(
      (parsed.data.page - 1) * parsed.data.pageSize,
      parsed.data.pageSize,
      parsed.data.search,
      actor.id,
    ),
    userRepository.count(parsed.data.search, actor.id),
  ]);
  return apiList(data, parsed.data.page, parsed.data.pageSize, total);
}
export async function PATCH(request: NextRequest) {
  const actor = await currentActor();
  if (!actor || !canManageUsers(actor)) return apiError("Forbidden", 403);
  const parsed = adminUserUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return apiValidationError("Revisa los campos del usuario.", parsed.error.issues);
  const { userId, ...data } = parsed.data;
  if (userId === actor.id) return apiError("Cannot manage your own account from this section", 403);
  try {
    return apiData(await userRepository.updateProfile(userId, data));
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002")
      return apiError("Only one ADMIN is allowed", 409);
    return apiError("User not found", 404);
  }
}
export async function DELETE(request: NextRequest) {
  const actor = await currentActor();
  if (!actor || !canManageUsers(actor)) return apiError("Forbidden", 403);
  const parsed = z
    .object({ userId: z.string().cuid() })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("Invalid user", 422);
  if (parsed.data.userId === actor.id) return apiError("Cannot delete your own account", 409);
  try {
    await userRepository.remove(parsed.data.userId);
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message === "USER_HAS_CONTENT")
      return apiError(
        "No se puede eliminar: el usuario tiene contenido o archivos asociados.",
        409,
      );
    return apiError("User not found", 404);
  }
}
