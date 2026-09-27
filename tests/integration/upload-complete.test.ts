import { describe, expect, it, vi } from "vitest";

const { ownerId, objectKey, mediaRepository } = vi.hoisted(() => {
  const ownerId = "clx123456789012345678901";
  return {
    ownerId,
    objectKey: `events/${ownerId}/unattached/7e0c4924-5e98-4bd7-9a0a-973843ce5db1.webp`,
    mediaRepository: {
      findByObjectKey: vi.fn(),
      create: vi.fn(),
    },
  };
});

vi.mock("@/lib/auth/session", () => ({
  currentActor: vi.fn().mockResolvedValue({ id: ownerId, role: "CREATOR" }),
}));
vi.mock("@/lib/repositories/media.repository", () => ({ mediaRepository }));
vi.mock("@/lib/storage/upload.service", () => ({
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,
  inspectUploadedImage: vi.fn(),
  verifyUploadedObject: vi.fn().mockResolvedValue({
    ContentType: "image/webp",
    ContentLength: 2048,
  }),
}));

import { POST } from "@/app/api/v1/uploads/complete/route";

describe("POST /api/v1/uploads/complete", () => {
  it("devuelve el MediaAsset existente ante un reintento", async () => {
    mediaRepository.findByObjectKey.mockResolvedValue({ id: "media-1", ownerId, objectKey });

    const response = await POST(
      new Request("http://test/api/v1/uploads/complete", {
        method: "POST",
        body: JSON.stringify({ objectKey }),
      }) as never,
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { id: "media-1", ownerId, objectKey } });
    expect(mediaRepository.create).not.toHaveBeenCalled();
  });
});
