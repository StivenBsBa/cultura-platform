import { ContentStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

export const locationRepository = {
  searchCities: (query: string) =>
    prisma.city.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: 5,
      select: { id: true, name: true, region: { select: { name: true } } },
    }),
  searchPublishedPlaces: (query: string) =>
    prisma.place.findMany({
      where: { status: ContentStatus.PUBLISHED, name: { contains: query, mode: "insensitive" } },
      take: 5,
      select: {
        id: true,
        name: true,
        address: true,
        cityId: true,
        city: { select: { name: true, region: { select: { name: true } } } },
      },
    }),
  findCitiesByRegion: (regionId: string) =>
    prisma.city.findMany({
      where: { regionId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
};
