export const roleLabels: Record<string, string> = {
  USER: "Usuario",
  CREATOR: "Creador",
  MODERATOR: "Moderador",
  ADMIN: "Administrador",
};

export function formatRoleLabel(role?: string | null) {
  return role ? (roleLabels[role] ?? role) : "Usuario";
}
