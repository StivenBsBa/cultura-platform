"use client";
import { useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { Box, Chip, MenuItem, Paper, Typography } from "@mui/material";
import { DetailModal } from "@/components/ui/detail-modal";
import { ActionGroup } from "@/components/ui/entity-card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/form-field";
type Category = {
  id: string;
  name: string;
  description: string;
  scope: "EVENT" | "PLACE" | "BOTH";
  slug: string;
  createdAt: string | Date;
  _count: { events: number; places: number };
};
const scopes = [
  { value: "EVENT", label: "Evento" },
  { value: "PLACE", label: "Lugar" },
  { value: "BOTH", label: "Ambos" },
] as const;
export function CategoryManager({ initial }: { initial: Category[] }) {
  const [items, setItems] = useState(initial);
  const [selected, setSelected] = useState<Category | null>(null);
  const [draft, setDraft] = useState<Category | null>(null);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  function view(item: Category) {
    setSelected(item);
    setDraft(item);
    setEditing(false);
    setOpen(true);
  }
  function create() {
    setSelected(null);
    setDraft({
      id: "",
      name: "",
      description: "",
      scope: "BOTH",
      slug: "",
      createdAt: new Date(),
      _count: { events: 0, places: 0 },
    });
    setEditing(true);
    setOpen(true);
  }
  function close() {
    setOpen(false);
    setSelected(null);
    setDraft(null);
    setEditing(false);
  }
  function cancel() {
    setDraft(selected);
    setEditing(false);
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!draft || draft.name.trim().length < 2) {
      await Swal.fire({
        title: "Nombre inválido",
        text: "El nombre debe tener al menos 2 caracteres.",
        icon: "error",
      });
      return;
    }
    setBusy(true);
    const response = await fetch(
      selected ? `/api/v1/admin/categories/${selected.id}` : "/api/v1/admin/categories",
      {
        method: selected ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          description: draft.description,
          scope: draft.scope,
        }),
      },
    );
    const result = await response.json().catch(() => null);
    setBusy(false);
    if (!response.ok) {
      await Swal.fire({
        title: "No se pudo guardar",
        text: result?.error?.message ?? "Revisa los datos.",
        icon: "error",
      });
      return;
    }
    setItems((current) =>
      selected
        ? current.map((item) => (item.id === selected.id ? result.data : item))
        : [...current, result.data],
    );
    setSelected(result.data);
    setDraft(result.data);
    setEditing(false);
    await Swal.fire({
      title: selected ? "Categoría actualizada" : "Categoría creada",
      icon: "success",
      timer: 1400,
      showConfirmButton: false,
    });
  }
  async function remove(item: Category) {
    const confirm = await Swal.fire({
      title: `¿Eliminar “${item.name}”?`,
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#b83b32",
      reverseButtons: true,
    });
    if (!confirm.isConfirmed) return;
    const response = await fetch(`/api/v1/admin/categories/${item.id}`, { method: "DELETE" });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      await Swal.fire({
        title: "No se puede eliminar",
        text: result?.error?.message ?? "La categoría tiene referencias.",
        icon: "error",
      });
      return;
    }
    setItems((current) => current.filter((entry) => entry.id !== item.id));
    if (selected?.id === item.id) close();
    await Swal.fire({
      title: "Categoría eliminada",
      icon: "success",
      timer: 1400,
      showConfirmButton: false,
    });
  }
  const scopeLabel = (scope: Category["scope"]) =>
    scopes.find((item) => item.value === scope)?.label;
  return (
    <Paper component="section" sx={{ p: 2.5, borderRadius: 1.5, boxShadow: 1 }}>
      <Button type="button" onClick={create}>
        Nueva categoría
      </Button>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 2,
          mt: 2,
        }}
      >
        {items.map((item) => (
          <Paper
            component="article"
            variant="outlined"
            key={item.id}
            tabIndex={0}
            role="button"
            sx={{
              minHeight: 210,
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1,
              cursor: "pointer",
              boxShadow: "0 7px 20px rgba(17, 61, 49, 0.06)",
              "&:hover, &:focus-visible": {
                borderColor: "#85aa9b",
                boxShadow: "0 12px 26px rgba(17, 61, 49, 0.12)",
                outline: "none",
              },
            }}
            onClick={() => view(item)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") view(item);
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Chip label={scopeLabel(item.scope)} size="small" color="secondary" />
              <Typography color="text.secondary">
                {new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(
                  new Date(item.createdAt),
                )}
              </Typography>
            </Box>
            <Typography component="h2" variant="h6">
              {item.name}
            </Typography>
            <Typography component="p" color="text.secondary">
              {item.description || "Sin descripción"}
            </Typography>
            <Typography component="strong" sx={{ mt: "auto", fontWeight: 700 }}>
              {item._count.events + item._count.places} relacionados
            </Typography>
            <Box
              sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
              onClick={(event) => event.stopPropagation()}
            >
              <Button variant="outline" type="button" onClick={() => view(item)}>
                <Eye size={16} /> Ver
              </Button>
              <Button variant="destructive" type="button" onClick={() => void remove(item)}>
                <Trash2 size={15} /> Eliminar
              </Button>
            </Box>
          </Paper>
        ))}
      </Box>
      {items.length === 0 && (
        <Typography component="p" sx={{ mt: 2, color: "text.secondary" }}>
          No hay categorías.
        </Typography>
      )}
      {open && draft && (
        <DetailModal title={selected ? "Categoría" : "Nueva categoría"} onClose={close}>
          {editing ? (
            <Box
              component="form"
              onSubmit={(event) => void save(event)}
              sx={{ display: "grid", gap: 2 }}
            >
              <Box component="label" sx={{ display: "grid", gap: 0.75, fontWeight: 600 }}>
                Nombre
                <Input
                  autoFocus
                  required
                  minLength={2}
                  maxLength={80}
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                />
              </Box>
              <Box component="label" sx={{ display: "grid", gap: 0.75, fontWeight: 600 }}>
                Descripción
                <Textarea
                  rows={4}
                  maxLength={500}
                  value={draft.description}
                  onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                />
              </Box>
              <Box component="label" sx={{ display: "grid", gap: 0.75, fontWeight: 600 }}>
                Tipo de uso
                <Select
                  value={draft.scope}
                  onChange={(event) =>
                    setDraft({ ...draft, scope: event.target.value as Category["scope"] })
                  }
                >
                  {scopes.map((scope) => (
                    <MenuItem key={scope.value} value={scope.value}>
                      {scope.label}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
              <ActionGroup>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={selected ? cancel : close}
                  disabled={busy}
                >
                  Cancelar
                </Button>
                <Button loading={busy}>Guardar</Button>
              </ActionGroup>
            </Box>
          ) : (
            <>
              <Box
                component="dl"
                sx={{
                  display: "grid",
                  gridTemplateColumns: "110px 1fr",
                  gap: 1.25,
                  "& dd": { m: 0 },
                }}
              >
                <dt>Nombre</dt>
                <dd>{draft.name}</dd>
                <dt>Descripción</dt>
                <dd>{draft.description || "—"}</dd>
                <dt>Tipo</dt>
                <dd>
                  <Chip label={scopeLabel(draft.scope)} size="small" color="secondary" />
                </dd>
                <dt>Slug</dt>
                <dd>{draft.slug}</dd>
                <dt>Usos</dt>
                <dd>{draft._count.events + draft._count.places}</dd>
                <dt>Creación</dt>
                <dd>
                  {new Intl.DateTimeFormat("es-CO", { dateStyle: "long" }).format(
                    new Date(draft.createdAt),
                  )}
                </dd>
              </Box>
              <ActionGroup>
                <Button component={Link} href={`/categorias/${draft.slug}`} variant="outline">
                  Ver relacionados
                </Button>
                <Button type="button" onClick={() => setEditing(true)}>
                  <Pencil size={16} /> Editar
                </Button>
                <Button variant="destructive" type="button" onClick={() => void remove(draft)}>
                  <Trash2 size={16} /> Eliminar
                </Button>
                <Button variant="ghost" type="button" onClick={close}>
                  Cerrar
                </Button>
              </ActionGroup>
            </>
          )}
        </DetailModal>
      )}
    </Paper>
  );
}
