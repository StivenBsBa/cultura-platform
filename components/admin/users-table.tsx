"use client";
import { useState } from "react";
import { UserProfileModal } from "@/components/profile/user-profile-modal";
import { EntityCard, EntityGrid, StatusBadge } from "@/components/ui/entity-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { Avatar, Box, Paper, Typography } from "@mui/material";
import { formatRoleLabel } from "@/lib/utils/user-role";
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string | Date;
  image?: string | null;
};
export function UsersTable({ initial }: { initial: User[] }) {
  const [users, setUsers] = useState(initial);
  const [selected, setSelected] = useState<User | null>(null);
  const [query, setQuery] = useState("");
  const visible = users.filter((user) =>
    `${user.name} ${user.email}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <Paper component="section" sx={{ p: 2.5, borderRadius: 1.5, boxShadow: 1 }}>
      <Box sx={{ display: "flex", mb: 1.5 }}>
        <SearchInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nombre o email"
          aria-label="Buscar usuarios"
        />
      </Box>
      <EntityGrid>
        {visible.map((user) => (
          <EntityCard
            key={user.id}
            role="button"
            tabIndex={0}
            onClick={() => setSelected(user)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") setSelected(user);
            }}
          >
            <Avatar
              src={user.image ?? undefined}
              alt=""
              sx={{ width: 40, height: 40, bgcolor: "secondary.main" }}
            >
              {user.name.slice(0, 1).toUpperCase()}
            </Avatar>
            <Typography component="h3" variant="h6">
              {user.name}
            </Typography>
            <Typography sx={{ color: "text.secondary", m: 0 }}>{user.email}</Typography>
            <StatusBadge>{formatRoleLabel(user.role)}</StatusBadge>
            <Typography sx={{ color: "text.secondary", fontSize: "0.86rem" }}>
              Registro:{" "}
              {new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(
                new Date(user.createdAt),
              )}
            </Typography>
          </EntityCard>
        ))}
      </EntityGrid>
      {visible.length === 0 && (
        <EmptyState>No hay usuarios que coincidan con la búsqueda.</EmptyState>
      )}
      {selected && (
        <UserProfileModal
          key={selected.id}
          open
          user={selected}
          admin
          onClose={() => setSelected(null)}
          onSaved={(updated) => {
            setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
            setSelected(updated);
          }}
          onDeleted={(id) => {
            setUsers((current) => current.filter((item) => item.id !== id));
            setSelected(null);
          }}
        />
      )}
    </Paper>
  );
}
