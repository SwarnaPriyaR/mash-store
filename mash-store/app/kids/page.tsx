import { getProductsByCategory, getAllProducts } from "@/lib/db";
import { convertDriveUrl } from "@/lib/helpers";
import { KidsPageClient } from "./KidsPageClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "MASH KIDS — Playful & Premium Kids Collection",
  description: "Vibrant, durable, and comfortable kids streetwear & dresses crafted for little trendsetters.",
};

export default async function KidsPage() {
  const kidsDbProducts = await getProductsByCategory("Kids Dress");
  const allProducts = await getAllProducts();
  
  // Fallback: If DB doesn't have specific "Kids Dress" category records yet, filter by tag or return all with kids tag
  const filteredKids = kidsDbProducts.length > 0
    ? kidsDbProducts
    : allProducts.filter(p => p.category?.toLowerCase().includes("kids") || p.tags.some(t => t.toLowerCase().includes("kids")));

  const displayList = (filteredKids.length > 0 ? filteredKids : allProducts).map(p => ({
    ...p,
    image: convertDriveUrl(p.image),
  }));

  return <KidsPageClient initialProducts={displayList} />;
}
