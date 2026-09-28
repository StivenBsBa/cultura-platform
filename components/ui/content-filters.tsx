"use client";

import { Box, Checkbox, FormControlLabel, Menu, MenuItem } from "@mui/material";
import { SlidersHorizontal } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form-field";
import { SearchInput } from "@/components/ui/search-input";

export type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

type SharedFiltersProps = {
  search?: string;
  category?: string;
  categories?: CategoryOption[];
  searchPlaceholder?: string;
  submitLabel?: string;
  includeDate?: boolean;
  date?: string;
  dateLabel?: string;
  includePeriod?: boolean;
  period?: string;
  periodOptions?: Array<{ value: string; label: string }>;
  includeFree?: boolean;
  free?: boolean;
  lat?: string;
  lng?: string;
  radius?: string;
};

export function ContentFilters({
  search,
  category,
  categories = [],
  searchPlaceholder = "Buscar",
  submitLabel = "Filtrar",
  includeDate = false,
  date,
  dateLabel = "Fecha",
  includePeriod = false,
  period,
  periodOptions = [],
  includeFree = false,
  free = false,
  lat,
  lng,
  radius,
}: SharedFiltersProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const formId = useId();
  const menuOpen = Boolean(anchorEl);

  return (
    <Box
      component="form"
      id={formId}
      method="get"
      sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 4 }}
    >
      {Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) && Number.isFinite(Number(radius)) && (
        <>
          <input type="hidden" name="lat" value={lat} />
          <input type="hidden" name="lng" value={lng} />
          <input type="hidden" name="radius" value={radius} />
        </>
      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <SearchInput
          name="search"
          defaultValue={search}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
        />
      </Box>

      <Button
        type="button"
        startIcon={<SlidersHorizontal size={17} />}
        aria-controls={menuOpen ? `${formId}-menu` : undefined}
        aria-expanded={menuOpen ? "true" : undefined}
        aria-haspopup="menu"
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        {submitLabel}
      </Button>

      <Menu
        id={`${formId}-menu`}
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { width: { xs: "calc(100vw - 32px)", sm: 340 }, p: 2 } } }}
      >
        <Box sx={{ display: "grid", gap: 1.5 }}>
          <Select name="category" inputProps={{ form: formId }} defaultValue={category ?? ""} aria-label="Categoría">
            <MenuItem value="">Todas las categorías</MenuItem>
            {categories.map((item) => (
              <MenuItem key={item.id} value={item.slug}>
                {item.name}
              </MenuItem>
            ))}
          </Select>

          {includeDate && (
            <Box component="label" sx={{ display: "grid", gap: 0.6, fontWeight: 500 }}>
              <Box component="span" sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                {dateLabel}
              </Box>
              <Input name="date" form={formId} type="date" defaultValue={date ?? ""} aria-label={dateLabel} />
            </Box>
          )}

          {includePeriod && (
            <Select name="period" inputProps={{ form: formId }} defaultValue={period ?? ""} aria-label="Periodo">
              <MenuItem value="">Próximos</MenuItem>
              {periodOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          )}

          {includeFree && (
            <FormControlLabel
              control={<Checkbox name="free" form={formId} value="true" defaultChecked={free} color="secondary" />}
              label="Gratis"
              sx={{ m: 0 }}
            />
          )}

          <Button type="submit" form={formId} onClick={() => setAnchorEl(null)}>
            Aplicar filtros
          </Button>
        </Box>
      </Menu>
    </Box>
  );
}
