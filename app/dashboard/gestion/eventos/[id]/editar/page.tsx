import { redirect } from "next/navigation";
import { requireContentManager } from "@/lib/auth/guards";
import { canEditEvent } from "@/lib/permissions";
import { eventService } from "@/lib/services/event.service";
import { placeRepository } from "@/lib/repositories/place.repository";
import { categoryService } from "@/lib/services/category.service";
import { ContentForm } from "@/components/admin/content-form";
import { Role } from "@/generated/prisma/client";
import { Typography } from "@mui/material";
import { PageContainer } from "@/components/ui/page-container";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireContentManager();
  const { id } = await params;
  const event = await eventService.findById(id);
  if (!event || !canEditEvent(actor, event.authorId, event.author.role)) redirect("/dashboard");

  const [places, categories] = await Promise.all([
    placeRepository.findMany({ status: "PUBLISHED" }, 0, 200),
    categoryService.list("EVENT"),
  ]);
  const content =
    event.content && typeof event.content === "object" && !Array.isArray(event.content)
      ? (event.content as object)
      : null;

  return (
    <PageContainer component="main">
      <Typography component="h1" variant="h3">
        Editar evento
      </Typography>
      <ContentForm
        kind="event"
        panelPath="/dashboard/gestion/eventos"
        canPublishDirect={actor.role === Role.ADMIN}
        places={places.map((place) => ({ id: place.id, name: place.name }))}
        categories={categories.map((category) => ({ id: category.id, name: category.name }))}
        initial={{
          id: event.id,
          name: event.name,
          slug: event.slug,
          summary: event.summary,
          content,
          coverMediaId: event.coverMediaId,
          coverUrl: event.coverMedia?.url,
          categoryIds: event.categories.map(({ categoryId }) => categoryId),
          status: event.status,
          price: event.price.toString(),
          capacity: event.capacity,
          placeId: event.placeId,
          occurrences: event.occurrences.map((occurrence) => ({
            id: occurrence.id,
            startsAt: occurrence.startsAt.toISOString(),
            endsAt: occurrence.endsAt.toISOString(),
            timezone: occurrence.timezone,
          })),
        }}
      />
    </PageContainer>
  );
}
