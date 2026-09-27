import { describe, expect, it, vi } from "vitest";
vi.mock("@/lib/repositories/favorite.repository", () => ({
  favoriteRepository: {
    addEvent: vi.fn().mockResolvedValue({ eventId: "event" }),
    addPlace: vi.fn(),
    isPublishedEvent: vi.fn().mockResolvedValue(true),
    isPublishedPlace: vi.fn().mockResolvedValue(true),
    list: vi.fn(),
    removeEvent: vi.fn(),
    removePlace: vi.fn(),
  },
}));
import { favoriteService } from "@/lib/services/favorite.service";
import { favoriteRepository } from "@/lib/repositories/favorite.repository";
describe("favoriteService", () => {
  it("crea favoritos de eventos separados", async () =>
    expect(await favoriteService.add("user", "event", "event")).toEqual({ eventId: "event" }));

  it("impide favoritar un evento no publicado", async () => {
    vi.mocked(favoriteRepository.isPublishedEvent).mockResolvedValueOnce(false);

    await expect(favoriteService.add("user", "event", "private-event")).rejects.toThrow(
      "NOT_FOUND",
    );
    expect(favoriteRepository.addEvent).not.toHaveBeenCalledWith("user", "private-event");
  });

  it("impide favoritar un lugar no publicado", async () => {
    vi.mocked(favoriteRepository.isPublishedPlace).mockResolvedValueOnce(false);

    await expect(favoriteService.add("user", "place", "private-place")).rejects.toThrow(
      "NOT_FOUND",
    );
    expect(favoriteRepository.addPlace).not.toHaveBeenCalledWith("user", "private-place");
  });
});
