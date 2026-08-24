import type { Metadata } from "next";
import { OrdersClient } from "./OrdersClient";

export const metadata: Metadata = {
  title: "My Orders — MASH Store",
  description: "View your order history, delivery status, and order item details.",
};

export default function OrdersPage() {
  return <OrdersClient />;
}
