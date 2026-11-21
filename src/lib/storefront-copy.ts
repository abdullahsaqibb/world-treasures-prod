/** Whitelisted editable copy; the approved storefront layout remains fixed. */
export const copyFields = [
 {key:"shop_heading",label:"Shop section heading",hint:"Headline above the product catalog",original:"Snacks & drinks"},
 {key:"shop_intro",label:"Shop section description",hint:"Short sentence introducing the range",original:"Imported favourites and something new. Browse by category to find your next snack."},
 {key:"mix_intro",label:"Build-a-box description",hint:"Text below the mix-a-box headline",original:"Sweet, salty, fizzy. Pick any three different discoveries and make your own little adventure."},
 {key:"visit_heading",label:"Visit section heading",hint:"Heading above shop location details",original:"Visit World Treasures"},
 {key:"newsletter_heading",label:"Newsletter heading",hint:"Heading above the signup area",original:"First to know."},
 {key:"newsletter_intro",label:"Newsletter description",hint:"Short signup description",original:"New drops, little surprises, and first dibs."},
 {key:"faq_heading",label:"FAQ heading",hint:"Heading above customer questions",original:"Frequently asked questions"}
] as const;
export type StoreCopyKey = (typeof copyFields)[number]["key"];
export const defaultCopy=Object.fromEntries(copyFields.map(f=>[f.key,f.original])) as Record<StoreCopyKey,string>;
