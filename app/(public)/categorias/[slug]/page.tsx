import { categoryService } from "@/lib/services/category.service";
import { eventService } from "@/lib/services/event.service";
import { placeService } from "@/lib/services/place.service";
import { Box, Link as MuiLink, Paper, Typography } from "@mui/material";
import { PageContainer } from "@/components/ui/page-container";
import { NextLinkAdapter } from "@/components/ui/next-link-adapter";
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await categoryService.findBySlug(slug);
  if (!category)
    return (
      <PageContainer component="main">
        <Typography component="h1" variant="h3">
          Categoría no encontrada
        </Typography>
      </PageContainer>
    );
  const [events, places] = await Promise.all([
    category.scope === "PLACE"
      ? Promise.resolve({ data: [], total: 0 })
      : eventService.list({
          page: 1,
          pageSize: 50,
          category: slug,
          sort: "newest",
        }),
    category.scope === "EVENT"
      ? Promise.resolve({ data: [], total: 0 })
      : placeService.list({
          page: 1,
          pageSize: 50,
          category: slug,
          sort: "newest",
        }),
  ]);
  return (
    <PageContainer component="main">
      <Typography component="h1" variant="h3">
        {category.name}
      </Typography>
      <Typography component="p" color="text.secondary">
        {category.description}
      </Typography>
      <Typography component="p">
        <strong>{category._count.events + category._count.places} relacionados</strong>
      </Typography>
      <Box
        component="section"
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 2,
        }}
      >
        <Paper sx={{ p: 2.5, borderRadius: 1.5, boxShadow: 1 }}>
          <Typography component="h2" variant="h5">
            Eventos ({events.total})
          </Typography>
          {events.data.map((event) => (
            <Typography component="p" key={event.id}>
              <MuiLink component={NextLinkAdapter} href={`/eventos/${event.slug}`}>
                {event.name}
              </MuiLink>
            </Typography>
          ))}
          {events.data.length === 0 && (
            <Typography component="p" color="text.secondary">
              No hay eventos publicados.
            </Typography>
          )}
        </Paper>
        <Paper sx={{ p: 2.5, borderRadius: 1.5, boxShadow: 1 }}>
          <Typography component="h2" variant="h5">
            Lugares ({places.total})
          </Typography>
          {places.data.map((place) => (
            <Typography component="p" key={place.id}>
              <MuiLink component={NextLinkAdapter} href={`/lugares/${place.slug}`}>
                {place.name}
              </MuiLink>
            </Typography>
          ))}
          {places.data.length === 0 && (
            <Typography component="p" color="text.secondary">
              No hay lugares publicados.
            </Typography>
          )}
        </Paper>
      </Box>
    </PageContainer>
  );
}
