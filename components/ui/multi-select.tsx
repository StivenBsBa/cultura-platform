"use client";
import { Autocomplete, TextField } from "@mui/material";
type Option = { id: string; name: string };
export function MultiSelect({ label, options, value, onChange }: { label: string; options: Option[]; value: string[]; onChange: (value: string[]) => void }) {
  const selected = options.filter((option) => value.includes(option.id));
  return <Autocomplete multiple options={options} value={selected} getOptionLabel={(option) => option.name} isOptionEqualToValue={(option, candidate) => option.id === candidate.id} onChange={(_, selectedOptions) => onChange(selectedOptions.map((option) => option.id))} renderInput={(params) => <TextField {...params} label={label} placeholder={selected.length ? "" : "Buscar categorías"} />} noOptionsText="No hay coincidencias." />;
}
