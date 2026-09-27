import { NextRequest } from "next/server";
import { z } from "zod";
import { currentActor } from "@/lib/auth/session";
import { canManageUsers } from "@/lib/permissions";
import { apiData, apiError } from "@/lib/api/response";
import { categorySchema } from "@/lib/validations/category.schema";
import { categoryService } from "@/lib/services/category.service";
const idSchema = z.object({ id: z.string().cuid() });
async function allowed() {
  const actor = await currentActor();
  return !!actor && canManageUsers(actor);
}
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await allowed())) return apiError("Forbidden", 403);
  const id = idSchema.safeParse(await context.params);
  const body = categorySchema.safeParse(await request.json().catch(() => null));
  if (!id.success || !body.success) return apiError("Invalid category", 422);
  try {
    return apiData(await categoryService.update(id.data.id, body.data));
  } catch {
    return apiError("Category already exists", 409);
  }
}
export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await allowed())) return apiError("Forbidden", 403);
  const id = idSchema.safeParse(await context.params);
  if (!id.success) return apiError("Invalid id", 422);
  try {
    await categoryService.remove(id.data.id);
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message === "CATEGORY_IN_USE")
      return apiError("Category is in use", 409);
    if (error instanceof Error && error.message === "NOT_FOUND") return apiError("Not found", 404);
    return apiError("Unable to delete category", 500);
  }
}
