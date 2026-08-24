import { ProductsClient } from "./ProductsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Drops — MASH Store",
  description: "Explore all.",
};

export default function ProductsPage() {
  return <ProductsClient />;
}
