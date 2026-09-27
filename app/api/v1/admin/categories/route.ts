import { NextRequest } from "next/server";
import { z } from "zod";
import { currentActor } from "@/lib/auth/session";
import { canManageUsers } from "@/lib/permissions";
import { apiData, apiError } from "@/lib/api/response";
import { categorySchema } from "@/lib/validations/category.schema";
import { categoryService } from "@/lib/services/category.service";
export async function GET() {
  const data = await categoryService.list();
  return apiData(data);
}
async function admin() {
  const actor = await currentActor();
  return actor && canManageUsers(actor) ? actor : null;
}
export async function POST(request: NextRequest) {
  if (!(await admin())) return apiError("Forbidden", 403);
  const parsed = categorySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("Invalid category", 422);
  try {
    return apiData(await categoryService.create(parsed.data), 201);
  } catch {
    return apiError("Category already exists", 409);
  }
}
