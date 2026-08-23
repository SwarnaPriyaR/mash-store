import { getAllKidsProducts } from "@/lib/db";
import { convertDriveUrl } from "@/lib/helpers";
import { KidsPageClient } from "./KidsPageClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "MASH KIDS — Cute & Playful Kids Fashion",
  description: "Adorable, soft, and vibrant kids clothing & dresses crafted for ages 2–9 Years.",
};

export default async function KidsPage() {
  const kidsProducts = await getAllKidsProducts();

  const displayList = kidsProducts.map((p) => ({
    ...p,
    image: convertDriveUrl(p.image),
  }));

  return <KidsPageClient initialProducts={displayList} />;
}
