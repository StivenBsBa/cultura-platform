import { requireModerator } from "@/lib/auth/guards";
import { eventRepository } from "@/lib/repositories/event.repository";
import { placeRepository } from "@/lib/repositories/place.repository";
import { ModerationEventTable } from "@/components/admin/moderation-event-table";
import { PlaceCard } from "@/components/places/place-card";
import { ContentTableActions } from "@/components/admin/content-table-actions";
import { Role } from "@/generated/prisma/client";
import { contentActionsFor } from "@/lib/permissions";
import { ContentCardGrid } from "@/components/ui/entity-card";
import { Typography } from "@mui/material";
import { PageContainer } from "@/components/ui/page-container";

export default async function ManagedModerationPage() {
  const actor = await requireModerator();
  const [events, places] = await Promise.all([
    eventRepository.findMany({ status: "PENDING_REVIEW" }, 0, 100, { createdAt: "desc" }),
    placeRepository.findMany({ status: "PENDING_REVIEW" }, 0, 100),
  ]);
  const visibleEvents =
    actor.role === Role.ADMIN
      ? events
      : events.filter((event) => event.author.role === Role.CREATOR);
  const visiblePlaces =
    actor.role === Role.ADMIN
      ? places
      : places.filter((place) => place.author.role === Role.CREATOR);
  const eventRows = visibleEvents.map((event) => ({
    ...event,
    price: event.price.toString(),
    createdAt: event.createdAt.toISOString(),
    author: event.author,
    occurrences: event.occurrences.map((occurrence) => ({
      ...occurrence,
      startsAt: occurrence.startsAt.toISOString(),
      endsAt: occurrence.endsAt.toISOString(),
    })),
    actions: contentActionsFor(actor, event.authorId, event.author.role, event.status),
  }));

  return (
    <PageContainer component="main">
      <Typography component="h1" variant="h3">
        Moderación
      </Typography>
      <Typography component="p" color="text.secondary">
        Pendientes de revisión. Aprobar o rechazar usa PATCH server-side sobre el recurso.
      </Typography>
      <Typography component="h2" variant="h5" sx={{ mt: 3, mb: 1.5 }}>
        Eventos pendientes
      </Typography>
      <ModerationEventTable initial={eventRows} />
      {visiblePlaces.length > 0 && (
        <>
          <Typography component="h2" variant="h5" sx={{ mt: 3, mb: 1.5 }}>
            Lugares pendientes
          </Typography>
          <ContentCardGrid>
            {visiblePlaces.map((place) => (
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
        </>
      )}
    </PageContainer>
  );
}
