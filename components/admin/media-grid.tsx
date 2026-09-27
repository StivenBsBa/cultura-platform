"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MediaDeleteButton } from "@/components/admin/media-delete-button";
import { ImageUploader } from "@/components/admin/image-uploader";
import { EntityCard, EntityGrid, StatusBadge } from "@/components/ui/entity-card";
import { DetailModal } from "@/components/ui/detail-modal";
import { Input } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { ActionGroup } from "@/components/ui/entity-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert, Box, Paper, Typography } from "@mui/material";

type Media = {
  id: string;
  url: string;
  alt: string | null;
  provider: string;
  createdAt: string;
  owner: { name: string; email: string };
};

export function MediaGrid({ initial }: { initial: Media[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [selected, setSelected] = useState<Media | null>(null);
  const [editing, setEditing] = useState(false);
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function saveAlt() {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/v1/admin/media/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alt }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error?.message ?? "No fue posible actualizar.");
      setItems((current) => current.map((item) => (item.id === selected.id ? result.data : item)));
      setSelected(result.data);
      setEditing(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "No fue posible actualizar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Paper component="section" sx={{ p: 2.5, mb: 2, borderRadius: 1.5, boxShadow: 1 }}>
        <Box component="h2" sx={{ mt: 0 }}>
          Subir imagen
        </Box>
        <ImageUploader kind="CATEGORY" onUploaded={() => router.refresh()} />
      </Paper>
      {items.length === 0 && <EmptyState>Todavía no hay imágenes.</EmptyState>}
      <EntityGrid>
        {items.map((item) => (
          <EntityCard
            key={item.id}
            role="button"
            tabIndex={0}
            onClick={() => setSelected(item)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") setSelected(item);
            }}
          >
            <Box
              component="img"
              src={item.url}
              alt=""
              sx={{
                width: "100%",
                height: 130,
                borderRadius: 1,
                bgcolor: "#eef3f0",
                objectFit: "cover",
              }}
            />
            <h3>{item.alt || "Imagen sin descripción"}</h3>
            <Typography sx={{ color: "text.secondary", m: 0 }}>
              {item.owner.name || item.owner.email}
            </Typography>
            <StatusBadge>{item.provider}</StatusBadge>
            <Typography sx={{ color: "text.secondary", fontSize: "0.86rem" }}>
              {new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(
                new Date(item.createdAt),
              )}
            </Typography>
          </EntityCard>
        ))}
      </EntityGrid>
      {selected && (
        <DetailModal title={selected.alt || "Imagen"} onClose={() => setSelected(null)}>
          <Box
            component="img"
            src={selected.url}
            alt={selected.alt || ""}
            sx={{ width: "100%", maxHeight: "60vh", objectFit: "contain" }}
          />
          <Typography component="p" color="text.secondary">
            Propietario: {selected.owner.name || selected.owner.email}
          </Typography>
          {editing ? (
            <label>
              Descripción
              <Input
                autoFocus
                maxLength={180}
                value={alt}
                onChange={(event) => setAlt(event.target.value)}
              />
            </label>
          ) : null}
          {error && <Alert severity="error">{error}</Alert>}
          <ActionGroup>
            <Button
              component="a"
              variant="outline"
              href={selected.url}
              target="_blank"
              rel="noreferrer"
            >
              Ver archivo
            </Button>
            {editing ? (
              <>
                <Button
                  variant="ghost"
                  type="button"
                  disabled={busy}
                  onClick={() => setEditing(false)}
                >
                  Cancelar
                </Button>
                <Button type="button" loading={busy} onClick={() => void saveAlt()}>
                  Guardar
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setAlt(selected.alt ?? "");
                  setEditing(true);
                }}
              >
                Editar descripción
              </Button>
            )}
            <MediaDeleteButton
              id={selected.id}
              name={selected.alt || "esta imagen"}
              onDeleted={() => {
                setItems((current) => current.filter((item) => item.id !== selected.id));
                setSelected(null);
              }}
            />
            <Button variant="ghost" type="button" onClick={() => setSelected(null)}>
              Cerrar
            </Button>
          </ActionGroup>
        </DetailModal>
      )}
    </>
  );
}
