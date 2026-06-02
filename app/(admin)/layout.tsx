// app/(admin)/layout.tsx
// Security: requireAdmin() is NOT wrapped in try/catch — NEXT_REDIRECT must propagate.

import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/Sidebar";
import { AdminMobileHeader } from "@/components/admin/MobileHeader";
import { ToastProvider } from "@/components/admin/Toast";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // requireAdmin() either returns a UserProfile or calls redirect() internally.
  // Do NOT wrap in try/catch — that would swallow NEXT_REDIRECT.
  const user = await requireAdmin();

  return (
    <ToastProvider>
      <div className="admin-layout flex min-h-screen bg-slate-950">
        <AdminSidebar user={user} />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminMobileHeader user={user} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            <div className="max-w-6xl mx-auto w-full">{children}</div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
