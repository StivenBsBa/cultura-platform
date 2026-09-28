import { EventCard } from "@/components/events/event-card";
import { ContentFilters } from "@/components/ui/content-filters";
import { eventService } from "@/lib/services/event.service";
import { categoryService } from "@/lib/services/category.service";
import { EmptyState } from "@/components/ui/empty-state";
import { Box } from "@mui/material";
import { Typography } from "@mui/material";
import { PageContainer } from "@/components/ui/page-container";

export const dynamic = "force-dynamic";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  const selectedDate = query.date;
  const startsFrom = selectedDate ? new Date(`${selectedDate}T00:00:00`) : undefined;
  const startsTo = selectedDate ? new Date(`${selectedDate}T23:59:59.999`) : undefined;
  const [categories, { data }] = await Promise.all([
    categoryService.list("EVENT"),
    eventService.list({
      page: 1,
      pageSize: 20,
      sort: "upcoming",
      search: query.search,
      category: query.category,
      startsFrom,
      startsTo,
      period: query.period as "today" | "weekend" | "next_7_days" | undefined,
      free: query.free === "true",
    }),
  ]);
  return (
    <>
      <PageContainer component="main">
        <Typography component="h1" variant="h3" sx={{ mb: 2 }}>
          Eventos culturales
        </Typography>
        <ContentFilters
          search={query.search}
          period={query.period}
          category={query.category}
          categories={categories}
          free={query.free === "true"}
          includeFree
          includeDate
          date={query.date}
          includePeriod
          periodOptions={[
            { value: "today", label: "Hoy" },
            { value: "weekend", label: "Fin de semana" },
            { value: "next_7_days", label: "7 días" },
          ]}
          searchPlaceholder="Buscar eventos"
        />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 520px), 1fr))",
            gap: 2,
          }}
        >
          {data.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </Box>
        {data.length === 0 && (
          <EmptyState>No hay eventos que coincidan con los filtros.</EmptyState>
        )}
      </PageContainer>
    </>
  );
}
