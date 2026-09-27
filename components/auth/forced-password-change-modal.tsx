"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form-field";
import { Alert, Box, Dialog, DialogContent, DialogTitle, Typography } from "@mui/material";

export function ForcedPasswordChangeModal() {
  const { data: session } = useSession();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  if (!session?.user?.mustChangePassword) return null;
  async function save() {
    if (password.length < 8)
      return setError("La nueva contraseña debe tener al menos 8 caracteres.");
    if (password !== confirmPassword) return setError("Las contraseñas no coinciden.");
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/v1/users/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok)
        return setError(result?.error?.message ?? "No fue posible cambiar la contraseña.");
      await signOut({ redirect: false });
      router.replace("/login?passwordChanged=1");
      router.refresh();
    } catch {
      setError("No fue posible conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <Dialog
      open
      onClose={() => {}}
      maxWidth={false}
      slotProps={{ paper: { sx: { width: "min(100% - 2rem, 520px)", p: 1 } } }}
    >
      <DialogTitle id="forced-password-title" sx={{ pb: 1 }}>
        Crea una nueva contraseña
      </DialogTitle>
      <DialogContent sx={{ display: "grid", gap: 2 }}>
        <Box sx={{ color: "primary.main" }}>
          <LockKeyhole size={28} />
        </Box>
        <Typography
          component="p"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            color: "secondary.main",
            fontWeight: 700,
          }}
        >
          <ShieldCheck size={15} /> Seguridad de cuenta
        </Typography>
        <Typography component="p" color="text.secondary">
          Tu administrador restableció tu contraseña. Debes crear una nueva para continuar.
        </Typography>
        <Box component="label" sx={{ display: "grid", gap: 0.75, fontWeight: 600 }}>
          Nueva contraseña
          <Input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={loading}
          />
        </Box>
        <Box component="label" sx={{ display: "grid", gap: 0.75, fontWeight: 600 }}>
          Confirmar contraseña
          <Input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            disabled={loading}
          />
        </Box>
        {error && (
          <Alert severity="error" role="alert">
            {error}
          </Alert>
        )}
        <Button type="button" loading={loading} onClick={() => void save()}>
          Guardar nueva contraseña
        </Button>
      </DialogContent>
    </Dialog>
  );
}
