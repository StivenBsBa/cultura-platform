import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form-field";
import { Box, MenuItem, Paper, Typography } from "@mui/material";
import type { ReactNode } from "react";
export type OccurrenceDraft = { id?: string; startsAt: string; endsAt: string; timezone: string };
type Props = {
  places: Array<{ id: string; name: string }>;
  placeId?: string;
  price?: string;
  capacity?: number | null;
  occurrences: OccurrenceDraft[];
  onChange: (items: OccurrenceDraft[]) => void;
};
const empty = (): OccurrenceDraft => ({ startsAt: "", endsAt: "", timezone: "America/Bogota" });
const dateValue = (value: string) =>
  value
    ? new Date(new Date(value).getTime() - new Date(value).getTimezoneOffset() * 60_000)
        .toISOString()
        .slice(0, 16)
    : "";
export function EventFormFields({
  places,
  placeId,
  price,
  capacity,
  occurrences,
  onChange,
}: Props) {
  return (
    <>
      <Field label="Lugar">
        <Select name="placeId" required defaultValue={placeId}>
          <MenuItem value="">Selecciona un lugar</MenuItem>
          {places.map((place) => (
            <MenuItem key={place.id} value={place.id}>
              {place.name}
            </MenuItem>
          ))}
        </Select>
      </Field>
      <Field label="Precio">
        <Input name="price" type="number" min="0" step="0.01" defaultValue={price ?? "0"} />
      </Field>
      <Field label="Capacidad">
        <Input name="capacity" type="number" min="1" defaultValue={capacity ?? ""} />
      </Field>
      <Box component="section" aria-label="Fechas del evento" sx={{ display: "grid", gap: 1.5 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography component="h3" variant="h6">
              Fechas y horarios
            </Typography>
            <Typography component="p" color="text.secondary">
              Agrega todas las fechas en las que se realizará el evento.
            </Typography>
          </Box>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onChange([...occurrences, empty()])}
          >
            Agregar fecha
          </Button>
        </Box>
        {occurrences.map((item, index) => (
          <Paper
            key={item.id ?? `new-${index}`}
            variant="outlined"
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr)) auto" },
              alignItems: "end",
              gap: 1.5,
              p: 1.5,
              bgcolor: "background.default",
            }}
          >
            <Field label="Inicio">
              <Input
                type="datetime-local"
                required
                value={dateValue(item.startsAt)}
                onChange={(event) =>
                  onChange(
                    occurrences.map((value, position) =>
                      position === index ? { ...value, startsAt: event.target.value } : value,
                    ),
                  )
                }
              />
            </Field>
            <Field label="Fin">
              <Input
                type="datetime-local"
                required
                value={dateValue(item.endsAt)}
                onChange={(event) =>
                  onChange(
                    occurrences.map((value, position) =>
                      position === index ? { ...value, endsAt: event.target.value } : value,
                    ),
                  )
                }
              />
            </Field>
            <Field label="Timezone">
              <Input
                required
                value={item.timezone}
                onChange={(event) =>
                  onChange(
                    occurrences.map((value, position) =>
                      position === index ? { ...value, timezone: event.target.value } : value,
                    ),
                  )
                }
              />
            </Field>
            <Button
              variant="ghost"
              type="button"
              disabled={occurrences.length === 1}
              onClick={() => onChange(occurrences.filter((_, position) => position !== index))}
            >
              Eliminar fecha
            </Button>
          </Paper>
        ))}
      </Box>
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box component="label" sx={{ display: "grid", gap: 0.75, fontWeight: 600 }}>
      {label}
      {children}
    </Box>
  );
}
