import { requireUser } from "@/lib/auth/guards";
import { canCreateContent, canModerate } from "@/lib/permissions";
import { canManageUsers } from "@/lib/permissions";
import { eventRepository } from "@/lib/repositories/event.repository";
import { placeRepository } from "@/lib/repositories/place.repository";
import { userRepository } from "@/lib/repositories/user.repository";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { categoryService } from "@/lib/services/category.service";
import { mediaRepository } from "@/lib/repositories/media.repository";
import { Box, Link as MuiLink, Typography } from "@mui/material";
import { PageContainer } from "@/components/ui/page-container";
import { NextLinkAdapter } from "@/components/ui/next-link-adapter";
import { formatRoleLabel } from "@/lib/utils/user-role";
export default async function DashboardPage() {
  const user = await requireUser();
  const showSummary = canManageUsers(user) || canModerate(user) || canCreateContent(user);
  const summary = showSummary
    ? await Promise.all([
      userRepository.count(),
      eventRepository.countAll(),
      placeRepository.countAll(),
      eventRepository.countPending(),
      placeRepository.countPending(),
      canManageUsers(user) ? categoryService.list() : Promise.resolve([]),
      canManageUsers(user) ? mediaRepository.list() : Promise.resolve([]),
    ])
    : null;
  return (
    <PageContainer component="main" sx={{ py: 5 }}>
      <Typography component="h1" variant="h3">
        Hola
      </Typography>
      <Typography component="p" color="text.secondary">
        Rol: {formatRoleLabel(user.role)}
      </Typography>
      {summary && (
        <>
          <Typography component="h2" variant="h5" sx={{ mt: 4, mb: 2 }}>
            Resumen general
          </Typography>
          <SummaryCards
            cards={[
              ...(canManageUsers(user)
                ? [
                  {
                    label: "Usuarios",
                    value: summary[0],
                    href: "/dashboard/gestion/usuarios",
                  },
                ]
                : []),
              {
                label: "Eventos",
                value: summary[1],
                href: "/dashboard/gestion/eventos",
              },
              {
                label: "Lugares",
                value: summary[2],
                href: "/dashboard/gestion/lugares",
              },
              ...(canModerate(user)
                ? [
                  {
                    label: "Pendientes",
                    value: summary[3] + summary[4],
                    href: "/dashboard/gestion/moderacion",
                  },
                ]
                : []),
            ]}
          />
        </>
      )}
      {showSummary && (
        <>
          <Typography component="h2" variant="h5" sx={{ mt: 4, mb: 2 }}>
            Gestión
          </Typography>
          <SummaryCards
            cards={[
              ...(canCreateContent(user)
                ? [
                  {
                    label: "Eventos",
                    value: summary?.[1] ?? 0,
                    href: "/dashboard/gestion/eventos",
                  },
                  {
                    label: "Lugares",
                    value: summary?.[2] ?? 0,
                    href: "/dashboard/gestion/lugares",
                  },
                ]
                : []),
              ...(canManageUsers(user)
                ? [
                  {
                    label: "Categorías",
                    value: summary?.[5].length ?? 0,
                    href: "/dashboard/gestion/categorias",
                  },
                  {
                    label: "Usuarios",
                    value: summary?.[0] ?? 0,
                    href: "/dashboard/gestion/usuarios",
                  },
                  {
                    label: "Media",
                    value: summary?.[6].length ?? 0,
                    href: "/dashboard/gestion/media",
                  },
                ]
                : []),
              ...(canModerate(user)
                ? [
                  {
                    label: "Moderación",
                    value: (summary?.[3] ?? 0) + (summary?.[4] ?? 0),
                    href: "/dashboard/gestion/moderacion",
                  },
                ]
                : []),
            ]}
          />
        </>
      )}
      <Box component="nav" sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
        {canCreateContent(user) && (
          <>
            <MuiLink component={NextLinkAdapter} href="/dashboard/gestion/eventos">
              Mis eventos
            </MuiLink>
            <MuiLink component={NextLinkAdapter} href="/dashboard/gestion/lugares">
              Mis lugares
            </MuiLink>
          </>
        )}
        <MuiLink component={NextLinkAdapter} href="/dashboard/favoritos">
          Favoritos
        </MuiLink>
      </Box>
      {canCreateContent(user) && (
        <Box component="nav" sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 3 }}>
          <MuiLink component={NextLinkAdapter} href="/dashboard/gestion/eventos/nuevo">
            Crear evento
          </MuiLink>
          <MuiLink component={NextLinkAdapter} href="/dashboard/gestion/lugares/nuevo">
            Crear lugar
          </MuiLink>
        </Box>
      )}
      {canModerate(user) && (
        <Box component="nav" sx={{ display: "flex", gap: 1.5, mt: 2 }}>
          <MuiLink component={NextLinkAdapter} href="/dashboard/gestion/moderacion">
            Revisar contenido pendiente
          </MuiLink>
        </Box>
      )}
    </PageContainer>
  );
}
