"use client";
import {useActionState} from "react";
import {testTransactionalEmail,type EmailTestState} from "./actions";
const initial:EmailTestState={status:"idle",message:""};
export function EmailTestForm({ready}:{ready:boolean}){
 const [state,action,pending]=useActionState(testTransactionalEmail,initial);
 return <form action={action} className="wt-stack">
  <p className="wt-lede">Send a test only to the account owner email. No customer is contacted and no order is created.</p>
  <button className="wt-btn orange" type="submit" disabled={!ready||pending}>{pending?"Sending test…":"Send owner-only test email"}</button>
  {!ready&&<p className="wt-help">Connect the provider and verify the sending domain first. Production test sends also require the explicit EMAIL_ADMIN_TEST_ENABLED=true toggle.</p>}
  {state.message&&<p className="wt-help" role="status">{state.message}</p>}
 </form>;
}
