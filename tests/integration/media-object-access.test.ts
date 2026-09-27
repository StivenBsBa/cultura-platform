import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { mediaRepository, getObject } = vi.hoisted(() => ({
  mediaRepository: {
    findById: vi.fn(),
    findByObjectKey: vi.fn().mockResolvedValue(null),
    findByLegacyKey: vi.fn().mockResolvedValue(null),
  },
  getObject: vi.fn(),
}));

vi.mock("@/lib/repositories/media.repository", () => ({ mediaRepository }));
vi.mock("@/lib/storage/s3", () => ({ getObject }));

import { GET } from "@/app/api/v1/uploads/object/route";

describe("GET /api/v1/uploads/object", () => {
  it("no expone una key válida que no esté registrada como MediaAsset", async () => {
    const key =
      "events/clx123456789012345678901/unattached/7e0c4924-5e98-4bd7-9a0a-973843ce5db1.webp";
    const response = await GET(
      new NextRequest(`http://test/api/v1/uploads/object?key=${encodeURIComponent(key)}`),
    );

    expect(response.status).toBe(404);
    expect(getObject).not.toHaveBeenCalled();
  });
});
