import type { Metadata } from "next";
import "./globals.css";
import { initialTheme } from "@/data/initial-theme-inline";
export const metadata: Metadata = {
  metadataBase: new URL("https://www.worldtreasures.co.za"),
  applicationName: "World Treasures",
  title: {default:"World Treasures | Imported Snacks & Drinks in Gqeberha",template:"%s | World Treasures"},
  description: "Discover imported snacks, chocolate, candy and drinks at World Treasures, 60-A Heugh Road, Walmer, Port Elizabeth (Gqeberha), South Africa. Browse the verified collection online.",
  alternates:{canonical:"/"},
  robots:{index:true,follow:true},
  openGraph:{type:"website",url:"https://www.worldtreasures.co.za/",siteName:"World Treasures",locale:"en_ZA",title:"World Treasures | Imported Snacks & Drinks in Gqeberha",description:"Imported snacks, chocolates, candy and drinks in Walmer, Gqeberha. Browse our collection online."},
  twitter:{card:"summary",title:"World Treasures | Imported Snacks & Drinks",description:"Explore imported snacks and drinks in Walmer, Gqeberha."},
  icons: { icon: "/brand/favicon.webp" }
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <script dangerouslySetInnerHTML={{__html: initialTheme}} />
  </head><body>{children}<script defer src="/legacy/bag-basket-enhancement.js" /></body></html>;
}
