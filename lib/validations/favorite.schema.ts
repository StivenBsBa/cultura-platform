import { z } from "zod";
export const favoriteSchema = z.object({
  type: z.enum(["event", "place"]),
  targetId: z.string().cuid(),
});
