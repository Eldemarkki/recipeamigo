import * as Minio from "minio";

export const DEFAULT_BUCKET_NAME = process.env.S3_BUCKET_NAME ?? "";

export const s3 = new Minio.Client({
  endPoint: process.env.S3_ENDPOINT ?? "",
  port: process.env.S3_PORT ? parseInt(process.env.S3_PORT) : 9000,
  useSSL: process.env.S3_USE_SSL === "true" ? true : false,
  accessKey: process.env.S3_ACCESS_KEY_ID ?? "",
  secretKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
});
