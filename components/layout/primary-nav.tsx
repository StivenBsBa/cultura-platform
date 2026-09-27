"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  Link as MuiLink,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const renderDesktopLink = (href: string, label: string) => (
    <MuiLink
      key={href}
      component={Link}
      href={href}
      aria-current={isActive(href) ? "page" : undefined}
      underline="none"
      sx={{
        px: 1.5,
        py: 1.25,
        color: "#e9f1eb",
        borderRadius: 1,
        whiteSpace: "nowrap",
        "&[aria-current='page']": { bgcolor: "#1d5143" },
        "&:hover": { bgcolor: "#1d5143" },
      }}
    >
      {label}
    </MuiLink>
  );

  const renderDrawerItem = (href: string, label: string) => (
    <ListItemButton
      key={href}
      component={Link}
      href={href}
      selected={isActive(href)}
      onClick={() => setMobileOpen(false)}
      sx={{
        borderRadius: 1,
        color: "inherit",
        "&.Mui-selected": { bgcolor: "rgba(255,255,255,0.08)" },
      }}
    >
      <ListItemText primary={label} sx={{ color: "inherit" }} />
    </ListItemButton>
  );

  const renderAccountActions = () => {
    if (user) {
      return (
        <>
          {renderDrawerItem("/dashboard/perfil", "Mi perfil")}
          {renderDrawerItem("/dashboard", "Dashboard")}
          {renderDrawerItem("/dashboard/favoritos", "Favoritos")}
          <ListItemButton
            onClick={() => setMobileOpen(false)}
            sx={{ borderRadius: 1, color: "inherit" }}
          >
            <ListItemText primary="Cerrar sesión" />
          </ListItemButton>
        </>
      );
    }

    return (
      <>
        {renderDrawerItem("/login", "Ingresar")}
        <ListItemButton
          component={Link}
          href="/registro"
          selected={isActive("/registro")}
          onClick={() => setMobileOpen(false)}
          sx={{
            borderRadius: 1,
            color: "inherit",
            "&.Mui-selected": { bgcolor: "rgba(255,255,255,0.08)" },
          }}
        >
          <ListItemText primary="Registrarse" />
        </ListItemButton>
      </>
    );
  };

  return (
    <>
      <Box
        component="nav"
        aria-label="Navegación principal"
        sx={{
          display: { xs: "none", md: "flex" },
          gap: 0.5,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {links.map(({ href, label }) => renderDesktopLink(href, label))}
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
                borderRadius: 1,
                whiteSpace: "nowrap",
                "&[aria-current='page']": { bgcolor: "#1d5143" },
              }}
            >
              Ingresar
            </MuiLink>
            <Button component={Link} href="/registro" aria-current={isActive("/registro") ? "page" : undefined}>
              Registrarse
            </Button>
          </>
        )}
      </Box>

      <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", ml: "auto" }}>
        <IconButton
          type="button"
          aria-label="Abrir menú principal"
          aria-controls="primary-navigation-drawer"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
          sx={{
            color: "inherit",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 1,
            p: 1,
          }}
        >
          <Menu size={20} />
        </IconButton>
      </Box>

      <Drawer
        id="primary-navigation-drawer"
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        slotProps={{ paper: { sx: { width: 280, bgcolor: "#153c32", color: "#f8f4ea", p: 1 } } }}
        ModalProps={{ keepMounted: true }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1, py: 1.5 }}>
          <Box component="strong" sx={{ fontSize: "1rem" }}>
            Menú
          </Box>
          <IconButton aria-label="Cerrar menú" onClick={() => setMobileOpen(false)} sx={{ color: "inherit" }}>
            <X size={18} />
          </IconButton>
        </Box>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.15)" }} />
        <List sx={{ px: 1, py: 1.5, display: "grid", gap: 0.5 }}>
          {links.map(({ href, label }) => renderDrawerItem(href, label))}
          {renderAccountActions()}
        </List>
      </Drawer>
    </>
  );
}
