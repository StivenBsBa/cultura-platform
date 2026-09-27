import { categoryRepository } from "@/lib/repositories/category.repository";
import { slugify } from "@/lib/utils/slug";
export const categoryService = {
  list: (scope?: "EVENT" | "PLACE") => categoryRepository.list(scope),
  findBySlug: (slug: string) => categoryRepository.findBySlug(slug),
  create: (input: {
    name: string;
    description: string;
    scope: "EVENT" | "PLACE" | "BOTH";
    slug?: string;
  }) =>
    categoryRepository.create({
      name: input.name,
      description: input.description,
      scope: input.scope,
      slug: input.slug || slugify(input.name),
    }),
  update: (
    id: string,
    input: { name: string; description: string; scope: "EVENT" | "PLACE" | "BOTH"; slug?: string },
  ) =>
    categoryRepository.update(id, {
      name: input.name,
      description: input.description,
      scope: input.scope,
      slug: input.slug || slugify(input.name),
    }),
  remove: (id: string) => categoryRepository.remove(id),
};
