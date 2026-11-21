"use client";
import {useFormStatus} from "react-dom";
export function PendingSubmit({children,pendingText="Saving…",className="wt-btn orange"}:{children:React.ReactNode;pendingText?:string;className?:string}){
 const {pending}=useFormStatus();
 return <button type="submit" className={className} disabled={pending} aria-busy={pending}>{pending?<><span className="wt-saving-spinner" aria-hidden="true"/> {pendingText}</>:children}</button>;
}
