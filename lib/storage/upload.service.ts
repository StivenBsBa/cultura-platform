import { randomUUID } from "node:crypto";
import { createPresignedPut, getObjectBytes, objectExists } from "./s3";

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
export async function createUpload(input: {
  ownerId: string;
  kind: "EVENT" | "PLACE" | "USER" | "CATEGORY";
  entityId?: string;
  mimeType: string;
  size: number;
  filename: string;
}) {
  const extension = extensions[input.mimeType];
  if (
    !extension ||
    !ALLOWED_IMAGE_TYPES.includes(input.mimeType as never) ||
    !/\.(jpe?g|png|webp)$/i.test(input.filename)
  )
    throw new Error("INVALID_FORMAT");
  if (input.size < 1 || input.size > MAX_IMAGE_SIZE) throw new Error("INVALID_SIZE");
  // El propietario siempre forma parte de la key; entityId es solo contexto.
  const objectKey = `${input.kind.toLowerCase()}s/${input.ownerId}/${input.entityId ?? "unattached"}/${randomUUID()}.${extension}`;
  return { objectKey, uploadUrl: await createPresignedPut(objectKey, input.mimeType) };
}
export const verifyUploadedObject = objectExists;

export function readImageMetadata(mimeType: string, bytes: Uint8Array) {
  const isJpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng =
    bytes.length >= 24 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;
  const isWebp =
    bytes.length >= 16 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50;
  const valid =
    (mimeType === "image/jpeg" && isJpeg) ||
    (mimeType === "image/png" && isPng) ||
    (mimeType === "image/webp" && isWebp);
  if (!valid) throw new Error("INVALID_IMAGE_SIGNATURE");

  let dimensions: { width: number | null; height: number | null };
  if (isPng) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    dimensions = { width: view.getUint32(16), height: view.getUint32(20) };
  } else if (isWebp) dimensions = webpDimensions(bytes);
  else dimensions = jpegDimensions(bytes);
  // La firma sola no basta: la estructura debe contener dimensiones válidas.
  if (!dimensions.width || !dimensions.height) throw new Error("INVALID_IMAGE_SIGNATURE");
  return dimensions;
}

function jpegDimensions(bytes: Uint8Array) {
  // Busca un marcador SOF válido, sin decodificar el archivo completo.
  for (let index = 2; index + 9 < bytes.length; ) {
    if (bytes[index] !== 0xff) {
      index += 1;
      continue;
    }
    const marker = bytes[index + 1];
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      index += 2;
      continue;
    }
    const length = (bytes[index + 2] << 8) | bytes[index + 3];
    if (length < 2 || index + 2 + length > bytes.length) break;
    if (
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf)
    ) {
      return {
        width: (bytes[index + 7] << 8) | bytes[index + 8],
        height: (bytes[index + 5] << 8) | bytes[index + 6],
      };
    }
    index += 2 + length;
  }
  return { width: null, height: null };
}

function webpDimensions(bytes: Uint8Array) {
  const chunk = String.fromCharCode(...bytes.slice(12, 16));
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (chunk === "VP8X" && bytes.length >= 30)
    return {
      width: 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16),
      height: 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16),
    };
  if (chunk === "VP8 " && bytes.length >= 30)
    return { width: view.getUint16(26, true) & 0x3fff, height: view.getUint16(28, true) & 0x3fff };
  if (chunk === "VP8L" && bytes.length >= 25) {
    const bits = view.getUint32(21, true);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  return { width: null, height: null };
}

export async function inspectUploadedImage(key: string, mimeType: string) {
  const bytes = await getObjectBytes(key);
  if (!bytes) throw new Error("OBJECT_NOT_FOUND");
  return readImageMetadata(mimeType, bytes);
}
