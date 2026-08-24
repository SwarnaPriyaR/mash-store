import { ProductsClient } from "./ProductsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Drops — MASH Store",
  description: "Explore all signature streetwear drops.",
};

export default function ProductsPage() {
  return <ProductsClient />;
}
