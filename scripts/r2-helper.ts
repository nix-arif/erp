"use server";

import {
  HeadObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";

function assertEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

// S3 client for server-side API calls
const r2 = new S3Client({
  region: "auto",
  endpoint: assertEnv("R2_END_POINT"), // S3 API endpoint
  credentials: {
    accessKeyId: assertEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: assertEnv("R2_SECRET_ACCESS_KEY"),
  },
  forcePathStyle: true,
});

/**
 * Returns browser-ready image URLs for product codes.
 */
export async function getProductImages(
  products: { no: number; productCode: string }[],
) {
  const bucket = assertEnv("R2_BUCKET_PRODUCT_IMAGES");
  const publicBase = assertEnv("R2_PUBLIC_BASE_URL"); // https://pub-xxxx.r2.dev

  const results = await Promise.all(
    products.map(async (item) => {
      const productCode = item.productCode.replaceAll("/", ":");
      const key = `${productCode}.jpg`;

      try {
        // Check EXACT file exists
        await r2.send(
          new HeadObjectCommand({
            Bucket: bucket,
            Key: key,
          }),
        );

        // If no error → file exists

        return {
          no: item.no,
          productCode: item.productCode,
          description: "",
          productImageUrl: `${publicBase}/${encodeURIComponent(key)}`,
        };
      } catch (error: any) {
        if (error?.$metadata?.httpStatusCode !== 404) {
          console.error("Error fetching image for", item.productCode, error);
        }
        return {
          no: item.no,
          productCode: item.productCode,
          description: null,
          productImageUrl: null,
        };
      }
    }),
  );

  // Remove nulls
  return results;
}

interface ProductOut {
  no: number;
  productCode: string;
  description: string;
  oum: string;
  unitPrice: number;
  productImageUrl: string | null;
}

interface ProductIn {
  no: number;
  productCode: string;
  description: string;
  oum: string;
  unitPrice: number | null;
}

export async function getProductImagesUrl(
  products: ProductIn[],
): Promise<ProductOut[]> {
  const bucket = assertEnv("R2_BUCKET_PRODUCT_IMAGES");
  const publicBase = assertEnv("R2_PUBLIC_BASE_URL"); // https://pub-xxxx.r2.dev

  const results = await Promise.all(
    products.map(async (item) => {
      const productCode = item.productCode.replaceAll("/", ":");
      const key = `${productCode}.jpg`;

      try {
        // Check EXACT file exists
        await r2.send(
          new HeadObjectCommand({
            Bucket: bucket,
            Key: key,
          }),
        );

        // If no error → file exists

        return {
          no: item.no,
          productCode: item.productCode,
          description: item.description,
          oum: item.oum,
          unitPrice: item.unitPrice ?? 0,
          productImageUrl: `${publicBase}/${encodeURIComponent(key)}`,
        };
      } catch (error: any) {
        if (error?.$metadata?.httpStatusCode !== 404) {
          console.error("Error fetching image for", item.productCode, error);
        }
        return {
          no: item.no,
          productCode: item.productCode,
          description: item.description,
          oum: item.oum,
          unitPrice: item.unitPrice ?? 0,
          productImageUrl: null,
        };
      }
    }),
  );

  // Remove nulls
  return results;
}
