"use client";
import { useEffect, useRef } from "react";
import { Map as MapLibreMap, Marker, Popup, setWorkerUrl } from "maplibre-gl";
import { Box } from "@mui/material";
export function PlaceMap({
  latitude,
  longitude,
  zoom = 13,
  markers = [],
  interactive = false,
  onLocationChange,
}: {
  latitude: number;
  longitude: number;
  zoom?: number;
  markers?: Array<{ latitude: number; longitude: number; label?: string }>;
  interactive?: boolean;
  onLocationChange?: (location: { latitude: number; longitude: number }) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
    const map = new MapLibreMap({
      container: ref.current,
      style: process.env.NEXT_PUBLIC_MAP_STYLE_URL ?? "https://demotiles.maplibre.org/style.json",
      center: [longitude, latitude],
      zoom,
    });
    markers.forEach((marker) =>
      new Marker()
        .setLngLat([marker.longitude, marker.latitude])
        .setPopup(new Popup().setText(marker.label ?? "Lugar cultural"))
        .addTo(map),
    );
    if (interactive) {
      const marker = new Marker({ draggable: true }).setLngLat([longitude, latitude]).addTo(map);
      const update = () => {
        const point = marker.getLngLat();
        onLocationChange?.({ latitude: point.lat, longitude: point.lng });
      };
      marker.on("dragend", update);
      map.on("click", (event) => {
        marker.setLngLat(event.lngLat);
        onLocationChange?.({ latitude: event.lngLat.lat, longitude: event.lngLat.lng });
      });
    }
    return () => map.remove();
  }, [interactive, latitude, longitude, markers, onLocationChange, zoom]);
  return (
    <Box
      ref={ref}
      aria-label="Mapa de lugares"
      sx={{ minHeight: 320, borderRadius: 2, overflow: "hidden" }}
    />
  );
}
