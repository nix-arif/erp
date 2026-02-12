import fs from "fs";
import path from "path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

const EXTERNAL_IMAGE_DIR = process.env.EXTERNAL_IMAGE_DIR!;

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_PRODUCT_IMAGES!;

async function uploadImages() {
  const files = fs.readdirSync(EXTERNAL_IMAGE_DIR);

  for (const file of files) {
    const fullPath = path.join(EXTERNAL_IMAGE_DIR, file);
    const buffer = fs.readFileSync(fullPath);

    const normalizedFileName = normalizeFileName(file);

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: file,
      Body: buffer,
      ContentType: getMimeType(normalizedFileName),
    });

    await s3.send(command);
    console.log(`✅ Uploaded: ${file}`);
  }
}

function normalizeFileName(fileName: string): string {
  return fileName.replace(/\.jpeg$/i, ".jpg");
}

function getMimeType(fileName: string): string {
  if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
    return "image/jpeg";
  }
  if (fileName.endsWith(".png")) return "image/png";
  if (fileName.endsWith(".webp")) return "image/webp";
  if (fileName.endsWith(".gif")) return "image/gif";
  return "application/octet-stream";
}

uploadImages().catch((err) => {
  console.error("❌ Upload failed:", err);
});
