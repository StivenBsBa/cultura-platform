import { describe, expect, it, vi } from "vitest";
import { ContentStatus } from "@/generated/prisma/client";
vi.mock("@/lib/repositories/place.repository", () => ({
  placeRepository: {
    findNearby: vi.fn().mockResolvedValue([{ id: "place", distanceMeters: 12 }]),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
  },
}));
vi.mock("@/lib/repositories/media.repository", () => ({
  mediaRepository: {
    findById: vi.fn(),
    findManyByIds: vi.fn().mockResolvedValue([]),
  },
}));
vi.mock("@/lib/repositories/category.repository", () => ({
  categoryRepository: { findUsableIds: vi.fn() },
}));
import { placeRepository } from "@/lib/repositories/place.repository";
import { categoryRepository } from "@/lib/repositories/category.repository";
import { placeService } from "@/lib/services/place.service";
describe("placeService", () => {
  it("delega nearby al repository PostGIS", async () =>
    expect(await placeService.nearby(6.2, -75.5, 5000)).toHaveLength(1));
  it.each([ContentStatus.DRAFT, ContentStatus.PENDING_REVIEW])(
    "nunca aplica el estado interno %s a un listado público",
    async (status) => {
      await placeService.list({ page: 1, pageSize: 20, sort: "newest", status } as never);

      expect(placeRepository.findMany).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: ContentStatus.PUBLISHED }),
        0,
        20,
      );
    },
  );
  it("rechaza mediaId inválido en contenido enriquecido", async () => {
    await expect(
      placeService.create({ id: "creator-1", role: "CREATOR" }, {
        name: "Lugar cultural de prueba",
        summary: "Resumen suficiente para validar el lugar de prueba.",
        address: "Calle 1 # 2-3",
        cityId: "clxxxxxxxxxxxxxxxxxxxxxxxx",
        categoryIds: [],
        content: {
          type: "doc",
          content: [{ type: "image", attrs: { mediaId: "clx123456789012345678901" } }],
        },
      } as never),
    ).rejects.toThrow("INVALID_MEDIA_REFERENCE");
  });
  it("rechaza categorías de evento desde el service de lugares", async () => {
    vi.mocked(categoryRepository.findUsableIds).mockResolvedValueOnce([]);
    await expect(
      placeService.create(
        { id: "creator-1", role: "CREATOR" },
        {
          name: "Lugar cultural de prueba",
          summary: "Resumen suficiente para validar el lugar de prueba.",
          address: "Calle 1 # 2-3",
          cityId: "clxxxxxxxxxxxxxxxxxxxxxxxx",
          categoryIds: ["clx123456789012345678901"],
          lat: 6.2,
          lng: -75.5,
        },
      ),
    ).rejects.toThrow("INVALID_CATEGORY_SCOPE");
  });
});
