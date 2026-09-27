import { beforeEach, describe, expect, it, vi } from "vitest";

const { searchCities, searchPublishedPlaces, cacheGet, cacheSet, autocomplete, reverseGeocode } =
  vi.hoisted(() => ({
    searchCities: vi.fn(),
    searchPublishedPlaces: vi.fn(),
    cacheGet: vi.fn(),
    cacheSet: vi.fn(),
    autocomplete: vi.fn(),
    reverseGeocode: vi.fn(),
  }));
vi.mock("@/lib/repositories/location.repository", () => ({
  locationRepository: { searchCities, searchPublishedPlaces, findCitiesByRegion: vi.fn() },
}));
vi.mock("@/lib/cache/redis", () => ({ cacheGet, cacheSet }));
vi.mock("@/lib/geoapify/geoapify.service", () => ({
  GeoapifyError: class GeoapifyError extends Error {},
  geoapifyService: { autocomplete, reverseGeocode },
}));

import { locationService } from "@/lib/services/location.service";

describe("locationService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("prioriza ciudades y lugares publicados locales", async () => {
    searchCities.mockResolvedValueOnce([
      { id: "city", name: "Medellín", region: { name: "Antioquia" } },
    ]);
    searchPublishedPlaces.mockResolvedValueOnce([
      {
        id: "place",
        name: "Museo",
        address: "Centro",
        cityId: "city",
        city: { name: "Medellín", region: { name: "Antioquia" } },
      },
    ]);
    cacheGet.mockResolvedValueOnce([]);
    autocomplete.mockResolvedValueOnce([]);
    const result = await locationService.search("Medellín");
    expect(result.map((item) => item.type)).toEqual(["CITY", "PLACE"]);
    expect(searchPublishedPlaces).toHaveBeenCalledWith("Medellín");
  });
  it("usa caché sin consumir Geoapify", async () => {
    searchCities.mockResolvedValueOnce([]);
    searchPublishedPlaces.mockResolvedValueOnce([]);
    cacheGet.mockResolvedValueOnce([
      { type: "ADDRESS", label: "Carrera 70", latitude: 6.2, longitude: -75.5, source: "GEOAPIFY" },
    ]);
    await expect(locationService.search("Carrera 70")).resolves.toHaveLength(1);
    expect(autocomplete).not.toHaveBeenCalled();
  });
  it("mantiene resultados locales si Geoapify falla", async () => {
    searchCities.mockResolvedValueOnce([
      { id: "city", name: "Medellín", region: { name: "Antioquia" } },
    ]);
    searchPublishedPlaces.mockResolvedValueOnce([]);
    cacheGet.mockResolvedValueOnce(null);
    autocomplete.mockRejectedValueOnce(new Error("down"));
    await expect(locationService.search("Medellín")).resolves.toMatchObject([
      { type: "CITY", source: "LOCAL" },
    ]);
  });
  it("hace reverse geocoding y guarda el resultado", async () => {
    cacheGet.mockResolvedValueOnce(null);
    reverseGeocode.mockResolvedValueOnce({
      type: "ADDRESS",
      label: "Medellín",
      latitude: 6.2,
      longitude: -75.5,
      source: "GEOAPIFY",
    });
    await expect(locationService.reverse(6.2, -75.5)).resolves.toMatchObject({ label: "Medellín" });
    expect(cacheSet).toHaveBeenCalled();
  });
});
