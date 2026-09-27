"use client";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { Button } from "@/components/ui/button";
import { FieldError, Input } from "@/components/ui/form-field";
export function LoginForm() {
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();
  const router = useRouter();
  const passwordChanged = params.get("passwordChanged") === "1";
  async function submit(data: FormData) {
    setLoading(true);
    setError("");
    const candidate = params.get("callbackUrl") ?? "";
    const callbackUrl =
      candidate.startsWith("/") && !candidate.startsWith("//") ? candidate : "/dashboard";
    const result = await signIn("credentials", {
      email: data.get("email"),
      password: data.get("password"),
      redirect: false,
      callbackUrl,
    });
    setLoading(false);
    if (result?.error) setError("Correo o contraseña incorrectos.");
    else {
      router.replace(callbackUrl);
      router.refresh();
    }
  }
  return (
    <Box
      component="form"
      action={submit}
      sx={{
        width: "min(100%, 420px)",
        display: "grid",
        gap: 2,
        p: 2.5,
        bgcolor: "background.paper",
        borderRadius: 1.5,
        boxShadow: 1,
      }}
    >
      <Typography component="h1" variant="h4">
        Bienvenido nuevamente
      </Typography>
      {passwordChanged && (
        <Typography component="p" role="status">
          Contraseña actualizada. Inicia sesión con tu nueva contraseña.
        </Typography>
      )}
      <Box component="label" sx={{ display: "grid", gap: 0.75, fontWeight: 600 }}>
        Email
        <Input name="email" type="email" autoComplete="email" required />
      </Box>
      <Box component="label" sx={{ display: "grid", gap: 0.75, fontWeight: 600 }}>
        Contraseña
        <Box sx={{ display: "flex", minWidth: 0 }}>
          <Input
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
          />
          <IconButton
            type="button"
            onClick={() => setShow(!show)}
            aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </IconButton>
        </Box>
      </Box>
      {error && <FieldError>{error}</FieldError>}
      <Button loading={loading}>Ingresar</Button>
      <Typography component="p" color="text.secondary">
        ¿No tienes cuenta? <Link href="/registro">Registrarse</Link>
      </Typography>
    </Box>
  );
}
