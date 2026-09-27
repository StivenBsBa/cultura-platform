import { describe, expect, it, vi } from "vitest";

const { createPresignedPut } = vi.hoisted(() => ({
  createPresignedPut: vi.fn().mockResolvedValue("http://rustfs.test/upload"),
}));
vi.mock("@/lib/storage/s3", () => ({
  createPresignedPut,
  objectExists: vi.fn(),
  getObjectBytes: vi.fn(),
}));

import { createUpload, MAX_IMAGE_SIZE, readImageMetadata } from "@/lib/storage/upload.service";

const ownerId = "clx123456789012345678901";

describe("createUpload", () => {
  it("crea una key aislada por propietario y extensión válida", async () => {
    const result = await createUpload({
      ownerId,
      kind: "EVENT",
      mimeType: "image/webp",
      size: 1024,
      filename: "portada.webp",
    });

    expect(result.objectKey).toMatch(new RegExp(`^events/${ownerId}/unattached/.+\\.webp$`));
    expect(result.uploadUrl).toBe("http://rustfs.test/upload");
    expect(createPresignedPut).toHaveBeenCalledWith(result.objectKey, "image/webp");
  });

  it("rechaza formatos y tamaños no permitidos", async () => {
    await expect(
      createUpload({
        ownerId,
        kind: "EVENT",
        mimeType: "image/gif",
        size: 1024,
        filename: "portada.gif",
      }),
    ).rejects.toThrow("INVALID_FORMAT");
    await expect(
      createUpload({
        ownerId,
        kind: "EVENT",
        mimeType: "image/png",
        size: MAX_IMAGE_SIZE + 1,
        filename: "portada.png",
      }),
    ).rejects.toThrow("INVALID_SIZE");
  });

  it("valida firma binaria y extrae dimensiones PNG", () => {
    const bytes = new Uint8Array(24);
    bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    new DataView(bytes.buffer).setUint32(16, 640);
    new DataView(bytes.buffer).setUint32(20, 480);
    expect(readImageMetadata("image/png", bytes)).toEqual({ width: 640, height: 480 });
    expect(() => readImageMetadata("image/png", new Uint8Array([1, 2, 3]))).toThrow(
      "INVALID_IMAGE_SIGNATURE",
    );
  });
});
