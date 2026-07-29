import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "HEALTHY",
        uptimeSeconds: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        database: {
          status: "CONNECTED",
          latencyMs: dbLatencyMs,
        },
        services: {
          cloudinary: process.env.CLOUDINARY_CLOUD_NAME ? "CONFIGURED" : "PLACEHOLDER",
          razorpay: process.env.RAZORPAY_KEY_ID ? "CONFIGURED" : "PLACEHOLDER",
          shiprocket: process.env.SHIPROCKET_EMAIL ? "CONFIGURED" : "PLACEHOLDER",
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "UNHEALTHY",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
