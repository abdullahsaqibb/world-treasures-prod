import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { customerEmailTransportReady } from "@/lib/customer-email-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Preview-only, read-only connectivity test. No secrets or SQL errors are returned. */
export async function GET(request: Request) {
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
    // Read-only check against the known isolated World Treasures development branch.
    // Fail closed if this preview is pointed at production or another branch.
    const identity = await db.$queryRaw<Array<{ branch: string | null }>>`
      SELECT current_setting('neon.branch_id', true) AS branch
    `;
    const isolatedDevelopment = identity[0]?.branch === "br-blue-surf-beydnbqx";
    return NextResponse.json(
      { database: "reachable", schema: tables[0]?.present ? "initialized" : "not_initialized",
        isolation: isolatedDevelopment ? "development_verified" : "unexpected_database",
        customerAccountsEnabled: process.env.CUSTOMER_ACCOUNTS_ENABLED==="true",
        customerMailEnabled: customerEmailTransportReady(),
        trustedProxyAddressAvailable: Boolean(request.headers.get("x-vercel-forwarded-for")) },
      { status: isolatedDevelopment ? 200 : 503,
        headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ database: "unreachable" }, { status: 503 });
  }
}
