import { canManageUsers, type Actor } from "@/lib/permissions";
import { extractMediaIds } from "@/lib/content/rich-text-media";

export async function assertContentMediaAccess(actor: Actor, content: unknown) {
  if (content === undefined || content === null) return;
  const ids = extractMediaIds(content);
  if (!ids.length) return;
  const { mediaRepository } = await import("@/lib/repositories/media.repository");
  const media = await mediaRepository.findManyByIds(ids);
  if (
    media.length !== ids.length ||
    media.some((asset) => asset.ownerId !== actor.id && !canManageUsers(actor))
  )
    throw new Error("INVALID_MEDIA_REFERENCE");
}
export async function assertCoverAccess(actor: Actor, mediaId?: string | null) {
  if (!mediaId) return;
  const { mediaRepository } = await import("@/lib/repositories/media.repository");
  const media = await mediaRepository.findById(mediaId);
  if (!media || (media.ownerId !== actor.id && !canManageUsers(actor)))
    throw new Error("FORBIDDEN");
}
export async function assertCategoryScope(
  categoryIds: string[] | undefined,
  scope: "EVENT" | "PLACE",
) {
  if (!categoryIds?.length) return;
  const { categoryRepository } = await import("@/lib/repositories/category.repository");
  const valid = await categoryRepository.findUsableIds(categoryIds, scope);
  if (valid.length !== new Set(categoryIds).size) throw new Error("INVALID_CATEGORY_SCOPE");
}
