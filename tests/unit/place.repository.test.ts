import { describe, expect, it, vi } from "vitest";

const { queryRaw } = vi.hoisted(() => ({ queryRaw: vi.fn().mockResolvedValue([]) }));

vi.mock("@/lib/db/prisma", () => ({ prisma: { $queryRaw: queryRaw } }));

import { placeRepository } from "@/lib/repositories/place.repository";

describe("placeRepository.findWithinRadius", () => {
  it.each(["DRAFT", "PENDING_REVIEW"])("no incluye lugares %s en la consulta pública", async () => {
    await placeRepository.findWithinRadius(6.2, -75.5, 5000);

    const query = vi.mocked(queryRaw).mock.calls.at(-1)?.[0] as { strings: string[] };
    expect(query.strings.join("")).toContain("\"status\" = 'PUBLISHED'");
  });
});
