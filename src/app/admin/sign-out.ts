"use server";
import {signOut} from "@/auth";
/** Invalidate the owner session and return to the staff sign-in screen. */
export async function adminSignOut(){
 await signOut({redirectTo:"/admin/login"});
}
