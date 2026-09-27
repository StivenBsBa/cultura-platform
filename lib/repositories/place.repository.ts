import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

const include = {
  coverMedia: true,
  author: { select: { id: true, name: true, email: true, role: true } },
  city: { include: { region: { include: { country: true } } } },
  categories: { include: { category: true } },
};
export const placeRepository = {
  findById: (id: string) => prisma.place.findUnique({ where: { id }, include }),
  findBySlug: (slug: string) => prisma.place.findUnique({ where: { slug }, include }),
  findPublishedById: (id: string) =>
    prisma.place.findFirst({ where: { id, status: "PUBLISHED" }, include }),
  findPublishedBySlug: (slug: string) =>
    prisma.place.findFirst({ where: { slug, status: "PUBLISHED" }, include }),
  findMany: (where: Prisma.PlaceWhereInput, skip: number, take: number) =>
    prisma.place.findMany({ where, skip, take, include, orderBy: { createdAt: "desc" } }),
  count: (where: Prisma.PlaceWhereInput) => prisma.place.count({ where }),
  findPublishedByIds: (ids: string[]) =>
    prisma.place.findMany({ where: { id: { in: ids }, status: "PUBLISHED" }, include }),
  countAll: () => prisma.place.count(),
  countPending: () => prisma.place.count({ where: { status: "PENDING_REVIEW" } }),
  async findWithinRadius(lat: number, lng: number, radius: number) {
    return prisma.$queryRaw<Array<{ id: string; distanceMeters: number }>>(Prisma.sql`
      SELECT id, ST_Distance(location, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography) AS "distanceMeters"
      FROM "Place"
      WHERE "status" = 'PUBLISHED'
        AND location IS NOT NULL
        AND ST_DWithin(location, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radius})
      ORDER BY "distanceMeters" ASC`);
  },
  findNearby(lat: number, lng: number, radius: number) {
    return this.findWithinRadius(lat, lng, radius);
  },
  calculateDistance(lat: number, lng: number, radius: number) {
    return this.findWithinRadius(lat, lng, radius);
  },
  async create(data: Prisma.PlaceCreateInput, lat: number, lng: number) {
    return prisma.$transaction(async (tx) => {
      const place = await tx.place.create({ data, include });
      await tx.$executeRaw(
        Prisma.sql`UPDATE "Place" SET location = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography WHERE id = ${place.id}`,
      );
      return place;
    });
  },
  async update(
    id: string,
    data: Prisma.PlaceUpdateInput,
    coordinates?: { lat: number; lng: number },
  ) {
    return prisma.$transaction(async (tx) => {
      const place = await tx.place.update({ where: { id }, data, include });
      if (coordinates)
        await tx.$executeRaw(
          Prisma.sql`UPDATE "Place" SET location = ST_SetSRID(ST_MakePoint(${coordinates.lng}, ${coordinates.lat}), 4326)::geography WHERE id = ${id}`,
        );
      return place;
    });
  },
  delete: (id: string) => prisma.place.delete({ where: { id } }),
};
