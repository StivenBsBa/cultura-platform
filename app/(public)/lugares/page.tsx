import { PlaceCard } from "@/components/places/place-card";
import { PlaceFilters } from "@/components/places/place-filters";
import { placeService } from "@/lib/services/place.service";
import { categoryService } from "@/lib/services/category.service";
import { EmptyState } from "@/components/ui/empty-state";
import { Box } from "@mui/material";
import { Typography } from "@mui/material";
import { PageContainer } from "@/components/ui/page-container";

export default async function PlacesPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    cityId?: string;
    category?: string;
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
  const [categories, { data }] = await Promise.all([
    categoryService.list("PLACE"),
    nearby
      ? { data: await placeService.nearbyDetails(lat, lng, radius) }
      : placeService.list({
        page: 1,
        pageSize: 20,
        sort: "newest",
        search: query.search,
        category: query.category,
        cityId: query.cityId,
      }),
  ]);
  return (
    <>
      <PageContainer component="main">
        <Typography component="h1" variant="h3" sx={{ mb: 2 }}>
          Lugares para descubrir
        </Typography>
        <PlaceFilters
          search={query.search}
          category={query.category}
          categories={categories}
          lat={query.lat}
          lng={query.lng}
          radius={query.radius}
        />
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
