import { describe, expect, it } from "vitest";
import {
  extractMediaIds,
  richTextForEditor,
  richTextForStorage,
} from "@/lib/content/rich-text-media";

const mediaId = "clx123456789012345678901";

describe("richText media references", () => {
  it("persiste imágenes con mediaId sin URL ni base64", () => {
    const content = {
      type: "doc",
      content: [
        {
          type: "image",
          attrs: { mediaId, src: "data:image/png;base64,unsafe", alt: "Museo" },
        },
      ],
    };

    expect(richTextForStorage(content)).toEqual({
      type: "doc",
      content: [
        {
          type: "image",
          attrs: { mediaId, alt: "Museo", caption: null, align: "center", size: "medium" },
        },
      ],
    });
  });

  it("reconstruye una URL interna solo para edición", () => {
    const content = richTextForEditor({
      type: "doc",
      content: [{ type: "image", attrs: { mediaId, alt: "Museo" } }],
    }) as { content: Array<{ attrs: { src: string } }> };

    expect(content.content[0].attrs.src).toBe(`/api/v1/uploads/object?id=${mediaId}`);
  });

  it("extrae solo IDs válidos y rechaza imágenes no asociadas", () => {
    expect(
      extractMediaIds({ type: "doc", content: [{ type: "image", attrs: { mediaId } }] }),
    ).toEqual([mediaId]);
    expect(() =>
      extractMediaIds({ type: "image", attrs: { src: "data:image/png;base64,x" } }),
    ).toThrow("INVALID_MEDIA_REFERENCE");
  });
});
