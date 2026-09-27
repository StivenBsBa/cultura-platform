"use client";
import { useRouter } from "next/navigation";
import { confirmDestructive, notifyAction } from "@/components/ui/confirm-action";
import { Button } from "@/components/ui/button";
export function MediaDeleteButton({
  id,
  name,
  onDeleted,
}: {
  id: string;
  name: string;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  async function remove() {
    if (
      !(await confirmDestructive(
        `¿Eliminar “${name}”?`,
        "También se eliminará el archivo de RustFS.",
      ))
    )
      return;
    const response = await fetch(`/api/v1/admin/media/${id}`, { method: "DELETE" });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      await notifyAction(
        "No se pudo eliminar",
        "error",
        result?.error?.message ?? "Error inesperado",
      );
      return;
    }
    await notifyAction("Media eliminada", "success");
    onDeleted?.();
    router.refresh();
  }
  return (
    <Button variant="destructive" type="button" onClick={() => void remove()}>Eliminar</Button>
  );
}
