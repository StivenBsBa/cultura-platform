import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

export const auditRepository = {
  create: (data: {
    actorId: string;
    action: string;
    entity: string;
    entityId: string;
    metadata: Prisma.InputJsonValue;
  }) => prisma.auditLog.create({ data }),
};
