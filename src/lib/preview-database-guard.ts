import {db} from "./db";

/**
 * Fail closed before preview writes when the connected database is not the
 * isolated development branch. Never trust branch hints from request headers.
 */
export async function requireIsolatedPreviewDatabase(){
 if(process.env.VERCEL_ENV!=="preview")return;
 const rows=await db.$queryRaw<Array<{branch:string|null}>>`
  SELECT current_setting('neon.branch_id', true) AS branch
 `;
 if(rows[0]?.branch!=="br-blue-surf-beydnbqx")
  throw new Error("Preview database is not the approved isolated development branch");
}
