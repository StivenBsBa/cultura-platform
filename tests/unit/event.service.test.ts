import { describe, expect, it, vi } from "vitest";
import { ContentStatus, Role } from "@/generated/prisma/client";
vi.mock("@/lib/repositories/event.repository", () => ({
  eventRepository: {
    findMany: vi.fn().mockResolvedValue([]),
    findPublicUpcoming: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockImplementation((data) => data),
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
import { eventRepository } from "@/lib/repositories/event.repository";
import { categoryRepository } from "@/lib/repositories/category.repository";
import { eventService } from "@/lib/services/event.service";
const input = (status: ContentStatus) => ({
  name: "Evento cultural de prueba",
  summary: "Resumen válido para la tarjeta del evento.",
  price: 0,
  placeId: "clxxxxxxxxxxxxxxxxxxxxxxxx",
  categoryIds: [],
  status,
  occurrences: [
    {
      startsAt: new Date("2026-10-10T10:00:00Z"),
      endsAt: new Date("2026-10-10T11:00:00Z"),
      timezone: "America/Bogota",
    },
  ],
});
describe("eventService", () => {
  it("pagina resultados", async () =>
    expect(await eventService.list({ page: 1, pageSize: 20, sort: "upcoming" })).toEqual({
      data: [],
      total: 0,
    }));
  it.each([ContentStatus.DRAFT, ContentStatus.PENDING_REVIEW])(
    "nunca aplica el estado interno %s a un listado público",
    async (status) => {
      await eventService.list({ page: 1, pageSize: 20, sort: "upcoming", status } as never);

      expect(eventRepository.findPublicUpcoming).toHaveBeenLastCalledWith(
        expect.objectContaining({
          from: expect.any(Date),
        }),
      );
    },
  );
  it("deja una propuesta de creador en revisión", async () => {
    const result = await eventService.create(
      { id: "creator-1", role: Role.CREATOR },
      {
        ...input(ContentStatus.PENDING_REVIEW),
        occurrences: [
          ...input(ContentStatus.PENDING_REVIEW).occurrences,
          {
            startsAt: new Date("2026-10-11T10:00:00Z"),
            endsAt: new Date("2026-10-11T11:00:00Z"),
            timezone: "America/Bogota",
          },
        ],
      },
    );
    expect(result.status).toBe(ContentStatus.PENDING_REVIEW);
    expect(
      (result.occurrences as unknown as { create: Array<{ status: ContentStatus }> }).create.map(
        ({ status }) => status,
      ),
    ).toEqual([ContentStatus.PENDING_REVIEW, ContentStatus.PENDING_REVIEW]);
  });
  it("impide que un creador publique directamente", async () => {
    await expect(
      eventService.create({ id: "creator-1", role: Role.CREATOR }, input(ContentStatus.PUBLISHED)),
    ).rejects.toThrow("FORBIDDEN");
  });
  it("rechaza mediaId de contenido que no exista o no pertenezca al actor", async () => {
    await expect(
      eventService.create(
        { id: "creator-1", role: Role.CREATOR },
        {
          ...input(ContentStatus.PENDING_REVIEW),
          content: {
            type: "doc",
            content: [{ type: "image", attrs: { mediaId: "clx123456789012345678901" } }],
          },
        },
      ),
    ).rejects.toThrow("INVALID_MEDIA_REFERENCE");
  });
  it("rechaza categorías de lugar desde el service de eventos", async () => {
    vi.mocked(categoryRepository.findUsableIds).mockResolvedValueOnce([]);
    await expect(
      eventService.create(
        { id: "creator-1", role: Role.CREATOR },
        { ...input(ContentStatus.PENDING_REVIEW), categoryIds: ["clx123456789012345678901"] },
      ),
    ).rejects.toThrow("INVALID_CATEGORY_SCOPE");
  });
});
