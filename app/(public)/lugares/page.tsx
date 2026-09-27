import { PlaceCard } from "@/components/places/place-card";
import { placeService } from "@/lib/services/place.service";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { Box } from "@mui/material";
import { Typography } from "@mui/material";
import { PageContainer } from "@/components/ui/page-container";
export default async function PlacesPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    cityId?: string;
    lat?: string;
    lng?: string;
    radius?: string;
  }>;
}) {
  const query = await searchParams;
  const radius = Number(query.radius);
  const lat = Number(query.lat);
  const lng = Number(query.lng);
  const nearby =
    Number.isFinite(lat) && Number.isFinite(lng) && [5000, 10000, 25000, 50000].includes(radius);
  const { data } = nearby
    ? { data: await placeService.nearbyDetails(lat, lng, radius) }
    : await placeService.list({
        page: 1,
        pageSize: 20,
        sort: "newest",
        search: query.search,
        cityId: query.cityId,
      });
  return (
    <>
      <PageContainer component="main">
        <Typography component="h1" variant="h3" sx={{ mb: 2 }}>
          Lugares para descubrir
        </Typography>
        <Box
          component="form"
          sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mb: 4 }}
        >
          <SearchInput
            name="search"
            defaultValue={query.search}
            placeholder="Busca un lugar"
            aria-label="Buscar lugares"
          />
          <Button type="submit">Buscar</Button>
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 2,
          }}
        >
          {data.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </Box>
        {data.length === 0 && (
          <EmptyState>No hay lugares que coincidan con la búsqueda.</EmptyState>
        )}
      </PageContainer>
    </>
  );
}
