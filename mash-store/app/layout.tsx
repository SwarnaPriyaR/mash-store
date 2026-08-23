import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { SaleProvider } from "@/components/SaleProvider";
import { NavBar } from "@/components/NavBar";

export const metadata: Metadata = {
  title: "MASH Store — Premium Streetwear",
  description:
    "Premium T-shirts crafted for those who refuse to blend in. Heavyweight cotton, bold graphics, zero compromise.",
  keywords: ["MASH", "streetwear", "t-shirts", "premium cotton", "oversized tees"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
