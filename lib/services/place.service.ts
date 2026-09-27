import { ContentStatus, Prisma } from "@/generated/prisma/client";
import {
  canCreateContent,
  canEditPlace,
  canManageUsers,
  canTransitionContent,
  type Actor,
} from "@/lib/permissions";
import { placeRepository } from "@/lib/repositories/place.repository";
import { richTextForStorage } from "@/lib/content/rich-text-media";
import {
  assertCategoryScope,
  assertContentMediaAccess,
  assertCoverAccess,
} from "@/lib/services/content-media-access";
import { slugify } from "@/lib/utils/slug";
import type { z } from "zod";
import type {
  placeCreateSchema,
  placeQuerySchema,
  placeUpdateSchema,
} from "@/lib/validations/place.schema";

type PlaceCreate = z.infer<typeof placeCreateSchema>;
type PlaceUpdate = z.infer<typeof placeUpdateSchema>;
type PlaceQuery = z.infer<typeof placeQuerySchema>;
export const placeService = {
  async list(query: PlaceQuery) {
    const where: Prisma.PlaceWhereInput = {
      // Este service respalda únicamente listados públicos. Los estados internos
      // se consultan mediante repositorios en vistas protegidas.
      status: ContentStatus.PUBLISHED,
      ...(query.search ? { name: { contains: query.search, mode: "insensitive" } } : {}),
      ...(query.category ? { categories: { some: { category: { slug: query.category } } } } : {}),
      ...(query.city ? { city: { slug: query.city } } : {}),
      ...(query.cityId ? { cityId: query.cityId } : {}),
    };
    const [data, total] = await Promise.all([
      placeRepository.findMany(where, (query.page - 1) * query.pageSize, query.pageSize),
      placeRepository.count(where),
    ]);
    return { data, total };
  },
  findById: (id: string) => placeRepository.findById(id),
  findBySlug: (slug: string) => placeRepository.findBySlug(slug),
  findPublicById: (id: string) => placeRepository.findPublishedById(id),
  findPublicBySlug: (slug: string) => placeRepository.findPublishedBySlug(slug),
  nearby: (lat: number, lng: number, radius: number) =>
    placeRepository.findNearby(lat, lng, radius),
  async nearbyDetails(lat: number, lng: number, radius: number) {
    const nearby = await placeRepository.findNearby(lat, lng, radius);
    const places = await placeRepository.findPublishedByIds(nearby.map((item) => item.id));
    const byId = new Map(places.map((place) => [place.id, place]));
    return nearby.flatMap((item) =>
      byId.get(item.id) ? [{ ...byId.get(item.id)!, distanceMeters: item.distanceMeters }] : [],
    );
  },
  async create(actor: Actor, input: PlaceCreate) {
    if (!canCreateContent(actor)) throw new Error("FORBIDDEN");
    await assertCoverAccess(actor, input.coverMediaId);
    await assertContentMediaAccess(actor, input.content);
    await assertCategoryScope(input.categoryIds, "PLACE");
    const initialStatus =
      actor.role === "MODERATOR"
        ? ContentStatus.PENDING_REVIEW
        : (input.status ?? ContentStatus.DRAFT);
    if (!canTransitionContent(actor, actor.id, actor.role, ContentStatus.DRAFT, initialStatus))
      throw new Error("FORBIDDEN");
    return placeRepository.create(
      {
        name: input.name,
        slug: input.slug || `${slugify(input.name)}-${Date.now().toString(36)}`,
        summary: input.summary,
        content:
          input.content == null
            ? Prisma.JsonNull
            : (richTextForStorage(input.content) as Prisma.InputJsonValue),
        coverMedia: input.coverMediaId ? { connect: { id: input.coverMediaId } } : undefined,
        address: input.address,
        author: { connect: { id: actor.id } },
        city: { connect: { id: input.cityId } },
        categories: {
          create: input.categoryIds.map((categoryId) => ({
            category: { connect: { id: categoryId } },
          })),
        },
        status: initialStatus,
      },
      input.lat,
      input.lng,
    );
  },
  async update(actor: Actor, id: string, input: PlaceUpdate) {
    const place = await placeRepository.findById(id);
    if (!place) throw new Error("NOT_FOUND");
    if (!canEditPlace(actor, place.authorId, place.author.role)) throw new Error("FORBIDDEN");
    await assertCoverAccess(actor, input.coverMediaId);
    await assertContentMediaAccess(actor, input.content);
    await assertCategoryScope(input.categoryIds, "PLACE");
    const requestedStatus = (input as { status?: ContentStatus }).status;
    if (
      requestedStatus &&
      !canTransitionContent(actor, place.authorId, place.author.role, place.status, requestedStatus)
    )
      throw new Error("FORBIDDEN");
    const { lat, lng, categoryIds, cityId, coverMediaId, content, ...rest } = input;
    const data: Prisma.PlaceUpdateInput = {
      ...rest,
      ...(content !== undefined
        ? {
            content:
              content === null
                ? Prisma.JsonNull
                : (richTextForStorage(content) as Prisma.InputJsonValue),
          }
        : {}),
      ...(cityId !== undefined ? { city: { connect: { id: cityId } } } : {}),
      ...(coverMediaId !== undefined
        ? {
            coverMedia: coverMediaId ? { connect: { id: coverMediaId } } : { disconnect: true },
          }
        : {}),
      ...(categoryIds !== undefined
        ? {
            categories: {
              deleteMany: {},
              create: categoryIds.map((categoryId) => ({
                category: { connect: { id: categoryId } },
              })),
            },
          }
        : {}),
    };
    const updated = await placeRepository.update(
      id,
      data,
      lat !== undefined && lng !== undefined ? { lat, lng } : undefined,
    );
    if (requestedStatus && requestedStatus !== place.status) {
      const { auditRepository } = await import("@/lib/repositories/audit.repository");
      await auditRepository.create({
        actorId: actor.id,
        action: "CONTENT_STATUS_CHANGED",
        entity: "PLACE",
        entityId: id,
        metadata: { previousStatus: place.status, nextStatus: requestedStatus },
      });
    }
    return updated;
  },
  async delete(actor: Actor, id: string) {
    const place = await placeRepository.findById(id);
    if (!place) throw new Error("NOT_FOUND");
    if (!canEditPlace(actor, place.authorId, place.author.role)) throw new Error("FORBIDDEN");
    await placeRepository.delete(id);
  },
};
