"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Link as MuiLink } from "@mui/material";
import { UserMenu } from "./user-menu";
import { Button } from "@/components/ui/button";

type User = { name: string; email: string; role: string; image?: string | null };
const links = [
  { href: "/", label: "Inicio" },
  { href: "/eventos", label: "Eventos" },
  { href: "/lugares", label: "Lugares" },
  { href: "/categorias", label: "Categorías" },
];

export function PrimaryNav({ user }: { user: User | null }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Box
      component="nav"
      aria-label="Navegación principal"
      sx={{
        display: "flex",
        gap: 0.5,
        alignItems: "center",
        "@media (max-width:680px)": { width: "100%", overflowX: "auto" },
      }}
    >
      {links.map((link) => (
        <MuiLink
          component={Link}
          key={link.href}
          href={link.href}
          aria-current={isActive(link.href) ? "page" : undefined}
          underline="none"
          sx={{
            px: 1.5,
            py: 1.25,
            color: "#e9f1eb",
            whiteSpace: "nowrap",
            "&[aria-current='page']": { bgcolor: "#1d5143" },
            "&:hover": { bgcolor: "#1d5143" },
          }}
        >
          {link.label}
        </MuiLink>
      ))}
      {user ? (
        <UserMenu user={user} />
      ) : (
        <>
          <MuiLink
            component={Link}
            href="/login"
            aria-current={isActive("/login") ? "page" : undefined}
            underline="none"
            sx={{
              px: 1.5,
              py: 1.25,
              color: "#e9f1eb",
              whiteSpace: "nowrap",
              "&[aria-current='page']": { bgcolor: "#1d5143" },
            }}
          >
            Ingresar
          </MuiLink>
          <Button
            component={Link}
            href="/registro"
            aria-current={isActive("/registro") ? "page" : undefined}
          >
            Registrarse
          </Button>
        </>
      )}
    </Box>
  );
}
