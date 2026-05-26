// app/(shop)/layout.tsx

import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/shop/Header";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { Footer } from "@/components/shop/Footer";
import { CompareBar } from "@/components/shop/CompareBar";
import type { UserProfile } from "@/types";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div style={{ background: "#f8f9fa", minHeight: "100vh" }} className="overflow-x-hidden w-full min-w-0">
      <Header initialUser={user} />
      <main className="overflow-x-hidden min-w-0 w-full">{children}</main>
      <Footer />
      <CartDrawer />
      <CompareBar />
    </div>
  );
}
