import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

const include = {
  coverMedia: true,
  author: { select: { id: true, name: true, email: true, role: true } },
  place: { include: { city: true } },
  occurrences: { orderBy: { startsAt: "asc" as const } },
  categories: { include: { category: true } },
};
export const eventRepository = {
  findById: (id: string) => prisma.event.findUnique({ where: { id }, include }),
  findBySlug: (slug: string) => prisma.event.findUnique({ where: { slug }, include }),
  findPublishedById: (id: string) =>
    prisma.event.findFirst({ where: { id, status: "PUBLISHED" }, include }),
  findPublishedBySlug: (slug: string) =>
    prisma.event.findFirst({ where: { slug, status: "PUBLISHED" }, include }),
  findMany: (
    where: Prisma.EventWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.EventOrderByWithRelationInput,
  ) => prisma.event.findMany({ where, skip, take, orderBy, include }),
  count: (where: Prisma.EventWhereInput) => prisma.event.count({ where }),
  async findPublicUpcoming(input: {
    from: Date;
    to?: Date;
    search?: string;
    city?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    free?: boolean;
    skip: number;
    take: number;
  }) {
    const conditions = [
      Prisma.sql`e."status" = 'PUBLISHED'`,
      Prisma.sql`o."startsAt" >= ${input.from}`,
      ...(input.to ? [Prisma.sql`o."startsAt" <= ${input.to}`] : []),
      ...(input.search ? [Prisma.sql`e."name" ILIKE ${`%${input.search}%`}`] : []),
      ...(input.city
        ? [
            Prisma.sql`EXISTS (SELECT 1 FROM "Place" p JOIN "City" c ON c.id = p."cityId" WHERE p.id = e."placeId" AND c.slug = ${input.city})`,
          ]
        : []),
      ...(input.category
        ? [
            Prisma.sql`EXISTS (SELECT 1 FROM "EventCategory" ec JOIN "Category" c ON c.id = ec."categoryId" WHERE ec."eventId" = e.id AND c.slug = ${input.category})`,
          ]
        : []),
      ...(input.free ? [Prisma.sql`e.price = 0`] : []),
      ...(input.minPrice !== undefined ? [Prisma.sql`e.price >= ${input.minPrice}`] : []),
      ...(input.maxPrice !== undefined ? [Prisma.sql`e.price <= ${input.maxPrice}`] : []),
    ];
    const where = Prisma.join(conditions, " AND ");
    const rows = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT e.id FROM "Event" e JOIN "EventOccurrence" o ON o."eventId" = e.id
      WHERE ${where} GROUP BY e.id ORDER BY MIN(o."startsAt") ASC, e.id ASC
      LIMIT ${input.take} OFFSET ${input.skip}`);
    const totalRows = await prisma.$queryRaw<Array<{ total: bigint }>>(Prisma.sql`
      SELECT COUNT(DISTINCT e.id)::bigint AS total FROM "Event" e JOIN "EventOccurrence" o ON o."eventId" = e.id
      WHERE ${where}`);
    const ids = rows.map(({ id }) => id);
    const events = ids.length
      ? await prisma.event.findMany({ where: { id: { in: ids } }, include })
      : [];
    const byId = new Map(events.map((event) => [event.id, event]));
    return {
      data: ids.flatMap((id) => (byId.get(id) ? [byId.get(id)!] : [])),
      total: Number(totalRows[0]?.total ?? 0),
    };
  },
  countAll: () => prisma.event.count(),
  countPending: () => prisma.event.count({ where: { status: "PENDING_REVIEW" } }),
  create: (data: Prisma.EventCreateInput) => prisma.event.create({ data, include }),
  update: (id: string, data: Prisma.EventUpdateInput) =>
    prisma.event.update({ where: { id }, data, include }),
  delete: (id: string) => prisma.event.delete({ where: { id } }),
};
