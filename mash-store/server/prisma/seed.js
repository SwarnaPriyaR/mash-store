/**
 * Seed script — populates Neon PostgreSQL with the 6 initial MASH Store products.
 * Run once after `npx prisma db push`:
 *   node prisma/seed.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const INITIAL_PRODUCTS = [
  {
    name: "Phantom Wave",
    basePrice: 849,
    qty: 20,
    fit: "Regular",
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
    tags: ["Graphic", "Unisex"],
    description:
      "Cut from 100% ring-spun cotton, the Phantom Wave tee features a hand-drawn ocean motif screen-printed with water-based inks. Relaxed fit. Double-stitched hem. Available in S–3XL.",
  },
  {
    name: "Urban Cipher",
    basePrice: 999,
    qty: 15,
    fit: "Oversized",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    tags: ["Streetwear", "Oversized"],
    description:
      "Bold typographic print on a heavyweight 220 GSM cotton canvas. Dropped shoulders, box fit. Garment-washed for a lived-in softness straight out of the bag.",
  },
  {
    name: "Minimal Arc",
    basePrice: 699,
    qty: 4,
    fit: "Regular",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
    tags: ["Minimal", "Essential"],
    description:
      "The anti-logo tee. Clean lines, subtle tonal arc embroidery at the chest. Slim fit, mid-weight 180 GSM. Pairs with everything, competes with nothing.",
  },
  {
    name: "Neon Bloom",
    basePrice: 1099,
    qty: 12,
    fit: "Oversized",
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80",
    tags: ["Graphic", "Bold"],
    description:
      "Reactive-dye florals explode across a jet-black base. Limited drop. 200 GSM combed cotton. Each piece varies slightly—no two are identical.",
  },
  {
    name: "Desert Drift",
    basePrice: 799,
    qty: 3,
    fit: "Regular",
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80",
    tags: ["Vintage", "Relaxed"],
    description:
      "Sun-bleached sand tones meet vintage athletic typography. Enzyme-washed for softness. Relaxed fit with ribbed crewneck and double-stitched sleeves.",
  },
  {
    name: "Grid Punk",
    basePrice: 949,
    qty: 8,
    fit: "Oversized",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4f6bfb?w=600&q=80",
    tags: ["Streetwear", "Graphic"],
    description:
      "Industrial grid print with distressed edges. Screen-printed on 220 GSM cotton. Boxy cut, raw-edged sleeve hems. For those who wear their attitude.",
  },
];

async function main() {
  console.log("🌱 Starting database seed...");

  // Check if products already exist to avoid duplicate seeding
  const existing = await prisma.product.count();
  if (existing > 0) {
    console.log(`⚠️  Database already has ${existing} product(s). Skipping seed to avoid duplicates.`);
    console.log("   To re-seed, run: npx prisma db push --force-reset && node prisma/seed.js");
    return;
  }

  for (const product of INITIAL_PRODUCTS) {
    const created = await prisma.product.create({ data: product });
    console.log(`  ✅ Created: [${created.id}] ${created.name} — ₹${created.basePrice} | Qty: ${created.qty}`);
  }

  console.log(`\n🎉 Seed complete! ${INITIAL_PRODUCTS.length} products inserted into Neon PostgreSQL.`);
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
