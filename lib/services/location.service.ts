import { cacheGet, cacheSet } from "@/lib/cache/redis";
import {
  GeoapifyError,
  geoapifyService,
  type GeoapifyLocation,
} from "@/lib/geoapify/geoapify.service";
import { locationRepository } from "@/lib/repositories/location.repository";

export type LocationResult = {
  type: "CITY" | "PLACE" | "ADDRESS" | "POI";
  label: string;
  cityId?: string;
  placeId?: string;
  address?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  source: "LOCAL" | "GEOAPIFY";
};

const normalize = (query: string) => query.trim().toLocaleLowerCase("es-CO").replace(/\s+/g, " ");
const geoKey = (query: string) => `geoapify:autocomplete:${normalize(query)}`;
async function readCache<T>(key: string) {
  try {
    return await cacheGet<T>(key);
  } catch {
    return null;
  }
}
async function writeCache(key: string, value: unknown, seconds: number) {
  try {
    await cacheSet(key, value, seconds);
  } catch {
    /* Redis is an optimization, never a dependency. */
  }
}

function localResults(
  cities: Awaited<ReturnType<typeof locationRepository.searchCities>>,
  places: Awaited<ReturnType<typeof locationRepository.searchPublishedPlaces>>,
): LocationResult[] {
  return [
    ...cities.map((city) => ({
      type: "CITY" as const,
      label: city.name,
      cityId: city.id,
      city: city.name,
      region: city.region.name,
      source: "LOCAL" as const,
    })),
    ...places.map((place) => ({
      type: "PLACE" as const,
      label: place.name,
      placeId: place.id,
      cityId: place.cityId,
      address: place.address,
      city: place.city.name,
      region: place.city.region.name,
      source: "LOCAL" as const,
    })),
  ];
}

export const locationService = {
  async search(query: string): Promise<LocationResult[]> {
    const [cities, places] = await Promise.all([
      locationRepository.searchCities(query),
      locationRepository.searchPublishedPlaces(query),
    ]);
    const local = localResults(cities, places);
    const cached = await readCache<GeoapifyLocation[]>(geoKey(query));
    if (cached) return [...local, ...cached];
    try {
      const external = await geoapifyService.autocomplete(query);
      await writeCache(geoKey(query), external, 60 * 10);
      return [...local, ...external];
    } catch (error) {
      // Los resultados internos siguen siendo útiles si el proveedor agota cuota o cae.
      if (error instanceof GeoapifyError) return local;
      throw error;
    }
  },
  async reverse(lat: number, lng: number) {
    const key = `geoapify:reverse:${lat.toFixed(5)}:${lng.toFixed(5)}`;
    const cached = await readCache<GeoapifyLocation | null>(key);
    if (cached !== null) return cached;
    const location = await geoapifyService.reverseGeocode(lat, lng);
    await writeCache(key, location, 60 * 60 * 24);
    return location;
  },
  cities: (regionId: string) => locationRepository.findCitiesByRegion(regionId),
};
