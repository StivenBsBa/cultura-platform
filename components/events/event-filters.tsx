"use client";

import { Box, Checkbox, FormControlLabel, MenuItem } from "@mui/material";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/form-field";

export function EventFilters({
  search,
  period,
  free,
}: {
  search?: string;
  period?: string;
  free: boolean;
}) {
  return (
    <Box
      component="form"
      method="get"
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "minmax(0, 1fr)",
          sm: "minmax(0, 1fr) minmax(160px, 220px)",
          md: "minmax(320px, 1fr) 210px auto",
        },
        alignItems: "center",
        gap: 1.25,
        mb: 4,
      }}
    >
      <SearchInput
        name="search"
        defaultValue={search}
        placeholder="Buscar eventos"
        aria-label="Buscar eventos"
      />
      <Select name="period" defaultValue={period ?? ""} aria-label="Periodo">
        <MenuItem value="">Próximos</MenuItem>
        <MenuItem value="today">Hoy</MenuItem>
        <MenuItem value="weekend">Fin de semana</MenuItem>
        <MenuItem value="next_7_days">7 días</MenuItem>
      </Select>
      <Box
        sx={{
          gridColumn: { xs: "auto", sm: "1 / -1", md: "auto" },
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <FormControlLabel
          control={<Checkbox name="free" value="true" defaultChecked={free} color="secondary" />}
          label="Gratis"
          sx={{ m: 0 }}
        />
        <Button type="submit" startIcon={<SlidersHorizontal size={17} />}>
          Filtrar
        </Button>
      </Box>
    </Box>
  );
}
