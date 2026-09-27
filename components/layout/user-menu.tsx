"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, Box, Menu, MenuItem } from "@mui/material";
import { LogOut, Heart, LayoutDashboard, User, ChevronDown } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { formatRoleLabel } from "@/lib/utils/user-role";

export function UserMenu({ user }: { user: { name: string; email: string; role: string; image?: string | null } }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const initials = user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const close = () => setAnchor(null);
  const roleLabel = formatRoleLabel(user.role);
  const item = (href: string, icon: React.ReactNode, label: string) => (
    <MenuItem component={Link} href={href} selected={pathname === href} onClick={close} sx={{ gap: 1 }}>{icon}<span>{label}</span></MenuItem>
  );

  return <>
    <Button variant="ghost" type="button" aria-controls={anchor ? "user-menu" : undefined} aria-haspopup="menu" aria-expanded={Boolean(anchor)} onClick={(event) => setAnchor(event.currentTarget)} sx={{ gap: 1, border: "1px solid #c8d5cf", bgcolor: "#fff", color: "#183229", "&:hover": { bgcolor: "#f4f7f5" } }}>
      <Avatar src={user.image ?? undefined} alt="" sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}>{initials}</Avatar>
      <Box sx={{ display: "grid", textAlign: "left", lineHeight: 1.2 }}>
        <strong>{user.name}</strong>
        <Box component="small" sx={{ color: "text.secondary" }}>{roleLabel}</Box>
      </Box>
      <ChevronDown size={16} />
    </Button>
    <Menu id="user-menu" anchorEl={anchor} open={Boolean(anchor)} onClose={close} slotProps={{ paper: { sx: { minWidth: 230 } } }}>
      {item("/dashboard/perfil", <User size={16} />, "Mi perfil")}
      {item("/dashboard", <LayoutDashboard size={16} />, "Dashboard")}
      {item("/dashboard/favoritos", <Heart size={16} />, "Favoritos")}
      <MenuItem sx={{ gap: 1 }} onClick={async () => { close(); await signOut({ redirect: false }); router.replace("/"); router.refresh(); }}><LogOut size={16} /><span>Cerrar sesión</span></MenuItem>
    </Menu>
  </>;
}
