"use client";
import {useActionState} from "react";
import {ownerSignIn,type LoginResult} from "./actions";

export function OwnerLogin(){
 const [state,action,pending]=useActionState<LoginResult,FormData>(ownerSignIn,{error:""});
 return <form action={action} className="wt-stack" style={{marginTop:18,maxWidth:440}}>
  <label className="wt-field">Admin email
   <input type="email" name="email" autoComplete="username" maxLength={254} required placeholder="you@example.com"/>
  </label>
  <label className="wt-field">Password
   <input type="password" name="password" autoComplete="current-password" minLength={16} maxLength={1024} required placeholder="Your admin password"/>
  </label>
  {state.error&&<p role="alert" className="wt-form-error">{state.error}</p>}
  <button className="wt-login-button" type="submit" disabled={pending}>{pending?"Signing in…":"Sign in to Merchant Studio →"}</button>
 </form>;
}
