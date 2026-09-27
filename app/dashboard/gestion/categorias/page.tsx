import { requireAdmin } from "@/lib/auth/guards";
import { categoryService } from "@/lib/services/category.service";
import { CategoryManager } from "@/components/admin/category-manager";
import { Typography } from "@mui/material";
import { PageContainer } from "@/components/ui/page-container";

export default async function ManagedCategoriesPage() {
  await requireAdmin();
  const categories = await categoryService.list();

  return (
    <PageContainer component="main">
      <Typography component="h1" variant="h3">
        Categorías
      </Typography>
      <Typography component="p" color="text.secondary">
        No se permite eliminar categorías con referencias.
      </Typography>
      <CategoryManager
        initial={categories.map((category) => ({
          ...category,
          createdAt: category.createdAt.toISOString(),
        }))}
      />
    </PageContainer>
  );
}
