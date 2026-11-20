/* Legacy account demo safety gate. No email, payment or order is created. */
(function(){
 "use strict";
 const account=document.getElementById("accountDialog");
 const form=document.getElementById("accountForm");
 document.addEventListener("click",event=>{
  const button=event.target instanceof Element?event.target.closest("button"):null;
  if(!button)return;
  if(button.hasAttribute("data-account")){event.preventDefault();if(account&&!account.open)account.showModal();}
  if(button.id==="simulatePayfast"){
   event.preventDefault();event.stopImmediatePropagation();
   button.disabled=true;button.textContent="Payments are not available yet";
  }
 },true);
 if(form)form.addEventListener("submit",event=>{
  event.preventDefault();
  if(!form.reportValidity())return;
  const box=document.getElementById("accountContent");
  if(!box)return;
  const title=document.createElement("h2");
  title.textContent="Customer accounts coming later";
  const message=document.createElement("p");
  message.textContent="This is a preview. No email was sent and no account was created. Guest checkout is available for delivery review.";
  box.replaceChildren(title,message);
 });
 const demoPay=document.getElementById("simulatePayfast");
 if(demoPay){demoPay.disabled=true;demoPay.textContent="Payments unavailable";}
})();
