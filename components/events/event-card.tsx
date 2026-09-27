import type { ReactNode } from "react";
import { Box, Chip, Divider, Paper, Typography } from "@mui/material";
import { CalendarDays, MapPin, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NextLinkAdapter } from "@/components/ui/next-link-adapter";
export function EventCard({
  event,
  actions,
}: {
  event: {
    name: string;
    slug: string;
    price: { toString(): string };
    occurrences: Array<{ startsAt: Date }>;
    summary?: string | null;
    coverMedia?: { url: string } | null;
    status?: string;
    place?: { name: string };
    author?: { name: string | null; email: string };
  };
  actions?: ReactNode;
}) {
  return (
    <Paper
      component="article"
      variant="outlined"
      sx={{
        minWidth: 0,
        display: "grid",
        gridTemplateColumns: event.coverMedia?.url
          ? { xs: "1fr", md: "180px minmax(0, 1fr) 200px" }
          : { xs: "1fr", sm: "minmax(0, 1fr) 210px" },
        overflow: "hidden",
        borderRadius: 1,
        borderColor: "#d9e1dc",
        transition: "border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",
        "&:hover": { borderColor: "secondary.main", boxShadow: 2, transform: "translateY(-2px)" },
      }}
    >
      {event.coverMedia?.url && (
        <Box
          component="img"
          src={event.coverMedia.url}
          alt=""
          sx={{
            width: "100%",
            height: { xs: 210, md: "100%" },
            minHeight: 230,
            objectFit: "cover",
          }}
        />
      )}
      <Box
        sx={{
          minWidth: 0,
          p: { xs: 2, sm: 2.5 },
          display: "grid",
          alignContent: "start",
          gap: 1.5,
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "secondary.main" }}>
            <CalendarDays size={17} aria-hidden="true" />
            <Typography variant="body2" color="text.secondary">
              {event.occurrences[0]?.startsAt
                ? new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(
                    event.occurrences[0].startsAt,
                  )
                : "Próximamente"}
            </Typography>
          </Box>
          {event.status && (
            <Chip label={event.status} size="small" color="secondary" variant="outlined" />
          )}
        </Box>
        <Typography component="h3" variant="h5" sx={{ m: 0, lineHeight: 1.25 }}>
          {event.name}
        </Typography>
        {event.summary && (
          <Typography
            component="p"
            color="text.secondary"
            sx={{
              m: 0,
              display: "-webkit-box",
              overflow: "hidden",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 3,
            }}
          >
            {event.summary.slice(0, 160)}
            {event.summary.length > 160 ? "…" : ""}
          </Typography>
        )}
        {(event.place || event.author) && <Divider />}
        <Box sx={{ display: "flex", flexWrap: "wrap", columnGap: 2, rowGap: 0.75 }}>
          {event.place && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
              <MapPin size={16} aria-hidden="true" />
              <Typography variant="body2" color="text.secondary" noWrap>
                {event.place.name}
              </Typography>
            </Box>
          )}
          {event.author && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
              <UserRound size={16} aria-hidden="true" />
              <Typography variant="body2" color="text.secondary" noWrap>
                {event.author.name ?? event.author.email}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
      <Box
        sx={{
          p: 2.5,
          display: "flex",
          flexDirection: { xs: "row", sm: "column" },
          justifyContent: "space-between",
          alignItems: { xs: "center", sm: "stretch" },
          gap: 2,
          bgcolor: "#f5f8f5",
          borderTop: { xs: "1px solid #d9e1dc", sm: 0 },
          borderLeft: { sm: "1px solid #d9e1dc" },
        }}
      >
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.4 }}>
            Precio
          </Typography>
          <Typography
            component="p"
            variant="h5"
            color="text.primary"
            sx={{ m: 0, fontWeight: 700 }}
          >
            ${event.price.toString()}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            justifyContent: { xs: "flex-end", sm: "stretch" },
          }}
        >
          {actions ?? (
            <Button
              component={NextLinkAdapter}
              href={`/eventos/${event.slug}`}
              sx={{ width: { sm: "100%" }, alignSelf: "flex-end" }}
            >
              Ver evento
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
