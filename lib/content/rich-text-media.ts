const mediaIdPattern = /^[a-z0-9]{20,32}$/i;
const validAlignments = new Set(["left", "center", "right"]);
const validSizes = new Set(["small", "medium", "large", "full"]);

export const mediaObjectUrl = (mediaId: string) =>
  `/api/v1/uploads/object?id=${encodeURIComponent(mediaId)}`;

function transform(value: unknown, mode: "editor" | "storage"): unknown {
  if (Array.isArray(value)) return value.map((item) => transform(item, mode));
  if (!value || typeof value !== "object") return value;

  const node = value as Record<string, unknown>;
  const result = Object.fromEntries(
    Object.entries(node).map(([key, child]) => [key, transform(child, mode)]),
  ) as Record<string, unknown>;

  if (result.type !== "image") return result;
  const sourceAttrs =
    result.attrs && typeof result.attrs === "object"
      ? { ...(result.attrs as Record<string, unknown>) }
      : {};
  const mediaId = typeof sourceAttrs.mediaId === "string" ? sourceAttrs.mediaId : null;
  // Solo persiste atributos de presentación. Nunca se conserva una URL externa,
  // data URL o srcset dentro del JSON de Tiptap.
  const attrs: Record<string, unknown> = {
    mediaId,
    alt: typeof sourceAttrs.alt === "string" ? sourceAttrs.alt.slice(0, 250) : null,
    caption: typeof sourceAttrs.caption === "string" ? sourceAttrs.caption.slice(0, 250) : null,
    align: validAlignments.has(String(sourceAttrs.align)) ? sourceAttrs.align : "center",
    size: validSizes.has(String(sourceAttrs.size)) ? sourceAttrs.size : "medium",
  };

  if (mode === "editor" && mediaId && mediaIdPattern.test(mediaId))
    attrs.src = mediaObjectUrl(mediaId);
  return { ...result, attrs };
}

export const richTextForStorage = (content: object) => transform(content, "storage") as object;
export const richTextForEditor = (content: object) => transform(content, "editor") as object;
export const isMediaId = (value: unknown): value is string =>
  typeof value === "string" && mediaIdPattern.test(value);

/** Obtiene todas las imágenes y rechaza nodos image que no estén ligados a MediaAsset. */
export function extractMediaIds(content: unknown) {
  const ids = new Set<string>();
  let invalid = false;
  const visit = (value: unknown) => {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== "object") return;
    const node = value as Record<string, unknown>;
    if (node.type === "image") {
      const mediaId =
        node.attrs && typeof node.attrs === "object"
          ? (node.attrs as Record<string, unknown>).mediaId
          : undefined;
      if (!isMediaId(mediaId)) invalid = true;
      else ids.add(mediaId);
    }
    Object.values(node).forEach(visit);
  };
  visit(content);
  if (invalid) throw new Error("INVALID_MEDIA_REFERENCE");
  return [...ids];
}
