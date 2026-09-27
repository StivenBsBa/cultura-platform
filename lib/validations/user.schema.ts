import { z } from "zod";
import { Role } from "@/generated/prisma/client";
const mediaUrlSchema = z.union([
  z.string().url(),
  z.string().regex(/^\/api\/v1\/uploads\/object\?key=/),
]);

export const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z
      .string()
      .trim()
      .email()
      .max(254)
      .transform((value) => value.toLowerCase()),
    password: z.string().min(8).max(128),
  })
  .strict();
export const profileUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    image: mediaUrlSchema.nullable().optional(),
  })
  .strict()
  .refine((value) => value.name !== undefined || value.image !== undefined, {
    message: "Debes enviar al menos un campo para actualizar.",
  });
export const adminUserUpdateSchema = z
  .object({
    userId: z.string().cuid(),
    name: z.string().trim().min(2).max(100).optional(),
    email: z
      .string()
      .trim()
      .email()
      .max(254)
      .transform((value) => value.toLowerCase())
      .optional(),
    image: mediaUrlSchema.nullable().optional(),
    role: z.enum([Role.USER, Role.CREATOR, Role.MODERATOR]).optional(),
  })
  .strict();

export const adminPasswordResetSchema = z
  .object({ userId: z.string().cuid(), temporaryPassword: z.string().min(8).max(128) })
  .strict();

export const forcedPasswordChangeSchema = z
  .object({ password: z.string().min(8).max(128) })
  .strict();
