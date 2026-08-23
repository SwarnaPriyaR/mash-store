import { ProductsClient } from "./ProductsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customize Tshirts — MASH Store",
  description: "Customize Tshirts and explore signature streetwear drops.",
};

export default function ProductsPage() {
  return <ProductsClient />;
}
