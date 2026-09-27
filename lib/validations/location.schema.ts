import { z } from "zod";

export const locationSearchSchema = z.object({ q: z.string().trim().min(3).max(120) }).strict();

export const reverseLocationSchema = z
  .object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
  })
  .strict();

export const citiesQuerySchema = z.object({ regionId: z.string().cuid() }).strict();
