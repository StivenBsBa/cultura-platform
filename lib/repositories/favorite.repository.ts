import { prisma } from "@/lib/db/prisma";
import { ContentStatus } from "@/generated/prisma/client";

export const favoriteRepository = {
  list: (userId: string) =>
    Promise.all([
      prisma.eventFavorite.findMany({
        where: { userId, event: { status: ContentStatus.PUBLISHED } },
        include: { event: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.placeFavorite.findMany({
        where: { userId, place: { status: ContentStatus.PUBLISHED } },
        include: { place: true },
        orderBy: { createdAt: "desc" },
      }),
    ]),
  isPublishedEvent: async (id: string) =>
    Boolean(
      await prisma.event.findFirst({
        where: { id, status: ContentStatus.PUBLISHED },
        select: { id: true },
      }),
    ),
  isPublishedPlace: async (id: string) =>
    Boolean(
      await prisma.place.findFirst({
        where: { id, status: ContentStatus.PUBLISHED },
        select: { id: true },
      }),
    ),
  addEvent: (userId: string, eventId: string) =>
    prisma.eventFavorite.upsert({
      where: { userId_eventId: { userId, eventId } },
      create: { userId, eventId },
      update: {},
    }),
  addPlace: (userId: string, placeId: string) =>
    prisma.placeFavorite.upsert({
      where: { userId_placeId: { userId, placeId } },
      create: { userId, placeId },
      update: {},
    }),
  removeEvent: (userId: string, eventId: string) =>
    prisma.eventFavorite.delete({ where: { userId_eventId: { userId, eventId } } }),
  removePlace: (userId: string, placeId: string) =>
    prisma.placeFavorite.delete({ where: { userId_placeId: { userId, placeId } } }),
};
