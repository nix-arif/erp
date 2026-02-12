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

async function deleteAllObjects() {
  let continuationToken: string | undefined = undefined;

  do {
    const listCommand: ListObjectsV2Command = new ListObjectsV2Command({
      Bucket: BUCKET,
      ContinuationToken: continuationToken,
    });

    const listResponse = await s3.send(listCommand);

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      console.log("🧹 Bucket already empty");
      break;
    }

    const deleteCommand = new DeleteObjectsCommand({
      Bucket: BUCKET,
      Delete: {
        Objects: listResponse.Contents.map((obj) => ({
          Key: obj.Key!,
        })),
      },
    });

    await s3.send(deleteCommand);

    console.log(`🗑️ Deleted ${listResponse.Contents.length} objects`);

    continuationToken = listResponse.NextContinuationToken;
  } while (continuationToken);

  console.log("✅ Semua file dalam bucket dah dipadam");
}

deleteAllObjects().catch(console.error);
