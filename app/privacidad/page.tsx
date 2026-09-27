import { Typography } from "@mui/material";
import { PageContainer } from "@/components/ui/page-container";

export default function PrivacyPage() {
  return (
    <PageContainer component="main">
      <Typography component="h1" variant="h3">
        Privacidad
      </Typography>
      <Typography component="p">
        Los datos se procesan en la instalación local. No compartimos información con servicios
        externos.
      </Typography>
    </PageContainer>
  );
}
