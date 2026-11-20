import { ApprovedRegions } from "@/components/ApprovedRegions";
import { LegacyRuntime } from "@/components/LegacyRuntime";

/** Approved catalogue, shown as a non-transactional public business preview until payments are tested. */
export default function Home() {
 return <>
  <div className="wt-public-launch-note" role="note">
   <strong>World Treasures catalogue preview</strong>
   <span>Product information and prices are being verified. Online orders and payments are not yet enabled.</span>
  </div>
  <ApprovedRegions /><LegacyRuntime />
 </>;
}
