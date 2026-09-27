"use client";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Alert, Box, IconButton, Typography } from "@mui/material";
import { Button } from "@/components/ui/button";
import { FieldError, FormField, Input } from "@/components/ui/form-field";
export function LoginForm() {
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();
  const router = useRouter();
  const passwordChanged = params.get("passwordChanged") === "1";
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = new FormData(event.currentTarget);
      const email = data.get("email");
      const password = data.get("password");
      if (typeof email !== "string" || typeof password !== "string") {
        setError("Ingresa tu correo y contraseña.");
        return;
      }
      const candidate = params.get("callbackUrl") ?? "";
      const callbackUrl =
        candidate.startsWith("/") && !candidate.startsWith("//") ? candidate : "/dashboard";
      const result = await signIn("credentials", { email, password, redirect: false, callbackUrl });
      if (!result?.ok) {
        setError("Correo o contraseña incorrectos.");
        return;
      }
      router.replace(callbackUrl);
      router.refresh();
    } catch {
      setError("No fue posible iniciar sesión. Verifica tu conexión e inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <Box
      component="form"
      onSubmit={submit}
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
        <Alert severity="success" role="status">
          Contraseña actualizada. Inicia sesión con tu nueva contraseña.
        </Alert>
      )}
      <FormField label="Email" htmlFor="login-email">
        <Input id="login-email" name="email" type="email" autoComplete="email" required />
      </FormField>
      <FormField label="Contraseña" htmlFor="login-password" hint="Usa la contraseña de tu cuenta">
        <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
          <Input
            id="login-password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            sx={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
          />
          <IconButton
            type="button"
            onClick={() => setShow(!show)}
            aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
            sx={{ border: "1px solid", borderColor: "divider", borderLeft: 0, borderRadius: "0 8px 8px 0", height: 40 }}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </IconButton>
        </Box>
      </FormField>
      {error && <FieldError>{error}</FieldError>}
      <Button type="submit" loading={loading}>Ingresar</Button>
      <Typography component="p" color="text.secondary">
        ¿No tienes cuenta? <Link href="/registro">Registrarse</Link>
      </Typography>
    </Box>
  );
}
