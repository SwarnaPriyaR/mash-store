import { notFound } from "next/navigation";
import { getProductById, getAllProducts } from "@/lib/db";
import { convertDriveUrl } from "@/lib/helpers";
import { ProductDetailClient } from "./ProductDetailClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(parseInt(id));
  if (!product) return { title: "Product Not Found — MASH Store" };
  return {
    title: `${product.name}`,
    description: `${product.name} — ${product.fit} fit premium`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const targetId = parseInt(id);
  const product = await getProductById(targetId);

  if (!product) notFound();

  const allProducts = await getAllProducts();

  // Filter products of same category or fit excluding current product
  const related = allProducts
    .filter((p) => p.id !== targetId && (p.category === product.category || p.fit === product.fit))
    .map((p) => ({ ...p, image: convertDriveUrl(p.image) }));

  const normalizedProduct = { ...product, image: convertDriveUrl(product.image), reviews: [] };

  return <ProductDetailClient product={normalizedProduct} relatedProducts={related} />;
}
