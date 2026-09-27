"use client";

import { Autocomplete, Box, Chip, TextField } from "@mui/material";

type Option = { id: string; name: string };

export function MultiSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const selected = options.filter((option) => value.includes(option.id));

  return (
    <Box sx={{ display: "grid", gap: 1 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
        {selected.length > 0 ? (
          selected.map((option) => (
            <Chip
              key={option.id}
              label={option.name}
              size="small"
              color="secondary"
              variant="outlined"
            />
          ))
        ) : (
          <Chip label="Sin categorías seleccionadas" size="small" variant="outlined" />
        )}
      </Box>

      <Autocomplete
        multiple
        options={options}
        value={selected}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, candidate) => option.id === candidate.id}
        onChange={(_, selectedOptions) =>
          onChange(selectedOptions.map((option) => option.id))
        }
        noOptionsText="No hay coincidencias."
        disableCloseOnSelect
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={selected.length ? "Buscar más categorías" : "Buscar categorías"}
          />
        )}
      />
    </Box>
  );
}
