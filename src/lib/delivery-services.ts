/** City-based delivery modes. Rates are never inferred from location alone. */
export const deliveryServices=["LOCAL","NATIONAL"] as const;
export type DeliveryService=(typeof deliveryServices)[number];
export function parseDeliveryService(value:unknown):DeliveryService{
 if(value==="LOCAL"||value==="NATIONAL")return value;
 throw new Error("Choose a valid delivery service");
}
export function deliveryServiceLabel(value:string){
 if(value==="LOCAL")return "Local store delivery";
 if(value==="NATIONAL")return "Nationwide courier";
 if(value==="STANDARD")return "Legacy standard delivery";
 return "Unrecognized delivery method";
}
