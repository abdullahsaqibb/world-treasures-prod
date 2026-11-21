/** Shared staff security and launch configuration. No secrets are returned to client components. */
export function getAdminAllowlist(): Set<string> {
 return new Set((process.env.ADMIN_GITHUB_IDS ?? "").split(",").map(x=>x.trim()).filter(Boolean));
}
export function isAuthorizedAdminId(id: string | null | undefined): boolean {
 return typeof id === "string" && id.length>0 && getAdminAllowlist().has(id);
}
export function adminConfiguration() {
 return {
  oauth: Boolean(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET),
  sessionSecret: Boolean(process.env.AUTH_SECRET),
  allowlist: getAdminAllowlist().size>0,
  database: Boolean(process.env.DATABASE_URL),
  directDatabase: Boolean(process.env.DATABASE_URL_UNPOOLED),
  environment: process.env.VERCEL_ENV || "local"
 };
}
