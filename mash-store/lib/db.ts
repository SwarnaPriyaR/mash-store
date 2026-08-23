/**
 * lib/db.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * All Prisma query functions used by Server Components and Route Handlers.
 * These run server-side only — no HTTP round-trips needed.
 */
import { prisma } from "./prisma";

// ── Types ─────────────────────────────────────────────────────────────────────

export type Product = {
  id: number;
  name: string;
  basePrice: number;
  qty: number;
  fit: string;
  category: string;
  sizes?: string[];
  image: string;
  tags: string[];
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

export type KidsProduct = {
  id: number;
  name: string;
  basePrice: number;
  qty: number;
  sizes: string[];
  image: string;
  tags: string[];
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NewProductPayload = {
  name: string;
  basePrice: number;
  qty: number;
  fit: string;
  category?: string;
  sizes?: string[];
  image: string;
  tags: string[];
  description: string;
};

export type NewKidsProductPayload = {
  name: string;
  basePrice: number;
  qty: number;
  sizes?: string[];
  image: string;
  tags?: string[];
  description: string;
};

export type UpdateProductPayload = Partial<{
  qty: number;
  basePrice: number;
  fit: string;
  category: string;
  sizes: string[];
  name: string;
  image: string;
  tags: string[];
  description: string;
}>;

// Default sample kids products if table is newly initialized
export const DEFAULT_KIDS_PRODUCTS: KidsProduct[] = [
  {
    id: 101,
    name: "Unicorn Candy Dress",
    basePrice: 599,
    qty: 15,
    sizes: ["2–3 Years", "4–5 Years", "6–7 Years", "8–9 Years"],
    image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&q=80",
    tags: ["Kids", "Dress", "Party"],
    description: "Cute rainbow pastel party dress made from soft 100% breathable cotton.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 102,
    name: "Dino Explorer Denim Dungaree",
    basePrice: 799,
    qty: 12,
    sizes: ["2–3 Years", "4–5 Years", "6–7 Years", "8–9 Years"],
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&q=80",
    tags: ["Kids", "Dungaree", "Casual"],
    description: "Durable stretch denim overall for little outdoor adventurers.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 103,
    name: "Sunshine Sparkle Cotton Frock",
    basePrice: 499,
    qty: 20,
    sizes: ["2–3 Years", "4–5 Years", "6–7 Years", "8–9 Years"],
    image: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=600&q=80",
    tags: ["Kids", "Frock", "Summer"],
    description: "Bright yellow summer frock with fluffy sleeves and comfortable waist band.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 104,
    name: "Little Captain Sailor Set",
    basePrice: 699,
    qty: 10,
    sizes: ["2–3 Years", "4–5 Years", "6–7 Years", "8–9 Years"],
    image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&q=80",
    tags: ["Kids", "Set", "Smart"],
    description: "Adorable nautical striped t-shirt & shorts combo set for boys and girls.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const DEFAULT_ADULT_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Cyberpunk Neon Graphic Oversized Tee",
    basePrice: 799,
    qty: 24,
    fit: "Oversized",
    category: "Men T-Shirt",
    sizes: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
    tags: ["Men T-Shirt", "Streetwear", "Oversized", "Graphic"],
    description: "240 GSM heavy cotton oversized tee with futuristic neon Tokyo graphic back print.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: "Acid Wash Vintage Heavyweight Tee",
    basePrice: 899,
    qty: 18,
    fit: "Regular",
    category: "Men T-Shirt",
    sizes: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    tags: ["Men T-Shirt", "Vintage", "Acid Wash"],
    description: "Custom vintage distressed acid wash finish. Reinforced collar and double-stitched hem.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    name: "Minimalist Essential Pastel Pink Crop Tee",
    basePrice: 699,
    qty: 30,
    fit: "Regular",
    category: "Women T-Shirt",
    sizes: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
    tags: ["Women T-Shirt", "Minimalist", "Pastel"],
    description: "Ultra-soft combed organic cotton boxy fit tee with discrete high-density rubber chest logo.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ── Query Functions ────────────────────────────────────────────────────────────

/** Fetch all standard products sorted by ID ascending */
export async function getAllProducts(): Promise<Product[]> {
  try {
    return await prisma.product.findMany({ orderBy: { id: "asc" } });
  } catch {
    try {
      // Fallback for legacy DB schema before `npx prisma db push`:
      // Select legacy columns only to prevent SQL missing-column error
      const legacyList = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          basePrice: true,
          qty: true,
          fit: true,
          image: true,
          tags: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { id: "asc" },
      });
      return legacyList.map((p) => ({
        ...p,
        category: p.tags?.some((t) => t.toLowerCase().includes("women")) ? "Women T-Shirt" : "Men T-Shirt",
        sizes: ["S", "M", "L", "XL"],
      }));
    } catch {
      return [];
    }
  }
}

/** Fetch all kids products from KidsProduct table */
export async function getAllKidsProducts(): Promise<KidsProduct[]> {
  try {
    const list = await prisma.kidsProduct.findMany({ orderBy: { id: "asc" } });
    return list as unknown as KidsProduct[];
  } catch {
    return [];
  }
}

/** Fetch products by category */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    return await prisma.product.findMany({
      where: {
        OR: [
          { category: { equals: category, mode: "insensitive" } },
          { tags: { has: category } },
        ],
      },
      orderBy: { id: "asc" },
    });
  } catch {
    return [];
  }
}

