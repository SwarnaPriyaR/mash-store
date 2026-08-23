// app/product/[id]/page.tsx — Product Detail (Server Component)
// Fetches product directly from Prisma — no HTTP request needed.

import { notFound } from "next/navigation";
import { getProductById } from "@/lib/db";
import { convertDriveUrl } from "@/lib/helpers";
import { ProductDetailClient } from "./ProductDetailClient";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(parseInt(id));
  if (!product) return { title: "Product Not Found — MASH Store" };
  return {
    title: `${product.name} — MASH Store`,
    description: product.description || `${product.name} — ${product.fit} fit premium streetwear tee`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductById(parseInt(id));

  if (!product) notFound();

  // Normalize image URL server-side
  const normalizedProduct = { ...product, image: convertDriveUrl(product.image), reviews: [] };

  return <ProductDetailClient product={normalizedProduct} />;
}
