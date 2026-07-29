import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ALIVE",
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}
