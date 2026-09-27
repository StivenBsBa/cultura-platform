"use client";

import { Box, MenuItem } from "@mui/material";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/form-field";

type CategoryOption = {
    id: string;
    name: string;
    slug: string;
};

export function PlaceFilters({
    search,
    category,
    categories,
    lat,
    lng,
    radius,
}: {
    search?: string;
    category?: string;
    categories?: CategoryOption[];
    lat?: string;
    lng?: string;
    radius?: string;
}) {
    return (
        <Box
            component="form"
            method="get"
            sx={{
                display: "grid",
                gridTemplateColumns: {
                    xs: "minmax(0, 1fr)",
                    sm: "minmax(0, 1fr) minmax(180px, 240px)",
                    md: "minmax(300px, 1fr) 220px auto",
                },
                alignItems: "center",
                gap: 1.25,
                mb: 4,
            }}
        >
            {Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) && Number.isFinite(Number(radius)) && (
                <>
                    <input type="hidden" name="lat" value={lat} />
                    <input type="hidden" name="lng" value={lng} />
                    <input type="hidden" name="radius" value={radius} />
                </>
            )}
            <SearchInput
                name="search"
                defaultValue={search}
                placeholder="Busca un lugar"
                aria-label="Buscar lugares"
            />
            <Select name="category" defaultValue={category ?? ""} aria-label="Categoría del lugar">
                <MenuItem value="">Todas las categorías</MenuItem>
                {categories?.map((item) => (
                    <MenuItem key={item.id} value={item.slug}>
                        {item.name}
                    </MenuItem>
                ))}
            </Select>
            <Button type="submit">Buscar</Button>
        </Box>
    );
}
