"use client";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button as MuiButton,
  ButtonBase,
  CircularProgress,
  InputAdornment,
  OutlinedInput,
  Paper,
  Typography,
} from "@mui/material";
import { LocateFixed, Search } from "lucide-react";

export type LocationResult = {
  type: "CITY" | "PLACE" | "ADDRESS" | "POI";
  label: string;
  cityId?: string;
  placeId?: string;
  address?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  source: "LOCAL" | "GEOAPIFY";
};
type Props = {
  onSelect?: (result: LocationResult) => void;
  onUseLocation?: (lat: number, lng: number) => void;
  placeholder?: string;
  className?: string;
};

export function LocationAutocomplete({
  onSelect,
  onUseLocation,
  placeholder = "Medellín, Museo de Antioquia, Carrera 70",
  className,
}: Props) {
  const router = useRouter();
  const listId = useId();
  const controller = useRef<AbortController | null>(null);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<LocationResult[]>([]);
  const [active, setActive] = useState(-1);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  useEffect(() => {
    const value = query.trim();
    controller.current?.abort();
    if (value.length < 3) return;
    const timer = window.setTimeout(async () => {
      const request = new AbortController();
      controller.current = request;
      setStatus("loading");
      try {
        const response = await fetch(`/api/v1/locations/search?q=${encodeURIComponent(value)}`, {
          signal: request.signal,
        });
        if (!response.ok) throw new Error("location search failed");
        const body = (await response.json()) as { data?: LocationResult[] };
        setItems(body.data?.slice(0, 12) ?? []);
        setActive(-1);
        setStatus("idle");
      } catch (error) {
        if ((error as Error).name !== "AbortError") setStatus("error");
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);
  function select(item: LocationResult) {
    setQuery(item.label);
    setItems([]);
    onSelect?.(item);
    if (onSelect) return;
    const params = new URLSearchParams();
    if (item.type === "CITY" && item.cityId) params.set("cityId", item.cityId);
    if (item.type === "PLACE" && item.placeId) params.set("placeId", item.placeId);
    if (item.latitude !== undefined && item.longitude !== undefined) {
      params.set("lat", String(item.latitude));
      params.set("lng", String(item.longitude));
      params.set("radius", "10000");
    }
    router.push(`/lugares?${params}`);
  }
  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setStatus("error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (onUseLocation) onUseLocation(coords.latitude, coords.longitude);
        else router.push(`/lugares?lat=${coords.latitude}&lng=${coords.longitude}&radius=10000`);
      },
      () => setStatus("error"),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  }
  return (
    <Box className={className} sx={{ width: "100%", maxWidth: 900 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "stretch",
          gap: 1,
        }}
      >
        <Box sx={{ position: "relative", flex: 1, minWidth: 0 }}>
          <OutlinedInput
            fullWidth
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              if (event.target.value.trim().length < 3) {
                setItems([]);
                setStatus("idle");
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((value) => Math.min(value + 1, items.length - 1));
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((value) => Math.max(value - 1, 0));
              }
              if (event.key === "Enter" && active >= 0) {
                event.preventDefault();
                select(items[active]);
              }
              if (event.key === "Escape") setItems([]);
            }}
            inputProps={{
              role: "combobox",
              "aria-label": "Buscar ubicación",
              "aria-autocomplete": "list",
              "aria-controls": listId,
              "aria-expanded": items.length > 0,
            }}
            startAdornment={
              <InputAdornment position="start">
                <Search size={19} aria-hidden="true" />
              </InputAdornment>
            }
            endAdornment={
              status === "loading" ? (
                <InputAdornment position="end">
                  <CircularProgress size={18} aria-label="Buscando ubicación" />
                </InputAdornment>
              ) : undefined
            }
            placeholder={placeholder}
            sx={{
              minHeight: 56,
              bgcolor: "background.paper",
              borderRadius: 2,
              fontSize: "1rem",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#c8d5cf" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "secondary.main" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "secondary.main",
                borderWidth: 2,
              },
              "& input::placeholder": { color: "#6b7e75", opacity: 0.8 },
            }}
          />
          {items.length > 0 && (
            <Paper
              component="ul"
              id={listId}
              role="listbox"
              aria-label="Resultados de ubicación"
              elevation={5}
              sx={{
                position: "absolute",
                zIndex: 10,
                top: "calc(100% + 8px)",
                left: 0,
                right: 0,
                maxHeight: 320,
                overflowY: "auto",
                m: 0,
                p: 0.75,
                listStyle: "none",
                border: "1px solid #d7e2dc",
              }}
            >
              {items.map((item, index) => (
                <Box
                  component="li"
                  key={`${item.source}-${item.type}-${item.placeId ?? item.cityId ?? item.label}`}
                  role="option"
                  aria-selected={active === index}
                >
                  <ButtonBase
                    component="button"
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => select(item)}
                    sx={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      p: 1.25,
                      borderRadius: 1,
                      textAlign: "left",
                      bgcolor: active === index ? "action.selected" : "transparent",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {item.label}
                    </Typography>
                    {item.city && (
                      <Typography variant="body2" color="text.secondary">
                        {item.city}
                      </Typography>
                    )}
                  </ButtonBase>
                </Box>
              ))}
            </Paper>
          )}
        </Box>
        <MuiButton
          type="button"
          variant="contained"
          color="secondary"
          startIcon={<LocateFixed size={18} />}
          onClick={useCurrentLocation}
          sx={{
            minHeight: 56,
            px: 2.5,
            width: { xs: "100%", sm: "auto" },
            whiteSpace: "nowrap",
            borderRadius: 2,
            boxShadow: "none",
            "&:hover": { bgcolor: "#285f4c", boxShadow: 1 },
          }}
        >
          Usar mi ubicación
        </MuiButton>
      </Box>
      {status === "loading" && (
        <Typography
          component="p"
          variant="body2"
          color="text.secondary"
          aria-live="polite"
          sx={{ mt: 0.75 }}
        >
          Buscando ubicación…
        </Typography>
      )}
      {status === "error" && (
        <Typography component="p" color="error.main" role="alert" sx={{ mt: 0.75 }}>
          No fue posible consultar la ubicación.
        </Typography>
      )}
      {query.trim().length >= 3 && status === "idle" && items.length === 0 && (
        <Typography component="p" variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          No se encontraron ubicaciones.
        </Typography>
      )}
    </Box>
  );
}
