// app/(shop)/layout.tsx

import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/shop/Header";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { Footer } from "@/components/shop/Footer";
import { CompareBar } from "@/components/shop/CompareBar";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div style={{ background: "#f8f9fa", minHeight: "100vh" }}>
      <Header />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
      <CompareBar />
    </div>
  );
}
