import { currentActor } from "@/lib/auth/session";
import { apiData, apiError, apiValidationError } from "@/lib/api/response";
import { userService } from "@/lib/services/user.service";
import { profileUpdateSchema } from "@/lib/validations/user.schema";
export async function GET() {
  const actor = await currentActor();
  if (!actor) return apiError("Unauthorized", 401);
  const user = await userService.me(actor.id);
  return user ? apiData(user) : apiError("Not found", 404);
}
export async function PATCH(request: Request) {
  const actor = await currentActor();
  if (!actor) return apiError("Unauthorized", 401);
  const parsed = profileUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return apiValidationError("Revisa los campos del perfil.", parsed.error.issues);
  try {
    return apiData(await userService.updateProfile(actor.id, parsed.data));
  } catch (error) {
    console.error(
      "Profile update failed",
      error instanceof Error ? { name: error.name, message: error.message } : { error },
    );
    return apiError("Unable to update profile", 500);
  }
}
