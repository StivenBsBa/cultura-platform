import { Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

const publicUser = {
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  mustChangePassword: true,
} as const;
export const userRepository = {
  findAuthByEmail: (email: string) =>
    prisma.user.findUnique({ where: { email }, select: { ...publicUser, passwordHash: true } }),
  findPublicById: (id: string) => prisma.user.findUnique({ where: { id }, select: publicUser }),
  async profileStats(id: string) {
    const [
      events,
      places,
      eventFavorites,
      placeFavorites,
      publishedEvents,
      publishedPlaces,
      pendingEvents,
      pendingPlaces,
    ] = await Promise.all([
      prisma.event.count({ where: { authorId: id } }),
      prisma.place.count({ where: { authorId: id } }),
      prisma.eventFavorite.count({ where: { userId: id } }),
      prisma.placeFavorite.count({ where: { userId: id } }),
      prisma.event.count({ where: { authorId: id, status: "PUBLISHED" } }),
      prisma.place.count({ where: { authorId: id, status: "PUBLISHED" } }),
      prisma.event.count({ where: { authorId: id, status: "PENDING_REVIEW" } }),
      prisma.place.count({ where: { authorId: id, status: "PENDING_REVIEW" } }),
    ]);
    return {
      events,
      places,
      eventFavorites,
      placeFavorites,
      favorites: eventFavorites + placeFavorites,
      published: publishedEvents + publishedPlaces,
      pending: pendingEvents + pendingPlaces,
    };
  },
  create: (data: { name: string; email: string; passwordHash: string; role?: Role }) =>
    prisma.user.create({ data, select: publicUser }),
  findMany: (skip: number, take: number, search?: string, excludeId?: string) =>
    prisma.user.findMany({
      skip,
      take,
      select: publicUser,
      orderBy: { createdAt: "desc" },
      where: {
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
    }),
  count: (search?: string, excludeId?: string) =>
    prisma.user.count({
      where: {
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
    }),
  updateRole: (id: string, role: Role) =>
    prisma.user.update({ where: { id }, data: { role }, select: publicUser }),
  findAdminExcept: (id: string) =>
    prisma.user.findFirst({ where: { role: Role.ADMIN, NOT: { id } }, select: { id: true } }),
  updateProfile: (id: string, data: { name?: string; email?: string; image?: string | null }) =>
    prisma.user.update({ where: { id }, data, select: publicUser }),
  updatePassword: (id: string, passwordHash: string, mustChangePassword: boolean) =>
    prisma.user.update({
      where: { id },
      data: { passwordHash, mustChangePassword },
      select: publicUser,
    }),
  async remove(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { _count: { select: { events: true, places: true, mediaAssets: true } } },
    });
    if (!user) throw new Error("NOT_FOUND");
    if (user._count.events || user._count.places || user._count.mediaAssets)
      throw new Error("USER_HAS_CONTENT");
    await prisma.user.delete({ where: { id } });
  },
};
