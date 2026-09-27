import { requireAdmin } from "@/lib/auth/guards";
import { mediaRepository } from "@/lib/repositories/media.repository";
import { MediaGrid } from "@/components/admin/media-grid";
import { Typography } from "@mui/material";
import { PageContainer } from "@/components/ui/page-container";

export default async function ManagedMediaPage() {
  await requireAdmin();
  const media = await mediaRepository.list();

  return (
    <PageContainer component="main">
      <Typography component="h1" variant="h3">
        Media
      </Typography>
      <Typography component="p" color="text.secondary">
        Archivos registrados en RustFS.
      </Typography>
      <MediaGrid
        key={media.map((item) => item.id).join(":")}
        initial={media.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() }))}
      />
    </PageContainer>
  );
}
