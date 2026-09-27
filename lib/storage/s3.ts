import {
  CreateBucketCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
const s3 = new S3Client({
  region: process.env.S3_REGION ?? "us-east-1",
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
  },
});
// El backend usa el hostname interno; las URLs firmadas pueden usar el endpoint
// publicado al navegador cuando la aplicación corre dentro de Docker.
const presignClient = new S3Client({
  region: process.env.S3_REGION ?? "us-east-1",
  endpoint: process.env.S3_PUBLIC_ENDPOINT ?? process.env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
  },
});
const bucket = process.env.S3_BUCKET ?? "cultura-media";
let ready = false;
async function ensureBucket() {
  if (ready) return;
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucket }));
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: bucket }));
  }
  ready = true;
}
export async function createPresignedPut(key: string, mimeType: string) {
  await ensureBucket();
  return getSignedUrl(
    presignClient,
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: mimeType }),
    { expiresIn: 300 },
  );
}
export async function objectExists(key: string) {
  await ensureBucket();
  try {
    return await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
  } catch {
    return null;
  }
}
export async function getObject(key: string) {
  await ensureBucket();
  return s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
}

/** Descarga un objeto ya limitado por el flujo de upload (máximo 5 MB). */
export async function getObjectBytes(key: string) {
  const result = await getObject(key);
  if (!result.Body) return null;
  return new Uint8Array(await result.Body.transformToByteArray());
}
export async function deleteObject(key: string) {
  await ensureBucket();
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
