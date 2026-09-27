import { requireContentManager } from "@/lib/auth/guards";
import { eventRepository } from "@/lib/repositories/event.repository";
import { ContentTableActions } from "@/components/admin/content-table-actions";
import { EventCard } from "@/components/events/event-card";
import { Role } from "@/generated/prisma/client";
import { contentActionsFor } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { ContentCardGrid } from "@/components/ui/entity-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Typography } from "@mui/material";
import { PageContainer } from "@/components/ui/page-container";
import { NextLinkAdapter } from "@/components/ui/next-link-adapter";

export default async function ManagedEventsPage() {
  const actor = await requireContentManager();
  const events = await eventRepository.findMany(
    actor.role === Role.ADMIN ? {} : { authorId: actor.id },
    0,
    50,
    { createdAt: "desc" },
  );

  return (
    <PageContainer component="main">
      <Typography component="h1" variant="h3">
        {actor.role === Role.ADMIN ? "Eventos" : "Mis eventos"}
      </Typography>
      <Typography component="p" color="text.secondary">
        {actor.role === Role.ADMIN
          ? "Gestión y revisión de contenido."
          : "Tus borradores y propuestas aparecen aquí."}
      </Typography>
      <Button component={NextLinkAdapter} href="/dashboard/gestion/eventos/nuevo">
        Crear evento
      </Button>
      {events.length === 0 ? (
        <EmptyState>Todavía no hay eventos.</EmptyState>
      ) : (
        <ContentCardGrid>
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              actions={
                <ContentTableActions
                  row={{ id: event.id, name: event.name, status: event.status }}
                  kind="events"
                  actions={contentActionsFor(
                    actor,
                    event.authorId,
                    event.author.role,
                    event.status,
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
