import type { Metadata } from "next";
import { Bebas_Neue, Montserrat, Space_Mono } from "next/font/google";
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

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
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
    <html lang="en" className={`${bebasNeue.variable} ${montserrat.variable} ${spaceMono.variable}`}>
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
