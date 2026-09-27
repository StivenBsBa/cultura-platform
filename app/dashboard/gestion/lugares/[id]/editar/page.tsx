import { redirect } from "next/navigation";
import { requireContentManager } from "@/lib/auth/guards";
import { canEditPlace } from "@/lib/permissions";
import { placeService } from "@/lib/services/place.service";
import { categoryService } from "@/lib/services/category.service";
import { ContentForm } from "@/components/admin/content-form";
import { Role } from "@/generated/prisma/client";
import { Typography } from "@mui/material";
import { PageContainer } from "@/components/ui/page-container";

export default async function EditPlacePage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireContentManager();
  const { id } = await params;
  const place = await placeService.findById(id);
  if (!place || !canEditPlace(actor, place.authorId, place.author.role)) redirect("/dashboard");

  const categories = await categoryService.list("PLACE");
  const content =
    place.content && typeof place.content === "object" && !Array.isArray(place.content)
      ? (place.content as object)
      : null;

  return (
    <PageContainer component="main">
      <Typography component="h1" variant="h3">
        Editar lugar
      </Typography>
      <Typography component="p" color="text.secondary">
        Deja las coordenadas vacías para conservar la ubicación actual.
      </Typography>
      <ContentForm
        kind="place"
        panelPath="/dashboard/gestion/lugares"
        canPublishDirect={actor.role === Role.ADMIN}
        categories={categories.map((category) => ({ id: category.id, name: category.name }))}
        initial={{
          id: place.id,
          name: place.name,
          slug: place.slug,
          summary: place.summary,
          content,
          coverMediaId: place.coverMediaId,
          coverUrl: place.coverMedia?.url,
          categoryIds: place.categories.map(({ categoryId }) => categoryId),
          status: place.status,
          address: place.address,
          cityId: place.cityId,
        }}
      />
    </PageContainer>
  );
}