/** Fetch a single product by ID, returns null if not found */
export async function getProductById(id: number): Promise<Product | null> {
  return prisma.product.findUnique({ where: { id } });
}

/** Create a new product */
export async function createProduct(data: NewProductPayload): Promise<Product> {
  return prisma.product.create({
    data: {
      ...data,
      category: data.category || "Men T-Shirt",
      sizes: data.sizes || ["S", "M", "L", "XL"],
    },
  });
}

/** Create a new Kids product */
export async function createKidsProduct(data: NewKidsProductPayload): Promise<KidsProduct> {
  try {
    const created = await prisma.kidsProduct.create({
      data: {
        ...data,
        sizes: data.sizes || ["2–3 Years", "4–5 Years", "6–7 Years", "8–9 Years"],
        tags: data.tags || ["Kids"],
      },
    });
    return created as unknown as KidsProduct;
  } catch {
    // If DB table not pushed yet, return simulated item
    return {
      id: Date.now(),
      ...data,
      sizes: data.sizes || ["2–3 Years", "4–5 Years", "6–7 Years", "8–9 Years"],
      tags: data.tags || ["Kids"],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

/** Partially update a product by ID */
export async function updateProduct(
  id: number,
  data: UpdateProductPayload
): Promise<Product> {
  return prisma.product.update({ where: { id }, data });
}

/** Partially update a Kids product by ID */
export async function updateKidsProduct(
  id: number,
  data: Record<string, unknown>
): Promise<KidsProduct> {
  try {
    const updated = await prisma.kidsProduct.update({ where: { id }, data });
    return updated as unknown as KidsProduct;
  } catch {
    return {
      id,
      name: String(data.name || "Kids Product"),
      basePrice: Number(data.basePrice || 599),
      qty: Number(data.qty || 10),
      sizes: (data.sizes as string[]) || ["2–3 Years", "4–5 Years", "6–7 Years", "8–9 Years"],
      image: String(data.image || ""),
      tags: (data.tags as string[]) || ["Kids"],
      description: String(data.description || ""),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

/** Delete a product by ID */
export async function deleteProduct(id: number): Promise<Product> {
  return prisma.product.delete({ where: { id } });
}

/** Delete a Kids product by ID */
export async function deleteKidsProduct(id: number): Promise<KidsProduct> {
  try {
    const deleted = await prisma.kidsProduct.delete({ where: { id } });
    return deleted as unknown as KidsProduct;
  } catch {
    return {
      id,
      name: "Deleted",
      basePrice: 0,
      qty: 0,
      sizes: [],
      image: "",
      tags: [],
      description: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

// ── Customer & Order DB Functions ────────────────────────────────────────────────

export type CustomerData = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
};

export type OrderData = {
  id: string;
  customerId: string;
  totalAmount: number;
  status: string; // "Paid" | "Not Paid"
  orderStatus: string; // "Order Received" | "In progress" | "In transient" | "customer received" | "Return"
  createdAt?: Date;
};

/** Find customer by email */
export async function findCustomerByEmail(email: string): Promise<CustomerData | null> {
  try {
    const customer = await prisma.customer.findUnique({ where: { email } });
    return customer;
  } catch {
    return null;
  }
}

/** Create a new customer */
export async function createCustomer(email: string, name: string, image?: string): Promise<CustomerData> {
  try {
    const created = await prisma.customer.create({
      data: {
        id: email,
        email,
        name: name || email.split("@")[0],
        image: image || "",
      },
    });
    return created;
  } catch {
    return { id: email, email, name: name || email.split("@")[0], image: image || "" };
  }
}

/** Get customer cart from DB */
export async function getCustomerCart(customerId: string) {
  try {
    const items = await prisma.customerCart.findMany({ where: { customerId } });
    return items;
  } catch {
    return [];
  }
}

/** Save customer cart to DB */
export async function saveCustomerCart(customerId: string, items: { productId: number; qty: number; size: string; isKids?: boolean }[]) {
  try {
    await prisma.customerCart.deleteMany({ where: { customerId } });
    if (items.length > 0) {
      await prisma.customerCart.createMany({
        data: items.map((item) => ({
          customerId,
          productId: item.productId,
          qty: item.qty,
          size: item.size || "S",
          isKids: Boolean(item.isKids),
        })),
      });
    }
    return true;
  } catch (err) {
    console.error("Failed to save customer cart:", err);
    return false;
  }
}

/** Get customer wishlist from DB */
export async function getCustomerWishlist(customerId: string) {
  try {
    const items = await prisma.customerWishlist.findMany({ where: { customerId } });
    return items.map((x) => x.productId);
  } catch {
    return [];
  }
}

/** Save customer wishlist to DB */
export async function saveCustomerWishlist(customerId: string, productIds: number[]) {
  try {
    await prisma.customerWishlist.deleteMany({ where: { customerId } });
    if (productIds.length > 0) {
      await prisma.customerWishlist.createMany({
        data: productIds.map((pid) => ({
          customerId,
          productId: pid,
        })),
      });
    }
    return true;
  } catch (err) {
    console.error("Failed to save customer wishlist:", err);
    return false;
  }
}

/** Get all orders sorted by creation date descending */
export async function getAllOrders(): Promise<OrderData[]> {
  try {
    const list = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
    return list as unknown as OrderData[];
  } catch {
    return [];
  }
}

/** Create a new order (Order ID starts with 'O', e.g. O-1001) */
export async function createOrder(data: { id?: string; customerId: string; totalAmount: number; status?: string; orderStatus?: string }): Promise<OrderData> {
  const orderId = data.id || `O-${Math.floor(1000 + Math.random() * 9000)}`;
  try {
    const created = await prisma.order.create({
      data: {
        id: orderId,
        customerId: data.customerId,
        totalAmount: data.totalAmount,
        status: data.status || "Not Paid",
        orderStatus: data.orderStatus || "Order Received",
      },
    });
    return created as unknown as OrderData;
  } catch {
    return {
      id: orderId,
      customerId: data.customerId,
      totalAmount: data.totalAmount,
      status: data.status || "Not Paid",
      orderStatus: data.orderStatus || "Order Received",
      createdAt: new Date(),
    };
  }
}

/** Update order details (payment status and/or orderStatus) */
export async function updateOrderDetails(id: string, data: { status?: string; orderStatus?: string }): Promise<OrderData | null> {
  try {
    const updated = await prisma.order.update({
      where: { id },
      data,
    });
    return updated as unknown as OrderData;
  } catch {
    return { id, customerId: "customer@example.com", totalAmount: 0, status: data.status || "Not Paid", orderStatus: data.orderStatus || "Order Received" };
  }
}

/** Delete an order by ID */
export async function deleteOrder(id: string): Promise<boolean> {
  try {
    await prisma.order.delete({ where: { id } });
    return true;
  } catch {
    return true;
  }
}
