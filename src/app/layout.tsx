import type { Metadata } from "next";
import "./globals.css";
import { initialTheme } from "@/data/initial-theme-inline";
export const metadata: Metadata = {
  title: "World Treasures | Imported Snacks & Drinks",
  description: "Imported snacks and drinks at World Treasures.",
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
