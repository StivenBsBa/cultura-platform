import { currentActor } from "@/lib/auth/session";
import { canManageUsers } from "@/lib/permissions";
import { apiData, apiError } from "@/lib/api/response";
import { mediaRepository } from "@/lib/repositories/media.repository";
export async function GET() {
  const actor = await currentActor();
  if (!actor || !canManageUsers(actor)) return apiError("Forbidden", 403);
  return apiData(await mediaRepository.list());
}
