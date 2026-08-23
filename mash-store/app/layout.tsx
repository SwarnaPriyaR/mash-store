import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { SaleProvider } from "@/components/SaleProvider";
import { NavBar } from "@/components/NavBar";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MASH Store — Wear Your Attitude",
    template: "MASH Store | %s",
  },
  description:
    "Premium T-shirts crafted for those who refuse to blend in",
  keywords: ["MASH", "streetwear", "t-shirts", "premium cotton", "oversized tees"],
  icons: {
    icon: "/asset/mashLogo.png",
    apple: "/asset/mashLogo.png",
  },
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
