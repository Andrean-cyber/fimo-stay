import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET() {
  try {
    const testKey = "quantixpro:test";
    const testValue = `Connected at ${new Date().toISOString()}`;

    // Simpan data
    await redis.set(testKey, testValue);

    // Ambil data
    const value = await redis.get(testKey);

    return NextResponse.json({
      success: true,
      message: "✅ Berhasil terhubung ke Upstash Redis",
      data: {
        key: testKey,
        value,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "❌ Gagal terhubung ke Upstash Redis",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}