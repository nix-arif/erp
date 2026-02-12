import {
  ListObjectsV2Command,
  DeleteObjectsCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_PRODUCT_IMAGES!;

async function deleteAllJpegObjects() {
  let continuationToken: string | undefined = undefined;
  let totalDeleted = 0;

  do {
    const listCommand: ListObjectsV2Command = new ListObjectsV2Command({
      Bucket: BUCKET,
      ContinuationToken: continuationToken,
    });

    const listResponse = await s3.send(listCommand);

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      break;
    }

    // 👉 FILTER .jpeg sahaja (case-insensitive)
    const jpegObjects = listResponse.Contents.filter(
      (obj) => obj.Key && obj.Key.toLowerCase().endsWith(".jpeg"),
    ).map((obj) => ({ Key: obj.Key! }));

    if (jpegObjects.length > 0) {
      const deleteCommand = new DeleteObjectsCommand({
        Bucket: BUCKET,
        Delete: {
          Objects: jpegObjects,
        },
      });

      await s3.send(deleteCommand);

      totalDeleted += jpegObjects.length;
      console.log(`🗑️ Deleted ${jpegObjects.length} .jpeg objects`);
    }

    continuationToken = listResponse.NextContinuationToken;
  } while (continuationToken);

  console.log(`✅ Siap! Total .jpeg dipadam: ${totalDeleted}`);
}

deleteAllJpegObjects().catch(console.error);
