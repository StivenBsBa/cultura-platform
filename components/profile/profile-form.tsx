"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/components/admin/image-uploader";
import { FormField, Input } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Alert, Box, Typography } from "@mui/material";
export function ProfileForm({
  id,
  name,
  image,
}: {
  id: string;
  name: string;
  image?: string | null;
}) {
  const [currentName, setName] = useState(name);
  const [currentImage, setImage] = useState(image ?? "");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const response = await fetch("/api/v1/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: currentName, image: currentImage || null }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        setStatus(result?.error?.message ?? "No fue posible guardar los cambios.");
        return;
      }
      setStatus("Perfil actualizado correctamente.");
      router.refresh();
    } catch {
      setStatus("No fue posible conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <Box
      component="form"
      onSubmit={submit}
      sx={{
        display: "grid",
        gap: 2,
        p: 2.5,
        bgcolor: "background.paper",
        borderRadius: 1.5,
        boxShadow: 1,
      }}
    >
      <Typography component="h2" variant="h5">
        Editar información
      </Typography>
      <FormField label="Nombre" htmlFor="profile-name" hint="Este nombre se mostrará en tu perfil y en tus publicaciones">
        <Input
          id="profile-name"
          value={currentName}
          onChange={(event) => setName(event.target.value)}
          minLength={2}
          maxLength={100}
          required
          autoComplete="name"
        />
      </FormField>
      <Box sx={{ display: "grid", gap: 1 }}>
        <Typography component="p" sx={{ m: 0, fontWeight: 600 }}>
          Avatar{" "}
          <Typography component="span" color="text.secondary">
            (almacenado en RustFS)
          </Typography>
        </Typography>
        <ImageUploader kind="USER" entityId={id} onUploaded={setImage} />
        {currentImage && (
          <Box
            component="img"
            src={currentImage}
            alt="Vista previa del avatar"
            sx={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }}
          />
        )}
      </Box>
      {status && (
        <Alert severity={status.includes("correctamente") ? "success" : "error"} role="status">
          {status}
        </Alert>
      )}
      <Button type="submit" disabled={loading} loading={loading}>
        Guardar cambios
      </Button>
    </Box>
  );
}
