import type { ReactNode } from "react";
import { Box, Chip, Divider, Paper, Typography } from "@mui/material";
import { ArrowUpRight, MapPin, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NextLinkAdapter } from "@/components/ui/next-link-adapter";
export function PlaceCard({
  place,
  actions,
}: {
  place: {
    name: string;
    slug: string;
    city: { name: string };
    summary?: string | null;
    address?: string;
    status?: string;
    coverMedia?: { url: string } | null;
    author?: { name: string | null; email: string };
    categories?: Array<{ category: { name: string } }>;
  };
  actions?: ReactNode;
}) {
  return (
    <Paper
      component="article"
      variant="outlined"
      sx={{
        minWidth: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderColor: "#d9e1dc",
        borderRadius: 1.5,
        transition: "border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",
        "&:hover": { borderColor: "secondary.main", boxShadow: 2, transform: "translateY(-2px)" },
      }}
    >
      {place.coverMedia?.url && (
        <Box
          component="img"
          src={place.coverMedia.url}
          alt=""
          sx={{ width: "100%", height: 148, objectFit: "cover" }}
        />
      )}
      {!place.coverMedia?.url && (
        <Box
          sx={{
            minHeight: 104,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2.5,
            bgcolor: "#edf4ef",
            color: "secondary.main",
          }}
        >
          <Box
            sx={{
              display: "grid",
              placeItems: "center",
              width: 42,
              height: 42,
              borderRadius: 1.5,
              bgcolor: "#dcebe2",
            }}
          >
            <MapPin size={22} aria-hidden="true" />
          </Box>
          <Typography variant="overline" sx={{ fontWeight: 700 }}>
            {place.city.name}
          </Typography>
        </Box>
      )}
      <Box
        sx={{ flex: 1, minWidth: 0, p: 2.25, display: "flex", flexDirection: "column", gap: 1.25 }}
      >
        <Box
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}
        >
          <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.4 }}>
            {place.city.name}
          </Typography>
          {place.status && (
            <Chip label={place.status} size="small" color="secondary" variant="outlined" />
          )}
        </Box>
        <Typography component="h3" variant="h6" sx={{ m: 0, lineHeight: 1.25 }}>
          {place.name}
        </Typography>
        {place.summary && (
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
            {place.summary.slice(0, 160)}
            {place.summary.length > 160 ? "…" : ""}
          </Typography>
        )}
        {place.address && (
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 0.75,
              color: "text.secondary",
              mt: 0.25,
            }}
          >
            <MapPin size={16} aria-hidden="true" />
            <Typography variant="body2">{place.address}</Typography>
          </Box>
        )}
        {place.categories && place.categories.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 0.25 }}>
            {place.categories.slice(0, 3).map(({ category }) => (
              <Chip
                key={category.name}
                label={category.name}
                size="small"
                color="secondary"
                variant="outlined"
              />
            ))}
            {place.categories.length > 3 && (
              <Chip label={`+${place.categories.length - 3}`} size="small" />
            )}
          </Box>
        )}
        {place.author && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              color: "text.secondary",
              mt: "auto",
              pt: 0.75,
            }}
          >
            <UserRound size={15} aria-hidden="true" />
            <Typography variant="caption">{place.author.name ?? place.author.email}</Typography>
          </Box>
        )}
      </Box>
      <Divider />
      <Box sx={{ p: 1.5, display: "flex", justifyContent: "flex-end" }}>
        {actions ?? (
          <Button
            component={NextLinkAdapter}
            href={`/lugares/${place.slug}`}
            variant="outline"
            endIcon={<ArrowUpRight size={17} />}
          >
            Explorar lugar
          </Button>
        )}
      </Box>
    </Paper>
  );
}
