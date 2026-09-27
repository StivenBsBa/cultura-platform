import { requireContentManager } from "@/lib/auth/guards";
import { categoryService } from "@/lib/services/category.service";
import { ContentForm } from "@/components/admin/content-form";
import { Role } from "@/generated/prisma/client";
import { Typography } from "@mui/material";
import { PageContainer } from "@/components/ui/page-container";

export default async function NewManagedPlacePage() {
  const actor = await requireContentManager();
  const categories = await categoryService.list("PLACE");

  return (
    <PageContainer component="main">
      <Typography component="h1" variant="h3">
        Crear lugar
      </Typography>
      <Typography component="p" color="text.secondary">
        El lugar quedará pendiente de revisión.
      </Typography>
      <ContentForm
        kind="place"
        panelPath="/dashboard"
        canPublishDirect={actor.role === Role.ADMIN}
        categories={categories.map((category) => ({ id: category.id, name: category.name }))}
      />
    </PageContainer>
  );
}
