import { favoriteRepository } from "@/lib/repositories/favorite.repository";
export const favoriteService = {
  list: (userId: string) => favoriteRepository.list(userId),
  async add(userId: string, type: "event" | "place", targetId: string) {
    const published =
      type === "event"
        ? await favoriteRepository.isPublishedEvent(targetId)
        : await favoriteRepository.isPublishedPlace(targetId);
    if (!published) throw new Error("NOT_FOUND");
    return type === "event"
      ? favoriteRepository.addEvent(userId, targetId)
      : favoriteRepository.addPlace(userId, targetId);
  },
  remove: (userId: string, type: "event" | "place", targetId: string) =>
    type === "event"
      ? favoriteRepository.removeEvent(userId, targetId)
      : favoriteRepository.removePlace(userId, targetId),
};
