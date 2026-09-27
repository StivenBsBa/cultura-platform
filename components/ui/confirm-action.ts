"use client";

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export async function confirmDestructive(title: string, text: string) {
  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#b83b32",
    reverseButtons: true,
  });
  return result.isConfirmed;
}

export async function confirmAction(title: string, text: string, confirmButtonText: string) {
  const result = await Swal.fire({
    title,
    text,
    icon: "question",
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: "Cancelar",
    reverseButtons: true,
  });
  return result.isConfirmed;
}

export async function notifyAction(title: string, icon: "success" | "error", text?: string) {
  await Swal.fire({
    title,
    text,
    icon,
    ...(icon === "success" ? { timer: 1300, showConfirmButton: false } : {}),
  });
}
