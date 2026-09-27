import { currentActor } from "@/lib/auth/session";
import { apiData, apiError, apiValidationError } from "@/lib/api/response";
import { userService } from "@/lib/services/user.service";
import { forcedPasswordChangeSchema } from "@/lib/validations/user.schema";

export async function POST(request: Request) {
  const actor = await currentActor();
  if (!actor) return apiError("Unauthorized", 401);
  const parsed = forcedPasswordChangeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return apiValidationError(
      "La nueva contraseña debe tener al menos 8 caracteres.",
      parsed.error.issues,
    );
  try {
    await userService.changeForcedPassword(actor.id, parsed.data.password);
    return apiData({ changed: true });
  } catch (error) {
    return apiError(
      error instanceof Error && error.message === "FORBIDDEN"
        ? "No hay un cambio de contraseña pendiente."
        : "Usuario no encontrado",
      error instanceof Error && error.message === "FORBIDDEN" ? 403 : 404,
    );
  }
}
