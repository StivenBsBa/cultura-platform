"use client";
import { useState } from "react";
import Link from "next/link";
import { Box, Chip, Divider, Paper, Typography } from "@mui/material";
import { ArrowRight, CalendarDays, MapPin, Shapes } from "lucide-react";
import { DetailModal } from "@/components/ui/detail-modal";
import { ActionGroup } from "@/components/ui/entity-card";
import { Button } from "@/components/ui/button";
type Category = {
  id: string;
  name: string;
  description: string;
  slug: string;
  scope: "EVENT" | "PLACE" | "BOTH";
  _count: { events: number; places: number };
};
const scopeLabel = { EVENT: "Evento", PLACE: "Lugar", BOTH: "Ambos" };
export function CategoryCards({ categories }: { categories: Category[] }) {
  const [selected, setSelected] = useState<Category | null>(null);
  const related = (category: Category) => category._count.events + category._count.places;
  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            xl: "repeat(3, minmax(0, 1fr))",
          },
          gap: 2.5,
        }}
      >
        {categories.map((category) => (
          <Paper
            component="button"
            type="button"
            key={category.id}
            onClick={() => setSelected(category)}
            sx={{
              minHeight: 214,
              width: "100%",
              p: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              textAlign: "left",
              color: "text.primary",
              bgcolor: "background.paper",
              borderColor: "#d9e1dc",
              borderRadius: 1.5,
              cursor: "pointer",
              overflow: "hidden",
              transition: "border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",
              "&:hover": {
                borderColor: "secondary.main",
                boxShadow: 2,
                transform: "translateY(-2px)",
              },
            }}
          >
            <Box
              sx={{
                width: "100%",
                p: 2.25,
                display: "flex",
                flexDirection: "column",
                gap: 1.25,
                flex: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    placeItems: "center",
                    width: 38,
                    height: 38,
                    borderRadius: 1.25,
                    bgcolor: "#edf4ef",
                    color: "secondary.main",
                  }}
                >
                  {category.scope === "EVENT" ? (
                    <CalendarDays size={19} />
                  ) : category.scope === "PLACE" ? (
                    <MapPin size={19} />
                  ) : (
                    <Shapes size={19} />
                  )}
                </Box>
                <Chip
                  label={scopeLabel[category.scope]}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              </Box>
              <Typography component="h2" variant="h6" sx={{ m: 0 }}>
                {category.name}
              </Typography>
              <Typography
                component="p"
                color="text.secondary"
                sx={{
                  m: 0,
                  display: "-webkit-box",
                  overflow: "hidden",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                }}
              >
                {category.description
                  ? `${category.description.slice(0, 110)}${category.description.length > 110 ? "…" : ""}`
                  : "Explora contenidos culturales relacionados."}
              </Typography>
            </Box>
            <Divider flexItem />
            <Box
              sx={{
                width: "100%",
                px: 2.25,
                py: 1.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                {related(category)} relacionados
              </Typography>
              <ArrowRight size={18} aria-hidden="true" />
            </Box>
          </Paper>
        ))}
      </Box>
      {categories.length === 0 && (
        <Typography component="p" sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
          No hay categorías disponibles.
        </Typography>
      )}
      {selected && (
        <DetailModal title={selected.name} onClose={() => setSelected(null)} size="sm">
          <p>{selected.description || "Sin descripción disponible."}</p>
          <p>
            <strong>{related(selected)} relacionados</strong>
          </p>
          <Box
            component="dl"
            sx={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 1.25, "& dd": { m: 0 } }}
          >
            <dt>Eventos</dt>
            <dd>{selected._count.events}</dd>
            <dt>Lugares</dt>
            <dd>{selected._count.places}</dd>
          </Box>
          <ActionGroup>
            <Button variant="ghost" type="button" onClick={() => setSelected(null)}>
              Cerrar
            </Button>
            <Button component={Link} href={`/categorias/${selected.slug}`}>
              Ver relacionados
            </Button>
          </ActionGroup>
        </DetailModal>
      )}
    </>
  );
}
