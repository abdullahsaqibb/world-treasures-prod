import type { Metadata } from "next";
import "./globals.css";
import { readFileSync } from "node:fs";
import { join } from "node:path";
export const metadata: Metadata = {
  title: "World Treasures | Imported Snacks & Drinks",
  description: "Imported snacks and drinks at World Treasures.",
  icons: { icon: "/brand/favicon.webp" }
};
const initialTheme = readFileSync(join(process.cwd(),"src/data/initial-theme.js"),"utf8");
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <script dangerouslySetInnerHTML={{__html: initialTheme}} />
  </head><body>{children}</body></html>;
}
