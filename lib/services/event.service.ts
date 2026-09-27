import { ContentStatus, Prisma } from "@/generated/prisma/client";
import {
  canCreateContent,
  canEditEvent,
  canTransitionContent,
  type Actor,
} from "@/lib/permissions";
import { eventRepository } from "@/lib/repositories/event.repository";
import { richTextForStorage } from "@/lib/content/rich-text-media";
import {
  assertCategoryScope,
  assertContentMediaAccess,
  assertCoverAccess,
} from "@/lib/services/content-media-access";
import { slugify } from "@/lib/utils/slug";
import type { z } from "zod";
import type {
  eventCreateSchema,
  eventQuerySchema,
  eventUpdateSchema,
} from "@/lib/validations/event.schema";

type EventCreate = z.infer<typeof eventCreateSchema>;
type EventUpdate = z.infer<typeof eventUpdateSchema>;
type EventQuery = z.infer<typeof eventQuerySchema>;
function eventWhere(query: EventQuery): Prisma.EventWhereInput {
  const now = new Date();
  const range = publicOccurrenceRange(query, now);
  return {
    // Este service respalda únicamente listados públicos. Los estados internos
    // se consultan mediante repositorios en vistas protegidas.
    status: ContentStatus.PUBLISHED,
    ...(query.search ? { name: { contains: query.search, mode: "insensitive" } } : {}),
    ...(query.category ? { categories: { some: { category: { slug: query.category } } } } : {}),
    ...(query.city ? { place: { city: { slug: query.city } } } : {}),
    ...(query.minPrice !== undefined || query.maxPrice !== undefined
      ? { price: { gte: query.minPrice, lte: query.maxPrice } }
      : {}),
    ...(query.free ? { price: 0 } : {}),
    occurrences: { some: { startsAt: range } },
  };
}
function publicOccurrenceRange(query: EventQuery, now: Date): Prisma.DateTimeFilter {
  const startsAt: Prisma.DateTimeFilter = {
    ...(query.startsFrom
      ? { gte: query.startsFrom }
      : query.sort === "upcoming" || query.period
        ? { gte: now }
        : {}),
    ...(query.startsTo ? { lte: query.startsTo } : {}),
  };
  if (!query.period) return startsAt;
  const end = new Date(now);
  if (query.period === "today") end.setHours(23, 59, 59, 999);
  if (query.period === "next_7_days") end.setDate(end.getDate() + 7);
  if (query.period === "weekend") {
    const days = (6 - end.getDay() + 7) % 7;
    end.setDate(end.getDate() + days + 1);
    end.setHours(23, 59, 59, 999);
  }
  return { ...startsAt, lte: end };
}
export const eventService = {
  async list(query: EventQuery) {
    const where = eventWhere(query);
    if (query.sort === "upcoming") {
      const now = new Date();
      const range = publicOccurrenceRange(query, now);
      return eventRepository.findPublicUpcoming({
        ...query,
        from: range.gte instanceof Date && range.gte > now ? range.gte : now,
        to: range.lte instanceof Date ? range.lte : undefined,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      });
    }
    const orderBy =
      query.sort === "newest"
        ? { createdAt: "desc" as const }
        : query.sort === "price_asc"
          ? { price: "asc" as const }
          : query.sort === "price_desc"
            ? { price: "desc" as const }
            : { createdAt: "desc" as const };
    const [data, total] = await Promise.all([
      eventRepository.findMany(where, (query.page - 1) * query.pageSize, query.pageSize, orderBy),
      eventRepository.count(where),
    ]);
    return { data, total };
  },
  findById: (id: string) => eventRepository.findById(id),
  findBySlug: (slug: string) => eventRepository.findBySlug(slug),
  findPublicById: (id: string) => eventRepository.findPublishedById(id),
  findPublicBySlug: (slug: string) => eventRepository.findPublishedBySlug(slug),
  async create(actor: Actor, input: EventCreate) {
    if (!canCreateContent(actor)) throw new Error("FORBIDDEN");
    const initialStatus =
      actor.role === "MODERATOR"
        ? ContentStatus.PENDING_REVIEW
        : (input.status ?? ContentStatus.DRAFT);
    if (!canTransitionContent(actor, actor.id, actor.role, ContentStatus.DRAFT, initialStatus))
      throw new Error("FORBIDDEN");
    const slug = input.slug || `${slugify(input.name)}-${Date.now().toString(36)}`;
    await assertCoverAccess(actor, input.coverMediaId);
    await assertContentMediaAccess(actor, input.content);
    await assertCategoryScope(input.categoryIds, "EVENT");
    return eventRepository.create({
      name: input.name,
      slug,
      summary: input.summary,
      content:
        input.content == null
          ? Prisma.JsonNull
          : (richTextForStorage(input.content) as Prisma.InputJsonValue),
      coverMedia: input.coverMediaId ? { connect: { id: input.coverMediaId } } : undefined,
      price: new Prisma.Decimal(input.price),
      capacity: input.capacity,
      author: { connect: { id: actor.id } },
      place: { connect: { id: input.placeId } },
      categories: {
        create: input.categoryIds.map((categoryId) => ({
          category: { connect: { id: categoryId } },
        })),
      },
      occurrences: {
        create: input.occurrences.map(({ id: _, ...occurrence }) => ({
          ...occurrence,
          status: initialStatus,
        })),
      },
      status: initialStatus,
    });
  },
  async update(actor: Actor, id: string, input: EventUpdate) {
    const event = await eventRepository.findById(id);
    if (!event) throw new Error("NOT_FOUND");
    if (!canEditEvent(actor, event.authorId, event.author.role)) throw new Error("FORBIDDEN");
    await assertCoverAccess(actor, input.coverMediaId);
    await assertContentMediaAccess(actor, input.content);
    await assertCategoryScope(input.categoryIds, "EVENT");
    const requestedStatus = (input as { status?: ContentStatus }).status;
    if (
      requestedStatus &&
      !canTransitionContent(actor, event.authorId, event.author.role, event.status, requestedStatus)
    )
      throw new Error("FORBIDDEN");
    const data: Prisma.EventUpdateInput = {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
      ...(input.summary !== undefined ? { summary: input.summary } : {}),
      ...(input.content !== undefined
        ? {
            content:
              input.content === null
                ? Prisma.JsonNull
                : (richTextForStorage(input.content) as Prisma.InputJsonValue),
          }
        : {}),
      ...(input.price !== undefined ? { price: new Prisma.Decimal(input.price) } : {}),
      ...(input.capacity !== undefined ? { capacity: input.capacity } : {}),
      ...(input.placeId !== undefined ? { place: { connect: { id: input.placeId } } } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.coverMediaId !== undefined
        ? {
            coverMedia: input.coverMediaId
              ? { connect: { id: input.coverMediaId } }
              : { disconnect: true },
          }
        : {}),
      ...(input.categoryIds !== undefined
        ? {
            categories: {
              deleteMany: {},
              create: input.categoryIds.map((categoryId) => ({
                category: { connect: { id: categoryId } },
              })),
            },
          }
        : {}),
      ...(input.occurrences !== undefined
        ? occurrenceUpdates(event.occurrences, input.occurrences, requestedStatus ?? event.status)
        : requestedStatus !== undefined
          ? { occurrences: { updateMany: { where: {}, data: { status: requestedStatus } } } }
          : {}),
    };
    const updated = await eventRepository.update(id, data);
    if (requestedStatus && requestedStatus !== event.status) {
      const { auditRepository } = await import("@/lib/repositories/audit.repository");
      await auditRepository.create({
        actorId: actor.id,
        action: "CONTENT_STATUS_CHANGED",
        entity: "EVENT",
        entityId: id,
        metadata: { previousStatus: event.status, nextStatus: requestedStatus },
      });
    }
    return updated;
  },
  async delete(actor: Actor, id: string) {
    const event = await eventRepository.findById(id);
    if (!event) throw new Error("NOT_FOUND");
    if (!canEditEvent(actor, event.authorId, event.author.role)) throw new Error("FORBIDDEN");
    await eventRepository.delete(id);
  },
};

function occurrenceUpdates(
  existing: Array<{ id: string }>,
  incoming: Array<{
    id?: string;
    startsAt: Date;
    endsAt: Date;
    timezone: string;
  }>,
  status: ContentStatus,
): Prisma.EventUpdateInput {
  const existingIds = new Set(existing.map(({ id }) => id));
  const retainedIds = incoming.flatMap(({ id }) => (id ? [id] : []));
  if (retainedIds.some((id) => !existingIds.has(id))) throw new Error("INVALID_OCCURRENCE");
  return {
    occurrences: {
      deleteMany: retainedIds.length ? { id: { notIn: retainedIds } } : {},
      update: incoming
        .filter((occurrence): occurrence is typeof occurrence & { id: string } =>
          Boolean(occurrence.id),
        )
        .map(({ id, ...occurrence }) => ({ where: { id }, data: { ...occurrence, status } })),
      create: incoming
        .filter((occurrence) => !occurrence.id)
        .map(({ id: _, ...occurrence }) => ({ ...occurrence, status })),
    },
  };
}
