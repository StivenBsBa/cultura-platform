import { requireContentManager } from "@/lib/auth/guards";
import { placeRepository } from "@/lib/repositories/place.repository";
import { ContentTableActions } from "@/components/admin/content-table-actions";
import { PlaceCard } from "@/components/places/place-card";
import { Role } from "@/generated/prisma/client";
import { contentActionsFor } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { ContentCardGrid } from "@/components/ui/entity-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Typography } from "@mui/material";
import { PageContainer } from "@/components/ui/page-container";
import { NextLinkAdapter } from "@/components/ui/next-link-adapter";

export default async function ManagedPlacesPage() {
  const actor = await requireContentManager();
  const places = await placeRepository.findMany(
    actor.role === Role.ADMIN ? {} : { authorId: actor.id },
    0,
    50,
  );

  return (
    <PageContainer component="main">
      <Typography component="h1" variant="h3">
        {actor.role === Role.ADMIN ? "Lugares" : "Mis lugares"}
      </Typography>
      <Typography component="p" color="text.secondary">
        {actor.role === Role.ADMIN
          ? "Gestión y revisión de contenido."
          : "Tus borradores y propuestas aparecen aquí."}
      </Typography>
      <Button component={NextLinkAdapter} href="/dashboard/gestion/lugares/nuevo">
        Crear lugar
      </Button>
      {places.length === 0 ? (
        <EmptyState>Todavía no hay lugares.</EmptyState>
      ) : (
        <ContentCardGrid>
          {places.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              actions={
                <ContentTableActions
                  row={{ id: place.id, name: place.name, status: place.status }}
                  kind="places"
                  actions={contentActionsFor(
                    actor,
                    place.authorId,
                    place.author.role,
                    place.status,
                  )}
                />
              }
            />
          ))}
        </ContentCardGrid>
      )}
    </PageContainer>
  );
}
