import { NextResponse } from "next/server";
import {
  S3Client,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";

export async function GET() {
  try {
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });

    await client.send(
      new HeadBucketCommand({
        Bucket: process.env.R2_BUCKET_NAME,
      })
    );

    return NextResponse.json({
      success: true,
      message: "✅ Berhasil terhubung ke Cloudflare R2",
      bucket: process.env.R2_BUCKET_NAME,
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "❌ Gagal terhubung ke Cloudflare R2",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}