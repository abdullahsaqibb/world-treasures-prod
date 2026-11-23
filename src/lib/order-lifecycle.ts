/** Pure lifecycle rules: do not trigger customer email or fulfilment from redirect URLs. */
export type OrderLifecycleState="PENDING_PAYMENT"|"PAID"|"PROCESSING"|"SHIPPED"|"DELIVERED"|"CANCELLED"|"REFUNDED";
export type OrderLifecycleEvent="PAYMENT_VERIFIED"|"START_PROCESSING"|"DISPATCH_CONFIRMED"|"DELIVERY_CONFIRMED"|"CANCEL_UNPAID"|"REFUND_VERIFIED";
const allowed:Record<OrderLifecycleState,Partial<Record<OrderLifecycleEvent,OrderLifecycleState>>>={
 PENDING_PAYMENT:{PAYMENT_VERIFIED:"PAID",CANCEL_UNPAID:"CANCELLED"},
 PAID:{START_PROCESSING:"PROCESSING",REFUND_VERIFIED:"REFUNDED"},
 PROCESSING:{DISPATCH_CONFIRMED:"SHIPPED",REFUND_VERIFIED:"REFUNDED"},
 SHIPPED:{DELIVERY_CONFIRMED:"DELIVERED",REFUND_VERIFIED:"REFUNDED"},
 DELIVERED:{REFUND_VERIFIED:"REFUNDED"},
 CANCELLED:{},
 REFUNDED:{}
};
export type CustomerNotice="PAYMENT_CONFIRMED"|"PROCESSING"|"SHIPPED"|"DELIVERED"|"CANCELLED"|"REFUNDED";
export function nextOrderState(state:OrderLifecycleState,event:OrderLifecycleEvent){
 const next=allowed[state]?.[event];
 if(!next)throw new Error("Invalid order status transition");
 return next;
}
export function noticeForEvent(event:OrderLifecycleEvent):CustomerNotice|null{
 const notices:Partial<Record<OrderLifecycleEvent,CustomerNotice>>={
  PAYMENT_VERIFIED:"PAYMENT_CONFIRMED",START_PROCESSING:"PROCESSING",
  DISPATCH_CONFIRMED:"SHIPPED",DELIVERY_CONFIRMED:"DELIVERED",
  CANCEL_UNPAID:"CANCELLED",REFUND_VERIFIED:"REFUNDED"
 };
 return notices[event]??null;
}
