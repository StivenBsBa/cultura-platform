import { ContentStatus } from "@/generated/prisma/client";
import { z } from "zod";
import { coordinatesSchema, paginationSchema } from "./common";
const contentSchema = z.record(z.string(), z.unknown()).optional().nullable();

export const placeCreateSchema = z.object({
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
  address: z.string().trim().min(5).max(300),
  cityId: z.string().cuid(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  categoryIds: z.array(z.string().cuid()).max(8).default([]),
  status: z.nativeEnum(ContentStatus).optional(),
});
export const placeUpdateSchema = placeCreateSchema
  .partial()
  .extend({ status: z.nativeEnum(ContentStatus).optional() })
  .refine(
    (input) =>
      (input.lat === undefined && input.lng === undefined) ||
      (input.lat !== undefined && input.lng !== undefined),
    "lat and lng must be provided together",
  );
export const placeQuerySchema = paginationSchema
  .extend({
    search: z.string().trim().max(120).optional(),
    category: z.string().max(80).optional(),
    city: z.string().max(80).optional(),
    cityId: z.string().cuid().optional(),
    lat: z.coerce.number().min(-90).max(90).optional(),
    lng: z.coerce.number().min(-180).max(180).optional(),
    radius: z.coerce.number().positive().max(50_000).optional(),
    sort: z.enum(["distance", "newest", "name"]).default("newest"),
  })
  .refine(
    (input) =>
      (input.lat === undefined && input.lng === undefined) ||
      (input.lat !== undefined && input.lng !== undefined),
    "lat and lng must be provided together",
  )
  .strict();
export const nearbySchema = coordinatesSchema;
