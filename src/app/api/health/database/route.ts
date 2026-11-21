import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Preview-only, read-only connectivity test. No secrets or SQL errors are returned. */
export async function GET() {
  if (process.env.VERCEL_ENV !== "preview") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ database: "not_configured" }, { status: 503 });
  }
  try {
    await db.$queryRaw`SELECT 1`;
    const tables = await db.$queryRaw<Array<{ present: boolean }>>`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'Product'
      ) AS present
    `;
    return NextResponse.json(
      { database: "reachable", schema: tables[0]?.present ? "initialized" : "not_initialized" },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ database: "unreachable" }, { status: 503 });
  }
}
