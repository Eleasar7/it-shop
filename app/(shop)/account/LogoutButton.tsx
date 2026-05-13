"use client";

// app/(shop)/account/LogoutButton.tsx

import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-950/20 border border-slate-700/40 hover:border-red-900/40 disabled:opacity-50"
      title="Abmelden"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
      <span className="hidden sm:inline">Abmelden</span>
    </button>
  );
}
