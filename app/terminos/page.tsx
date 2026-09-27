import { Typography } from "@mui/material";
import { PageContainer } from "@/components/ui/page-container";

export default function TermsPage() {
  return (
    <PageContainer component="main">
      <Typography component="h1" variant="h3">
        Términos de uso
      </Typography>
      <Typography component="p">
        Usa la plataforma para publicar información cultural veraz y respetuosa.
      </Typography>
    </PageContainer>
  );
}
