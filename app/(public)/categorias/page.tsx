import { CategoryCards } from "@/components/public/category-cards";
import { categoryService } from "@/lib/services/category.service";
import { Typography } from "@mui/material";
import { PageContainer } from "@/components/ui/page-container";

export default async function CategoriesPage() {
  const categories = await categoryService.list();
  return (
    <PageContainer component="main">
      <Typography component="h1" variant="h3">
        Categorías
      </Typography>
      <Typography component="p" color="text.secondary">
        Explora eventos y lugares por temática.
      </Typography>
      <CategoryCards categories={categories} />
    </PageContainer>
  );
}
