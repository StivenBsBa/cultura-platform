import { CategoryScope, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
export const categoryRepository = {
  list: (scope?: CategoryScope) =>
    prisma.category.findMany({
      where: scope ? { OR: [{ scope }, { scope: CategoryScope.BOTH }] } : undefined,
      orderBy: { name: "asc" },
      include: { _count: { select: { events: true, places: true } } },
    }),
  findById: (id: string) => prisma.category.findUnique({ where: { id } }),
  findUsableIds: (ids: string[], scope: CategoryScope) =>
    ids.length
      ? prisma.category.findMany({
          where: { id: { in: ids }, OR: [{ scope }, { scope: CategoryScope.BOTH }] },
          select: { id: true },
        })
      : Promise.resolve([]),
  findBySlug: (slug: string) =>
    prisma.category.findUnique({
      where: { slug },
      include: { _count: { select: { events: true, places: true } } },
    }),
  create: (data: Prisma.CategoryCreateInput) => prisma.category.create({ data }),
  update: (id: string, data: Prisma.CategoryUpdateInput) =>
    prisma.category.update({ where: { id }, data }),
  async remove(id: string) {
    const refs = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { events: true, places: true } } },
    });
    if (!refs) throw new Error("NOT_FOUND");
    if (refs._count.events || refs._count.places) throw new Error("CATEGORY_IN_USE");
    await prisma.category.delete({ where: { id } });
  },
};
