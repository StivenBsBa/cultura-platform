import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { list } = vi.hoisted(() => ({
  list: vi.fn().mockResolvedValue({ data: [], total: 0 }),
}));

vi.mock("@/lib/services/event.service", () => ({ eventService: { list } }));
vi.mock("@/lib/services/place.service", () => ({ placeService: { list } }));
vi.mock("@/lib/auth/session", () => ({ currentActor: vi.fn() }));
vi.mock("@/lib/cache/redis", () => ({ rateLimit: vi.fn() }));

import { GET as getEvents } from "@/app/api/v1/events/route";
import { GET as getPlaces } from "@/app/api/v1/places/route";

describe("listados públicos de contenido", () => {
  it("permite el listado público de eventos publicados", async () => {
    const response = await getEvents(new NextRequest("http://test/api/v1/events"));

    expect(response.status).toBe(200);
    expect(list).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: 20, sort: "upcoming" }),
    );
  });

  it.each([
    ["eventos", getEvents, "DRAFT"],
    ["eventos", getEvents, "PENDING_REVIEW"],
    ["lugares", getPlaces, "DRAFT"],
    ["lugares", getPlaces, "PENDING_REVIEW"],
  ])("rechaza status=%s interno para %s", async (resource, handler, status) => {
    list.mockClear();
    const response = await handler(
      new NextRequest(`http://test/api/v1/${resource}?status=${status}`),
    );

    expect(response.status).toBe(422);
    expect(list).not.toHaveBeenCalled();
  });
});
