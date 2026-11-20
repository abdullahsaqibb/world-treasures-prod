import NextAuth,{type Session} from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import {scryptSync,timingSafeEqual} from "node:crypto";
import {isAuthorizedAdminId} from "@/lib/admin-config";

const LOCAL_ID="world-treasures-local-owner";
function localEnabled(){
 return (process.env.VERCEL_ENV!=="production"||process.env.ADMIN_CREDENTIALS_PRODUCTION_ENABLED==="true") &&
  Boolean(process.env.ADMIN_LOGIN_EMAIL&&process.env.ADMIN_PASSWORD_SCRYPT&&process.env.AUTH_SECRET);
}
function checkPassword(candidate:string){
 const stored=process.env.ADMIN_PASSWORD_SCRYPT||"";
 const parts=stored.split(":");
 if(parts.length!==2||!/^[0-9a-f]{32,128}$/i.test(parts[0])||!/^[0-9a-f]{128}$/i.test(parts[1]))return false;
 try{
  const expected=Buffer.from(parts[1],"hex");
  const actual=scryptSync(candidate,Buffer.from(parts[0],"hex"),expected.length,{maxmem:64*1024*1024});
  return timingSafeEqual(actual,expected);
 }catch{return false;}
}
export const {handlers,auth,signIn,signOut}=NextAuth({
 providers:[
  GitHub,
  Credentials({
   id:"credentials",
   name:"Owner email and password",
   credentials:{email:{label:"Email",type:"email"},password:{label:"Password",type:"password"}},
   async authorize(input){
    if(!localEnabled())return null;
    const email=String(input?.email??"").trim().toLowerCase();
    const password=String(input?.password??"");
    if(email.length>254||password.length>1024||password.length<16)return null;
    const owner=process.env.ADMIN_LOGIN_EMAIL!.trim().toLowerCase();
    // Run the password KDF for any normal-length candidate even when the email is wrong.
    const passwordOk=checkPassword(password);
    if(email!==owner||!passwordOk)return null;
    return {id:LOCAL_ID,email:owner,name:"World Treasures Owner"};
   }
  })
 ],
 session:{strategy:"jwt",maxAge:8*60*60},
 callbacks:{
  async signIn({account,profile,user}){
   if(account?.provider==="credentials")return localEnabled()&&user?.id===LOCAL_ID;
   return account?.provider==="github"&&!!profile&&isAuthorizedAdminId(String(profile.id));
  },
  async jwt({token,account,profile,user}){
   if(account?.provider==="credentials"&&user?.id===LOCAL_ID){
    token.adminMethod="credentials";
    token.githubId=undefined;
   }else if(account?.provider==="github"&&profile?.id!==undefined){
    token.adminMethod="github";
    token.githubId=String(profile.id);
   }
   return token;
  },
  async session({session,token}){
   if(session.user){
    session.user.id=token.adminMethod==="credentials"&&localEnabled()?LOCAL_ID:
      token.adminMethod==="github"?String(token.githubId??""):"";
   }
   return session;
  }
 },
 pages:{signIn:"/admin/login"}
});
export function isAdminSession(session:Session|null){
 const id=session?.user?.id;
 return Boolean(id&&(id===LOCAL_ID?localEnabled():isAuthorizedAdminId(id)));
}
export async function requireAdmin(){
 const session=await auth();
 if(!isAdminSession(session))throw new Error("Unauthorized");
 return session!;
}
