import { redirect } from "next/navigation";
import { currentActor } from "./session";
import { canManageUsers, canModerate, canCreateContent } from "@/lib/permissions";
export async function requireUser() {
  const actor = await currentActor();
  if (!actor) redirect("/login?callbackUrl=/dashboard");
  return actor;
}
export async function requireAdmin() {
  const actor = await requireUser();
  if (!canManageUsers(actor)) redirect("/");
  return actor;
}
export async function requireContentManager() {
  const actor = await requireUser();
  if (!canCreateContent(actor)) redirect("/dashboard");
  return actor;
}
export async function requireModerator() {
  const actor = await requireUser();
  if (!canModerate(actor)) redirect("/dashboard");
  return actor;
}
