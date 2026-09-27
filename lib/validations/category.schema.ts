import { z } from "zod";
export const categorySchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    description: z.string().trim().max(500).default(""),
    scope: z.enum(["EVENT", "PLACE", "BOTH"]).default("BOTH"),
    slug: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
  })
  .strict();
