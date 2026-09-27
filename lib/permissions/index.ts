import { ContentStatus, Role } from "@/generated/prisma/client";

export type Actor = { id: string; role: Role };
export type ContentAction =
  | "EDIT"
  | "DELETE"
  | "SUBMIT_REVIEW"
  | "APPROVE"
  | "REJECT"
  | "PUBLISH"
  | "ARCHIVE";
const contentRoles: readonly Role[] = [Role.CREATOR, Role.MODERATOR, Role.ADMIN];
const moderationRoles: readonly Role[] = [Role.MODERATOR, Role.ADMIN];
export const canCreateContent = (actor: Actor) => contentRoles.includes(actor.role);
export const canEditEvent = (actor: Actor, authorId: string, authorRole?: Role) =>
  actor.role === Role.ADMIN ||
  (actor.id === authorId && canCreateContent(actor)) ||
  (actor.role === Role.MODERATOR && authorRole === Role.CREATOR);
export const canDeleteEvent = canEditEvent;
export const canEditPlace = canEditEvent;
export const canDeletePlace = canEditEvent;
export const canModerate = (actor: Actor) => moderationRoles.includes(actor.role);
export const canManageUsers = (actor: Actor) => actor.role === Role.ADMIN;
export const canTransitionContent = (
  actor: Actor,
  authorId: string,
  authorRole: Role,
  currentStatus: ContentStatus,
  nextStatus: ContentStatus,
) => {
  if (currentStatus === nextStatus) return true;
  if (actor.role === Role.ADMIN) return true;
  if (actor.id === authorId && actor.role === Role.MODERATOR)
    return nextStatus === ContentStatus.PENDING_REVIEW;
  if (actor.id === authorId && actor.role === Role.CREATOR)
    return nextStatus === ContentStatus.DRAFT || nextStatus === ContentStatus.PENDING_REVIEW;
  return (
    actor.role === Role.MODERATOR &&
    authorRole === Role.CREATOR &&
    currentStatus === ContentStatus.PENDING_REVIEW &&
    ([ContentStatus.PUBLISHED, ContentStatus.REJECTED] as ContentStatus[]).includes(nextStatus)
  );
};

export const contentActionsFor = (
  actor: Actor,
  authorId: string,
  authorRole: Role,
  status: ContentStatus,
): ContentAction[] => {
  if (actor.role === Role.ADMIN) {
    return [
      "EDIT",
      "DELETE",
      ...(status !== ContentStatus.PUBLISHED ? (["PUBLISH"] as const) : []),
      ...(status === ContentStatus.PENDING_REVIEW ? (["REJECT"] as const) : []),
      ...(status !== ContentStatus.ARCHIVED ? (["ARCHIVE"] as const) : []),
    ];
  }
  if (actor.id === authorId && actor.role === Role.CREATOR) {
    return [
      "EDIT",
      "DELETE",
      ...(([ContentStatus.DRAFT, ContentStatus.REJECTED] as ContentStatus[]).includes(status)
        ? (["SUBMIT_REVIEW"] as const)
        : []),
    ];
  }
  if (actor.id === authorId && actor.role === Role.MODERATOR) return ["EDIT", "DELETE"];
  if (
    actor.role === Role.MODERATOR &&
    authorRole === Role.CREATOR &&
    status === ContentStatus.PENDING_REVIEW
  )
    return ["EDIT", "DELETE", "APPROVE", "REJECT"];
  return [];
};
