import { ContentStatus } from "@/generated/prisma/client";
import { z } from "zod";
import { paginationSchema } from "./common";

export const occurrenceSchema = z
  .object({
    id: z.string().cuid().optional(),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    timezone: z.string().min(3).max(64),
  })
  .refine(({ startsAt, endsAt }) => endsAt > startsAt, "endsAt must be after startsAt");
const contentSchema = z.record(z.string(), z.unknown()).optional().nullable();
export const eventCreateSchema = z.object({
  name: z.string().trim().min(3).max(180),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  summary: z.string().trim().min(10).max(300),
  content: contentSchema,
  coverMediaId: z.string().cuid().nullable().optional(),
  price: z.coerce.number().min(0).max(99_999_999),
  capacity: z.coerce.number().int().positive().optional(),
  placeId: z.string().cuid(),
  categoryIds: z.array(z.string().cuid()).max(8).default([]),
  occurrences: z.array(occurrenceSchema).min(1).max(50),
  status: z.nativeEnum(ContentStatus).optional(),
});
export const eventUpdateSchema = eventCreateSchema
  .partial()
  .extend({ status: z.nativeEnum(ContentStatus).optional() });
export const eventQuerySchema = paginationSchema
  .extend({
    search: z.string().trim().max(120).optional(),
    category: z.string().max(80).optional(),
    city: z.string().max(80).optional(),
    startsFrom: z.coerce.date().optional(),
    startsTo: z.coerce.date().optional(),
    period: z.enum(["today", "weekend", "next_7_days"]).optional(),
    free: z.coerce.boolean().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    sort: z.enum(["upcoming", "newest", "price_asc", "price_desc"]).default("upcoming"),
  })
  .refine(
    (input) => !input.startsFrom || !input.startsTo || input.startsFrom <= input.startsTo,
    "startsFrom must be before startsTo",
  )
  .strict();
