import { Typography } from "@mui/material";
import { PageContainer } from "@/components/ui/page-container";

export default function AboutPage() {
  return (
    <PageContainer component="main">
      <Typography component="h1" variant="h3">
        Acerca de Cultura Platform
      </Typography>
      <Typography component="p">
        Una plataforma local para descubrir y compartir experiencias culturales.
      </Typography>
    </PageContainer>
  );
}
