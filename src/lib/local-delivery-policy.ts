/** Owner-approved local coverage boundary, separate from national courier shipping.
 * No geocoding/routing service is connected yet. A city match alone cannot
 * establish that the customer's door lies inside this boundary.
 */
export const localDeliveryPolicy={
 originAddress:"60-A Heugh Road, opposite McDonald’s, Walmer, Port Elizabeth (Gqeberha), Eastern Cape, South Africa",
 maxDistanceKm:15,
 validation:"ADDRESS_DISTANCE_CHECK_REQUIRED" as const
};
export type LocalDeliveryDecision=
 | {eligible:true;distanceKm:number}
 | {eligible:false;reason:"UNVERIFIED_DISTANCE"|"OUTSIDE_RADIUS"};
/** Only accept measured, server-verified distances; never trust a browser-provided number. */
export function assessLocalDeliveryDistance(distanceKm:number|null,serverVerified:boolean):LocalDeliveryDecision{
 if(!serverVerified||distanceKm===null||!Number.isFinite(distanceKm)||distanceKm<0)
  return {eligible:false,reason:"UNVERIFIED_DISTANCE"};
 if(distanceKm>localDeliveryPolicy.maxDistanceKm)return {eligible:false,reason:"OUTSIDE_RADIUS"};
 return {eligible:true,distanceKm};
}
