/**
 * Account links must never follow a browser-supplied Host or redirect parameter.
 * Trust only our canonical domain or Vercel's server-controlled deployment URL.
 */
export function customerAccountOrigin(env:NodeJS.ProcessEnv=process.env):string{
 if(env.VERCEL_ENV==="preview"){
  const host=(env.VERCEL_URL||"").toLowerCase();
  if(/^world-treasures-prod-[a-z0-9-]+\.vercel\.app$/.test(host))
   return "https://"+host;
  throw new Error("Preview customer account origin not configured");
 }
 return "https://www.worldtreasures.co.za";
}
