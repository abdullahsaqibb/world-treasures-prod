"use server";
import {signIn} from "@/auth";
import {AuthError} from "next-auth";

export type LoginResult={error:string};
export async function ownerSignIn(_previous:LoginResult,form:FormData):Promise<LoginResult>{
 const email=String(form.get("email")||"").trim();
 const password=String(form.get("password")||"");
 const otp=String(form.get("otp")||"");
 if(!email||!password)return {error:"Enter your email and password."};
 try{
  await signIn("credentials",{email,password,otp,redirectTo:"/admin"});
  return {error:""};
 }catch(error){
  if(error instanceof AuthError)return {error:"Sign-in failed. Check your credentials or ask the owner to configure Preview access."};
  throw error; // Next.js redirect must propagate.
 }
}
