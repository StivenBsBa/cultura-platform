import "server-only";

export type GeoapifyLocation = {
  type: "ADDRESS" | "POI";
  label: string;
  address?: string;
  city?: string;
  region?: string;
  latitude: number;
  longitude: number;
  source: "GEOAPIFY";
};

type GeoapifyFeature = {
  formatted?: string;
  address_line1?: string;
  city?: string;
  state?: string;
  country_code?: string;
  result_type?: string;
  lat?: number;
  lon?: number;
};

class GeoapifyError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

function asLocation(feature: GeoapifyFeature): GeoapifyLocation | null {
  if (
    feature.country_code?.toLowerCase() !== "co" ||
    !Number.isFinite(feature.lat) ||
    !Number.isFinite(feature.lon)
  )
    return null;
  return {
    type:
      feature.result_type === "amenity" || feature.result_type === "building" ? "POI" : "ADDRESS",
    label: feature.formatted ?? feature.address_line1 ?? "Ubicación en Colombia",
    address: feature.formatted ?? feature.address_line1,
    city: feature.city,
    region: feature.state,
    latitude: feature.lat as number,
    longitude: feature.lon as number,
    source: "GEOAPIFY",
  };
}

export const geoapifyService = {
  async autocomplete(query: string): Promise<GeoapifyLocation[]> {
    return request("/v1/geocode/autocomplete", {
      text: query,
      filter: "countrycode:co",
      lang: "es",
      limit: "5",
    });
  },
  async forwardGeocode(query: string): Promise<GeoapifyLocation[]> {
    return request("/v1/geocode/search", {
      text: query,
      filter: "countrycode:co",
      lang: "es",
      limit: "5",
    });
  },
  async reverseGeocode(lat: number, lng: number): Promise<GeoapifyLocation | null> {
    const items = await request("/v1/geocode/reverse", {
      lat: String(lat),
      lon: String(lng),
      countrycodes: "co",
      lang: "es",
      limit: "1",
    });
    return items[0] ?? null;
  },
};

async function request(path: string, params: Record<string, string>): Promise<GeoapifyLocation[]> {
  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) return [];
  const url = new URL(path, process.env.GEOAPIFY_BASE_URL ?? "https://api.geoapify.com");
  Object.entries({ ...params, format: "json", apiKey }).forEach(([key, value]) =>
    url.searchParams.set(key, value),
  );
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    throw new GeoapifyError(503, "Geoapify no está disponible");
  }
  if (!response.ok)
    throw new GeoapifyError(
      response.status,
      response.status === 429 ? "Límite de Geoapify alcanzado" : "Geoapify no está disponible",
    );
  const body = (await response.json()) as { results?: GeoapifyFeature[] };
  return (body.results ?? [])
    .map(asLocation)
    .filter((item): item is GeoapifyLocation => item !== null);
}

export { GeoapifyError };
