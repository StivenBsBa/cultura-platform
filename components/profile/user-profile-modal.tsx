"use client";
import { useState } from "react";
import { Pencil, Trash2, KeyRound } from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { z } from "zod";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Modal } from "@/components/ui/modal";
import { Input, Select } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Alert, Avatar, Box, Chip, FormHelperText, MenuItem, Typography } from "@mui/material";
import { ActionGroup } from "@/components/ui/entity-card";
import { formatRoleLabel } from "@/lib/utils/user-role";
type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string | Date;
  image?: string | null;
};
const roles = ["USER", "CREATOR", "MODERATOR"] as const;
const imageSchema = z
  .union([z.string().url(), z.string().regex(/^\/api\/v1\/uploads\/object\?key=/), z.literal("")])
  .nullable()
  .optional();
const nameSchema = z
  .string()
  .trim()
  .min(2, "El nombre debe tener al menos 2 caracteres.")
  .max(100, "El nombre no puede superar 100 caracteres.");
const selfEditorSchema = z.object({ name: nameSchema, image: imageSchema });
const adminEditorSchema = z.object({
  name: nameSchema,
  email: z.string().trim().email("El correo no es válido.").max(254),
  role: z.enum(roles),
  image: imageSchema,
});
type FieldName = "name" | "email" | "role" | "image";
type FieldErrors = Partial<Record<FieldName, string>>;
export function UserProfileModal({
  open,
  user,
  self = false,
  admin = false,
  onClose,
  onSaved,
  onDeleted,
}: {
  open: boolean;
  user: UserRecord;
  self?: boolean;
  admin?: boolean;
  onClose: () => void;
  onSaved: (user: UserRecord) => void;
  onDeleted?: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<UserRecord>(() => user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  if (!open) return null;
  const canEdit = self || admin;
  const canDelete = admin && !self;
  const initials = (draft.name || "U")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("") || "U";
  function cancel() {
    setDraft(user);
    setError("");
    setFieldErrors({});
    setEditing(false);
  }
  async function save(event?: React.FormEvent) {
    event?.preventDefault();
    const parsed = (self ? selfEditorSchema : adminEditorSchema).safeParse(draft);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === "name" || field === "email" || field === "role" || field === "image")
          next[field] ??= issue.message;
      }
      setFieldErrors(next);
      setError("Revisa los campos indicados.");
      return;
    }
    setLoading(true);
    setError("");
    setFieldErrors({});
    const data = parsed.data as z.infer<typeof adminEditorSchema>;
    const body = self
      ? { name: data.name, image: data.image || null }
      : {
        userId: user.id,
        name: data.name,
        email: data.email.trim().toLowerCase(),
        role: data.role,
        image: data.image || null,
      };
    try {
      const response = await fetch(self ? "/api/v1/users/me" : "/api/v1/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        const fields = result?.error?.fields as FieldErrors | undefined;
        if (fields) setFieldErrors(fields);
        setError(result?.error?.message ?? "No fue posible guardar los cambios.");
        return;
      }
      onSaved(result.data);
      setDraft(result.data);
      setEditing(false);
      await Swal.fire({
        title: "Cambios guardados",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      setError("No fue posible conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }
  async function remove() {
    const confirmation = await Swal.fire({
      title: "¿Eliminar usuario?",
      text: "Solo se puede eliminar si no tiene contenido asociado.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#b83b32",
      reverseButtons: true,
    });
    if (!confirmation.isConfirmed) return;
    setLoading(true);
    try {
      const response = await fetch("/api/v1/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        setError(result?.error?.message ?? "No fue posible eliminar el usuario.");
        return;
      }
      onDeleted?.(user.id);
      onClose();
    } catch {
      setError("No fue posible conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }
  async function resetPassword() {
    const prompt = await Swal.fire({
      title: "Restablecer contraseña",
      text: "Define una contraseña temporal de al menos 8 caracteres. El usuario deberá cambiarla al iniciar sesión.",
      input: "password",
      inputAttributes: { minLength: "8", autoComplete: "new-password" },
      showCancelButton: true,
      confirmButtonText: "Restablecer",
      cancelButtonText: "Cancelar",
      inputValidator: (value) =>
        value.length < 8 ? "La contraseña temporal debe tener al menos 8 caracteres." : undefined,
    });
    if (!prompt.isConfirmed || !prompt.value) return;
    setLoading(true);
    try {
      const response = await fetch("/api/v1/admin/users/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, temporaryPassword: prompt.value }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(result?.error?.message ?? "No fue posible restablecer la contraseña.");
      await Swal.fire({
        title: "Contraseña temporal configurada",
        text: "Al iniciar sesión, el usuario deberá definir una nueva contraseña.",
        icon: "success",
      });
    } catch (error) {
      await Swal.fire({
        title: "No se pudo restablecer",
        text: error instanceof Error ? error.message : "Error inesperado",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  }
  return (
    <Modal title={self ? "Mi perfil" : "Perfil de usuario"} onClose={onClose} size="sm">
      <Avatar
        src={draft.image ?? undefined}
        alt="Avatar"
        sx={{ width: 72, height: 72, mb: 2, bgcolor: "secondary.main", fontWeight: 700 }}
      >
        {draft.image ? null : initials}
      </Avatar>
      {editing ? (
        <Box
          id="user-profile-edit-form"
          component="form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void save(event);
          }}
          sx={{ display: "grid", gap: 1.5 }}
        >
          <label>
            Nombre
            <Input
              autoFocus
              required
              value={draft.name}
              aria-invalid={Boolean(fieldErrors.name)}
              onChange={(event) => {
                setDraft({ ...draft, name: event.target.value });
                setFieldErrors((current) => ({ ...current, name: undefined }));
              }}
            />
          </label>
          {fieldErrors.name && <FormHelperText error>{fieldErrors.name}</FormHelperText>}
          {admin && (
            <label>
              Correo
              <Input
                type="email"
                required
                value={draft.email}
                aria-invalid={Boolean(fieldErrors.email)}
                onChange={(event) => {
                  setDraft({ ...draft, email: event.target.value });
                  setFieldErrors((current) => ({ ...current, email: undefined }));
                }}
              />
            </label>
          )}
          {admin && fieldErrors.email && <FormHelperText error>{fieldErrors.email}</FormHelperText>}
          {admin && (
            <label>
              Rol
              <Select
                value={draft.role}
                aria-invalid={Boolean(fieldErrors.role)}
                onChange={(event) => {
                  setDraft({ ...draft, role: event.target.value });
                  setFieldErrors((current) => ({ ...current, role: undefined }));
                }}
              >
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </label>
          )}
          {admin && fieldErrors.role && <FormHelperText error>{fieldErrors.role}</FormHelperText>}
          <Box sx={{ display: "grid", gap: 1 }}>
            <Typography component="p" sx={{ m: 0, fontWeight: 600 }}>
              Avatar
            </Typography>
            <ImageUploader
              kind="USER"
              entityId={draft.id}
              onUploaded={(url) => setDraft((current) => ({ ...current, image: url }))}
            />
            {fieldErrors.image && <FormHelperText error>{fieldErrors.image}</FormHelperText>}
          </Box>
        </Box>
      ) : (
        <Box
          component="dl"
          sx={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 1.25, "& dd": { m: 0 } }}
        >
          <dt>Nombre</dt>
          <dd>{draft.name}</dd>
          <dt>Correo</dt>
          <dd>{draft.email}</dd>
          <dt>Rol</dt>
          <dd>
            <Chip label={formatRoleLabel(draft.role)} size="small" color="secondary" />
          </dd>
          <dt>Registro</dt>
          <dd>
            {new Intl.DateTimeFormat("es-CO", { dateStyle: "long" }).format(
              new Date(draft.createdAt),
            )}
          </dd>
        </Box>
      )}
      {error && (
        <Alert severity="error" role="alert">
          {error}
        </Alert>
      )}
      <ActionGroup>
        {editing ? (
          <>
            <Button variant="ghost" type="button" onClick={cancel} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" form="user-profile-edit-form" loading={loading}>
              Guardar
            </Button>
          </>
        ) : (
          <>
            {canEdit && (
              <Button
                type="button"
                onClick={() => {
                  setError("");
                  setFieldErrors({});
                  setEditing(true);
                }}
              >
                <Pencil size={16} /> Editar
              </Button>
            )}
            {canDelete && (
              <Button
                variant="destructive"
                type="button"
                onClick={() => void remove()}
                disabled={loading}
              >
                <Trash2 size={16} /> Eliminar
              </Button>
            )}
            {admin && !self && (
              <Button
                variant="outline"
                type="button"
                onClick={() => void resetPassword()}
                disabled={loading}
              >
                <KeyRound size={16} /> Restablecer contraseña
              </Button>
            )}
            <Button variant="ghost" type="button" onClick={onClose}>
              Cerrar
            </Button>
          </>
        )}
      </ActionGroup>
    </Modal>
  );
}
