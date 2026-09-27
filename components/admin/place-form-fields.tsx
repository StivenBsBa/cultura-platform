import { Input } from "@/components/ui/form-field";
import {
  LocationAutocomplete,
  type LocationResult,
} from "@/components/public/location-autocomplete";
import { PlaceMap } from "@/components/maps/place-map";
import { Box, Typography } from "@mui/material";
type Props = {
  address: string;
  cityId: string;
  latitude?: number;
  longitude?: number;
  requiredCoordinates: boolean;
  onAddress: (value: string) => void;
  onCityId: (value: string) => void;
  onCoordinates: (lat: number, lng: number) => void;
  onSelect: (result: LocationResult) => void;
};
export function PlaceFormFields({
  address,
  cityId,
  latitude,
  longitude,
  requiredCoordinates,
  onAddress,
  onCityId,
  onCoordinates,
  onSelect,
}: Props) {
  return (
    <>
      <Box sx={{ display: "grid", gap: 0.75 }}>
        <Typography component="span" sx={{ fontWeight: 600 }}>
          Buscar ubicación
        </Typography>
        <LocationAutocomplete
          onSelect={onSelect}
          onUseLocation={onCoordinates}
          placeholder="Buscar dirección, POI o municipio"
        />
      </Box>
      <Field label="Dirección">
        <Input
          name="address"
          required
          value={address}
          onChange={(event) => onAddress(event.target.value)}
        />
      </Field>
      <Field label="Ciudad ID">
        <Input
          name="cityId"
          required
          placeholder="cuid de la ciudad"
          value={cityId}
          onChange={(event) => onCityId(event.target.value)}
        />
      </Field>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
          gap: 2,
        }}
      >
        <Field label="Latitud">
          <Input
            name="lat"
            type="number"
            step="any"
            min="-90"
            max="90"
            required={requiredCoordinates}
            value={latitude ?? ""}
            onChange={(event) =>
              onCoordinates(
                event.target.value === "" ? NaN : Number(event.target.value),
                longitude ?? NaN,
              )
            }
          />
        </Field>
        <Field label="Longitud">
          <Input
            name="lng"
            type="number"
            step="any"
            min="-180"
            max="180"
            required={requiredCoordinates}
            value={longitude ?? ""}
            onChange={(event) =>
              onCoordinates(
                latitude ?? NaN,
                event.target.value === "" ? NaN : Number(event.target.value),
              )
            }
          />
        </Field>
      </Box>
      {latitude !== undefined && longitude !== undefined && (
        <PlaceMap
          latitude={latitude}
          longitude={longitude}
          interactive
          onLocationChange={({ latitude: lat, longitude: lng }) => onCoordinates(lat, lng)}
        />
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box component="label" sx={{ display: "grid", gap: 0.75, fontWeight: 600 }}>
      {label}
      {children}
    </Box>
  );
}
