"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FieldError, Input } from "@/components/ui/form-field";
import { useState } from "react";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { Box, Typography } from "@mui/material";
import { PageContainer } from "@/components/ui/page-container";
const registerFormSchema = z
  .object({
    name: z.string().trim().min(2, "Escribe tu nombre."),
    email: z.string().trim().email("Correo inválido."),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden.",
  });
export default function RegisterPage() {
  const { status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(formData: FormData) {
    const parsed = registerFormSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Revisa los datos.");
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: parsed.data.name,
          email: parsed.data.email,
          password: parsed.data.password,
        }),
      });
      const result = await response.json().catch(() => null);
      if (response.ok) {
        await Swal.fire({
          title: "Cuenta creada",
          text: "Tu cuenta fue creada correctamente. Ahora puedes iniciar sesión.",
          icon: "success",
          confirmButtonText: "Ir a iniciar sesión",
          allowOutsideClick: false,
        });
        router.replace("/login");
      } else if (response.status === 409)
        setError("Este correo ya está registrado. Usa otro correo o inicia sesión.");
      else if (response.status === 429)
        setError("Demasiados intentos. Espera unos minutos antes de intentarlo de nuevo.");
      else
        setError(
          result?.error?.fields?.email ??
            result?.error?.fields?.password ??
            result?.error?.message ??
            "No fue posible crear la cuenta.",
        );
    } catch {
      setError("No fue posible conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <PageContainer
      component="main"
      sx={{ minHeight: "70vh", display: "grid", placeItems: "center" }}
    >
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
          Crea tu cuenta
        </Typography>
        <Box component="label" sx={{ display: "grid", gap: 0.75, fontWeight: 600 }}>
          Nombre
          <Input name="name" autoComplete="name" required />
        </Box>
        <Box component="label" sx={{ display: "grid", gap: 0.75, fontWeight: 600 }}>
          Correo
          <Input name="email" type="email" autoComplete="email" required />
        </Box>
        <Box component="label" sx={{ display: "grid", gap: 0.75, fontWeight: 600 }}>
          Contraseña
          <Input
            name="password"
            type="password"
            minLength={8}
            autoComplete="new-password"
            required
          />
        </Box>
        <Box component="label" sx={{ display: "grid", gap: 0.75, fontWeight: 600 }}>
          Confirmar contraseña
          <Input name="confirmPassword" type="password" autoComplete="new-password" required />
        </Box>
        {error && <FieldError>{error}</FieldError>}
        <Button loading={loading}>Registrarme</Button>
        <Typography component="p" color="text.secondary">
          ¿Ya tienes cuenta? <Link href="/login">Ingresar</Link>
        </Typography>
      </Box>
    </PageContainer>
  );
}
