"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ContentAction } from "@/lib/permissions";
import { confirmAction, confirmDestructive, notifyAction } from "@/components/ui/confirm-action";
import { Button } from "@/components/ui/button";
import { Box } from "@mui/material";
type Row = { id: string; name: string; status: string };
export function ContentTableActions({
  row,
  kind,
  actions,
  onChanged,
}: {
  row: Row;
  kind: "events" | "places";
  actions: ContentAction[];
  onChanged?: () => void;
}) {
  const router = useRouter();
  const editPath = kind === "events" ? "eventos" : "lugares";
  const refresh = () => (onChanged ? onChanged() : router.refresh());
  async function request(method: "PATCH" | "DELETE", body?: object) {
    const response = await fetch(`/api/v1/${kind}/${row.id}`, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok)
      throw new Error(result?.error?.message ?? "No fue posible completar la acción.");
  }
  async function remove() {
    if (
      !(await confirmDestructive(`¿Eliminar “${row.name}”?`, "Esta acción no se puede deshacer."))
    )
      return;
    try {
      await request("DELETE");
      await notifyAction("Eliminado", "success");
      refresh();
    } catch (error) {
      await notifyAction(
        "No se pudo eliminar",
        "error",
        error instanceof Error ? error.message : "Error inesperado",
      );
    }
  }
  async function changeStatus(status: "PUBLISHED" | "REJECTED" | "ARCHIVED" | "PENDING_REVIEW") {
    const label =
      status === "PUBLISHED"
        ? "publicar"
        : status === "REJECTED"
          ? "rechazar"
          : status === "PENDING_REVIEW"
            ? "enviar a revisión"
            : "archivar";
    if (
      !(await confirmAction(
        `¿${label[0].toUpperCase()}${label.slice(1)} “${row.name}”?`,
        "La tarjeta se actualizará inmediatamente.",
        `Sí, ${label}`,
      ))
    )
      return;
    try {
      await request("PATCH", { status });
      await notifyAction(
        status === "PUBLISHED"
          ? "Publicado"
          : status === "REJECTED"
            ? "Rechazado"
            : status === "PENDING_REVIEW"
              ? "Enviado a revisión"
              : "Archivado",
        "success",
      );
      refresh();
    } catch (error) {
      await notifyAction(
        "No se pudo cambiar el estado",
        "error",
        error instanceof Error ? error.message : "Error inesperado",
      );
    }
  }
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {actions.includes("EDIT") && (
        <Button
          component={Link}
          href={`/dashboard/gestion/${editPath}/${row.id}/editar`}
          variant="ghost"
        >
          Editar
        </Button>
      )}
      {actions.includes("DELETE") && (
        <Button variant="ghost" type="button" onClick={() => void remove()}>
          Eliminar
        </Button>
      )}
      {actions.includes("APPROVE") && (
        <Button variant="ghost" type="button" onClick={() => void changeStatus("PUBLISHED")}>
          Aprobar
        </Button>
      )}
      {actions.includes("REJECT") && (
        <Button variant="ghost" type="button" onClick={() => void changeStatus("REJECTED")}>
          Rechazar
        </Button>
      )}
      {actions.includes("PUBLISH") && (
        <Button variant="ghost" type="button" onClick={() => void changeStatus("PUBLISHED")}>
          Publicar
        </Button>
      )}
      {actions.includes("ARCHIVE") && (
        <Button variant="ghost" type="button" onClick={() => void changeStatus("ARCHIVED")}>
          Archivar
        </Button>
      )}
      {actions.includes("SUBMIT_REVIEW") && (
        <Button variant="ghost" type="button" onClick={() => void changeStatus("PENDING_REVIEW")}>
          Enviar a revisión
        </Button>
      )}
    </Box>
  );
}
