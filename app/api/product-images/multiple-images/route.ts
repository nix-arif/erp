import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  const items = await request.json();
  console.log(items);

  //   const enrichedItems = await Promise.all(
  //     items.map(async (item: any) => {
  //       try {
  //         const key = item.productCode + ".jpg"; // adjust extension if needed

  //         const command = new GetObjectCommand({
  //           Bucket: process.env.R2_BUCKET!,
  //           Key: key,
  //         });

  //         const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour

  //         return { ...item, productImage: signedUrl };
  //       } catch (error) {
  //         console.warn(`❌ Image for ${item.productCode} not found.`);
  //         return { ...item, productImage: null };
  //       }
  //     }),
  //   );

  return NextResponse.json({});
}
