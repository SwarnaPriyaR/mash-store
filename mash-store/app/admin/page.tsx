import { AdminPortal } from "@/components/AdminPortal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MASH admin",
  description: "report Inventory and Order management",
};

export default function AdminPage() {
  return <AdminPortal />;
}
