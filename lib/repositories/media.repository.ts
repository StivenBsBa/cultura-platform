import { prisma } from "@/lib/db/prisma";
export const mediaRepository = {
  list: () =>
    prisma.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
      include: { owner: { select: { id: true, name: true, email: true } } },
    }),
  findById: (id: string) => prisma.mediaAsset.findUnique({ where: { id } }),
  findByObjectKey: (objectKey: string) => prisma.mediaAsset.findUnique({ where: { objectKey } }),
  findByLegacyKey: (objectKey: string) =>
    prisma.mediaAsset.findFirst({
      where: { url: `/api/v1/uploads/object?key=${encodeURIComponent(objectKey)}` },
    }),
  findManyByIds: (ids: string[]) =>
    prisma.mediaAsset.findMany({ where: { id: { in: ids } }, select: { id: true, ownerId: true } }),
  updateAlt: (id: string, alt: string | null) =>
    prisma.mediaAsset.update({
      where: { id },
      data: { alt },
      include: { owner: { select: { id: true, name: true, email: true } } },
    }),
  remove: (id: string) => prisma.mediaAsset.delete({ where: { id } }),
  create: (data: {
    url: string;
    objectKey: string;
    alt?: string;
    mimeType?: string;
    size?: number;
    width?: number | null;
    height?: number | null;
    provider: string;
    ownerId: string;
  }) => prisma.mediaAsset.create({ data }),
  async usage(id: string) {
    const mediaReference = `%"mediaId"%${id}%`;
    const media = await this.findById(id);
    const [eventCovers, placeCovers, eventContent, placeContent, avatars] = await Promise.all([
      prisma.event.count({ where: { coverMediaId: id } }),
      prisma.place.count({ where: { coverMediaId: id } }),
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*)::bigint AS count FROM "Event"
        WHERE "content"::text LIKE ${mediaReference}
      `,
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*)::bigint AS count FROM "Place"
        WHERE "content"::text LIKE ${mediaReference}
      `,
      media ? prisma.user.count({ where: { image: media.url } }) : Promise.resolve(0),
    ]);
    return {
      eventCovers,
      placeCovers,
      eventContent: Number(eventContent[0]?.count ?? 0),
      placeContent: Number(placeContent[0]?.count ?? 0),
      avatars,
    };
  },
};
