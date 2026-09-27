"use client";
import { useState } from "react";
import { UserProfileModal } from "./user-profile-modal";
import { Button } from "@/components/ui/button";
import { Avatar, Box, Paper, Typography } from "@mui/material";
import { CalendarDays, Heart, MapPin, Pencil, ShieldCheck, TicketCheck } from "lucide-react";
import { formatRoleLabel } from "@/lib/utils/user-role";
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string | Date;
  image?: string | null;
};
export function MyProfileCard({
  initial,
  stats,
}: {
  initial: User;
  stats: { events: number; places: number; favorites: number; published: number; pending: number };
}) {
  const [user, setUser] = useState(initial);
  const [open, setOpen] = useState(false);
  const initials = user.name.slice(0, 1).toUpperCase();
  const memberSince = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(
    new Date(user.createdAt),
  );
  const statsItems = [
    { label: "Eventos creados", value: stats.events, icon: TicketCheck },
    { label: "Lugares creados", value: stats.places, icon: MapPin },
    { label: "Favoritos", value: stats.favorites, icon: Heart },
    { label: "Publicados", value: stats.published, icon: ShieldCheck },
    { label: "Pendientes", value: stats.pending, icon: CalendarDays },
  ];
  return (
    <>
      <Paper
        component="section"
        variant="outlined"
        sx={{ p: { xs: 2, md: 3 }, borderRadius: 1.5, borderColor: "#d9e1dc", boxShadow: 1 }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", md: "center" },
            gap: 2.5,
          }}
        >
          <Box
            sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, sm: 2.5 }, minWidth: 0 }}
          >
            <Avatar
              src={user.image ?? undefined}
              alt="Avatar"
              sx={{
                width: { xs: 64, sm: 88 },
                height: { xs: 64, sm: 88 },
                flexShrink: 0,
                bgcolor: "secondary.main",
                fontSize: 30,
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                PERFIL DE CUENTA
              </Typography>
              <Typography component="h2" variant="h4" sx={{ mt: 0.25, overflowWrap: "anywhere" }}>
                {user.name}
              </Typography>
              <Typography component="p" color="text.secondary" sx={{ mt: 0.5, mb: 1 }}>
                {user.email}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
                <Typography
                  component="span"
                  variant="caption"
                  sx={{
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: "#e5f0ea",
                    color: "secondary.dark",
                    fontWeight: 700,
                  }}
                >
                  {formatRoleLabel(user.role)}
                </Typography>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "text.secondary" }}
                >
                  <CalendarDays size={15} aria-hidden="true" />
                  <Typography variant="body2">Miembro desde {memberSince}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          <Button
            type="button"
            startIcon={<Pencil size={17} />}
            onClick={() => setOpen(true)}
            sx={{ justifySelf: { xs: "stretch", md: "end" }, whiteSpace: "nowrap" }}
          >
            Editar perfil
          </Button>
        </Box>
      </Paper>
      <Box
        component="section"
        aria-label="Resumen de actividad"
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            sm: "repeat(3, minmax(0, 1fr))",
            lg: "repeat(5, minmax(0, 1fr))",
          },
          gap: "1px",
          border: "1px solid #d9e1dc",
          borderRadius: 1.5,
          bgcolor: "#d9e1dc",
          overflow: "hidden",
        }}
      >
        {statsItems.map(({ label, value, icon: Icon }) => (
          <Box
            key={label}
            sx={{
              minWidth: 0,
              p: { xs: 1.5, sm: 2 },
              display: "grid",
              gridTemplateColumns: "auto minmax(0, 1fr)",
              columnGap: 1,
              rowGap: 0.25,
              alignItems: "center",
              bgcolor: "background.paper",
            }}
          >
            <Box
              sx={{
                gridRow: "span 2",
                display: "grid",
                placeItems: "center",
                color: "secondary.main",
              }}
            >
              <Icon size={18} aria-hidden="true" />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
              {label}
            </Typography>
            <Typography component="strong" variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {value}
            </Typography>
          </Box>
        ))}
      </Box>
      <UserProfileModal
        open={open}
        user={user}
        self
        onClose={() => setOpen(false)}
        onSaved={(updated) => setUser(updated)}
      />
    </>
  );
}
