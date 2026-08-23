import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { SaleProvider } from "@/components/SaleProvider";
import { NavBar } from "@/components/NavBar";

// Load fonts via next/font — avoids layout shift and works correctly with Next.js
const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MASH Store",
  description:
    "Premium T-shirts crafted for those who refuse to blend in.",
  keywords: ["MASH", "streetwear", "t-shirts", "premium cotton", "oversized tees"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${dmSans.variable}`}>
      <body>
        <SaleProvider>
          <CartProvider>
            <NavBar />
            {children}
          </CartProvider>
        </SaleProvider>
      </body>
    </html>
  );
}
