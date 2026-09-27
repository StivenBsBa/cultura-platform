import { requireContentManager } from "@/lib/auth/guards";
import { placeRepository } from "@/lib/repositories/place.repository";
import { categoryService } from "@/lib/services/category.service";
import { ContentForm } from "@/components/admin/content-form";
import { Role } from "@/generated/prisma/client";
import { Typography } from "@mui/material";
import { PageContainer } from "@/components/ui/page-container";

export default async function NewManagedEventPage() {
  const actor = await requireContentManager();
  const [places, categories] = await Promise.all([
    placeRepository.findMany({ status: "PUBLISHED" }, 0, 200),
    categoryService.list("EVENT"),
  ]);

  return (
    <PageContainer component="main">
      <Typography component="h1" variant="h3">
        Crear evento
      </Typography>
      <Typography component="p" color="text.secondary">
        Elige “Enviar a revisión” para que un moderador o administrador lo valide.
      </Typography>
      <ContentForm
        kind="event"
        panelPath="/dashboard"
        canPublishDirect={actor.role === Role.ADMIN}
        places={places.map((place) => ({ id: place.id, name: place.name }))}
        categories={categories.map((category) => ({ id: category.id, name: category.name }))}
      />
    </PageContainer>
  );
}
