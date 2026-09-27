"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Chip, Typography } from "@mui/material";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { RichTextRenderer } from "@/components/editor/rich-text-renderer";
import { EventCard } from "@/components/events/event-card";
import { DetailModal } from "@/components/ui/detail-modal";
import { Input, Textarea } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ActionGroup, ContentCardGrid } from "@/components/ui/entity-card";
import type { ContentAction } from "@/lib/permissions";

type EventRow = {
  id: string;
  name: string;
  summary: string | null;
  status: string;
  price: string;
  capacity: number | null;
  createdAt: string;
  author: { name: string | null; email: string };
  place: { name: string; city: { name: string } };
  categories: Array<{ category: { name: string } }>;
  occurrences: Array<{ startsAt: string; endsAt: string; timezone: string }>;
  coverMedia: { url: string } | null;
  content: unknown;
  actions: ContentAction[];
};

export function ModerationEventTable({ initial }: { initial: EventRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<EventRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: "", summary: "", price: "", capacity: "" });
  async function request(status: "PUBLISHED" | "REJECTED" | "ARCHIVED" | "DELETE") {
    if (!selected) return;
    const title =
      status === "PUBLISHED"
        ? "¿Aprobar este evento?"
        : status === "REJECTED"
          ? "¿Rechazar este evento?"
          : status === "ARCHIVED"
            ? "¿Archivar este evento?"
            : `¿Eliminar “${selected.name}”?`;
    const confirmation = await Swal.fire({
      title,
      text:
        status === "DELETE"
          ? "Esta acción no se puede deshacer."
          : "La tarjeta se actualizará inmediatamente.",
      icon: status === "PUBLISHED" ? "question" : "warning",
      showCancelButton: true,
      confirmButtonText:
        status === "DELETE"
          ? "Sí, eliminar"
          : status === "PUBLISHED"
            ? "Sí, aprobar"
            : "Sí, rechazar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: status === "DELETE" || status === "REJECTED" ? "#b83b32" : undefined,
      reverseButtons: true,
    });
    if (!confirmation.isConfirmed) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/v1/events/${selected.id}`, {
        method: status === "DELETE" ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        ...(status === "DELETE" ? {} : { body: JSON.stringify({ status }) }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(result?.error?.message ?? "No fue posible completar la acción.");
      await Swal.fire({
        title:
          status === "PUBLISHED"
            ? "Evento aprobado"
            : status === "REJECTED"
              ? "Evento rechazado"
              : status === "ARCHIVED"
                ? "Evento archivado"
                : "Evento eliminado",
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
      });
      setSelected(null);
      router.refresh();
    } catch (error) {
      await Swal.fire({
        title: "No fue posible completar la acción",
        text: error instanceof Error ? error.message : "Error inesperado",
        icon: "error",
      });
    } finally {
      setBusy(false);
    }
  }
  if (!initial.length) return <EmptyState>No hay eventos pendientes.</EmptyState>;
  return (
    <>
      <ContentCardGrid>
        {initial.map((event) => (
          <EventCard
            key={event.id}
            event={{
              ...event,
              slug: "",
              price: { toString: () => event.price },
              occurrences: event.occurrences.map((occurrence) => ({
                startsAt: new Date(occurrence.startsAt),
              })),
            }}
            actions={
              <Button
                type="button"
                onClick={() => {
                  setSelected(event);
                  setEditing(false);
                  setDraft({
                    name: event.name,
                    summary: event.summary ?? "",
                    price: event.price,
                    capacity: event.capacity?.toString() ?? "",
                  });
                }}
              >
                Ver
              </Button>
            }
          />
        ))}
      </ContentCardGrid>
      {selected && (
        <DetailModal
          title="Detalle del evento"
          contentSx={{ display: "grid", gap: 1 }}
          onClose={() => setSelected(null)}
        >
          <Typography component="p" color="text.secondary">
            Evento pendiente
          </Typography>
          {editing ? (
            <Input
              aria-label="Nombre"
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            />
          ) : (
            <h2 id="moderation-title">{selected.name}</h2>
          )}
          {selected.coverMedia?.url && (
            <Box
              component="img"
              src={selected.coverMedia.url}
              alt="Portada del evento"
              sx={{ width: "100%", maxHeight: 448, objectFit: "cover", borderRadius: 2 }}
            />
          )}
          <Box
            component="dl"
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
              gap: "0.75rem 1rem",
              "& dd": { m: "0.15rem 0 0" },
            }}
          >
            <div>
              <dt>Resumen</dt>
              <dd>
                {editing ? (
                  <Textarea
                    value={draft.summary}
                    onChange={(event) => setDraft({ ...draft, summary: event.target.value })}
                  />
                ) : (
                  (selected.summary ?? "")
                )}
              </dd>
            </div>
            <div>
              <dt>Lugar</dt>
              <dd>
                {selected.place.name}, {selected.place.city.name}
              </dd>
            </div>
            <div>
              <dt>Precio</dt>
              <dd>
                {editing ? (
                  <Input
                    type="number"
                    min="0"
                    value={draft.price}
                    onChange={(event) => setDraft({ ...draft, price: event.target.value })}
                  />
                ) : (
                  `$${selected.price}`
                )}
              </dd>
            </div>
            <div>
              <dt>Capacidad</dt>
              <dd>
                {editing ? (
                  <Input
                    type="number"
                    min="1"
                    value={draft.capacity}
                    onChange={(event) => setDraft({ ...draft, capacity: event.target.value })}
                  />
                ) : (
                  (selected.capacity ?? "Sin límite")
                )}
              </dd>
            </div>
            <div>
              <dt>Autor</dt>
              <dd>{selected.author.name ?? selected.author.email}</dd>
            </div>
            <div>
              <dt>Estado</dt>
              <dd>{selected.status}</dd>
            </div>
          </Box>
          <Typography component="p" sx={{ m: 0, fontWeight: 600 }}>
            Categorías
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {selected.categories.map(({ category }) => (
              <Chip key={category.name} label={category.name} size="small" color="secondary" />
            ))}
          </Box>
          <Typography component="p" sx={{ m: 0, fontWeight: 600 }}>
            Ocurrencias
          </Typography>
          <ul>
            {selected.occurrences.map((occurrence) => (
              <li key={occurrence.startsAt}>
                {new Intl.DateTimeFormat("es-CO", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(occurrence.startsAt))}{" "}
                —{" "}
                {new Intl.DateTimeFormat("es-CO", { timeStyle: "short" }).format(
                  new Date(occurrence.endsAt),
                )}{" "}
                ({occurrence.timezone})
              </li>
            ))}
          </ul>
          <Typography component="p" sx={{ m: 0, fontWeight: 600 }}>
            Contenido
          </Typography>
          <RichTextRenderer content={selected.content as never} />
          <ActionGroup>
            {editing ? (
              <>
                <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                  Cancelar
                </Button>
                <Button
                  type="button"
                  loading={busy}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      const response = await fetch(`/api/v1/events/${selected.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: draft.name,
                          summary: draft.summary,
                          price: Number(draft.price),
                          capacity: draft.capacity ? Number(draft.capacity) : undefined,
                        }),
                      });
                      if (!response.ok) throw new Error("No fue posible guardar los cambios");
                      setEditing(false);
                      await Swal.fire({
                        title: "Evento actualizado",
                        icon: "success",
                        timer: 1300,
                        showConfirmButton: false,
                      });
                      router.refresh();
                    } catch (error) {
                      await Swal.fire({
                        title: "No se pudo actualizar",
                        text: error instanceof Error ? error.message : "Error inesperado",
                        icon: "error",
                      });
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Guardar
                </Button>
              </>
            ) : selected.actions.includes("EDIT") ? (
              <Button type="button" variant="outline" onClick={() => setEditing(true)}>
                Editar
              </Button>
            ) : null}
            {selected.actions.includes("REJECT") && (
              <Button
                type="button"
                variant="destructive"
                disabled={busy || editing}
                onClick={() => void request("REJECTED")}
              >
                Rechazar
              </Button>
            )}
            {(selected.actions.includes("APPROVE") || selected.actions.includes("PUBLISH")) && (
              <Button
                type="button"
                disabled={busy || editing}
                onClick={() => void request("PUBLISHED")}
              >
                Aprobar
              </Button>
            )}
            {selected.actions.includes("DELETE") && (
              <Button
                type="button"
                variant="destructive"
                disabled={busy || editing}
                onClick={() => void request("DELETE")}
              >
                Eliminar
              </Button>
            )}
            {selected.actions.includes("ARCHIVE") && (
              <Button
                type="button"
                variant="outline"
                disabled={busy || editing}
                onClick={() => void request("ARCHIVED")}
              >
                Archivar
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={() => setSelected(null)}>
              Cerrar
            </Button>
          </ActionGroup>
        </DetailModal>
      )}
    </>
  );
}
