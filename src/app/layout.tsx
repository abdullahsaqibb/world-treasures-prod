import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "World Treasures | Imported Snacks & Drinks", description: "Discover imported snacks, sweets and drinks at World Treasures." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
