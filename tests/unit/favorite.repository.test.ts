import { describe, expect, it, vi } from "vitest";
import { ContentStatus } from "@/generated/prisma/client";

const { findMany } = vi.hoisted(() => ({ findMany: vi.fn() }));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    eventFavorite: { findMany },
    placeFavorite: { findMany },
  },
}));

import { favoriteRepository } from "@/lib/repositories/favorite.repository";

describe("favoriteRepository", () => {
  it("solo lista favoritos cuyo contenido sigue publicado", async () => {
    findMany.mockResolvedValue([]);

    await favoriteRepository.list("user-1");

    expect(findMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: { userId: "user-1", event: { status: ContentStatus.PUBLISHED } },
      }),
    );
    expect(findMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: { userId: "user-1", place: { status: ContentStatus.PUBLISHED } },
      }),
    );
  });
});
