import { requireUser } from "@/lib/auth/guards";
import { Typography } from "@mui/material";
import { PageContainer } from "@/components/ui/page-container";
export default async function DashboardFavoritesPage() {
  await requireUser();
  return (
    <PageContainer component="main">
      <Typography component="h1" variant="h3">
        Favoritos
      </Typography>
      <Typography component="p" color="text.secondary">
        Consulta tus eventos y lugares guardados desde la API de favoritos.
      </Typography>
    </PageContainer>
  );
}
