import { currentActor } from "@/lib/auth/session";
import { apiData, apiError, apiValidationError } from "@/lib/api/response";
import { canManageUsers } from "@/lib/permissions";
import { userService } from "@/lib/services/user.service";
import { adminPasswordResetSchema } from "@/lib/validations/user.schema";

export async function POST(request: Request) {
  const actor = await currentActor();
  if (!actor || !canManageUsers(actor)) return apiError("Forbidden", 403);
  const parsed = adminPasswordResetSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return apiValidationError("Revisa la contraseña temporal.", parsed.error.issues);
  try {
    return apiData(
      await userService.resetPassword(actor.id, parsed.data.userId, parsed.data.temporaryPassword),
    );
  } catch (error) {
    return apiError(
      error instanceof Error && error.message === "FORBIDDEN"
        ? "No puedes restablecer tu propia contraseña aquí."
        : "Usuario no encontrado",
      error instanceof Error && error.message === "FORBIDDEN" ? 403 : 404,
    );
  }
}
