// app/(shop)/account/profile/page.tsx

import { requireAuth } from "@/lib/auth";
import Link from "next/link";
import { User, Mail, Phone, Building2, ChevronLeft } from "lucide-react";
import { ProfileForm } from "./ProfileForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profil | Envetra" };

export default async function ProfilePage() {
  const user = await requireAuth();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/account"
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors mb-2 inline-flex items-center gap-1"
        >
          <ChevronLeft size={13} /> Zurück zum Konto
        </Link>
        <h1 className="text-2xl font-bold text-slate-100">Profil bearbeiten</h1>
        <p className="text-slate-500 text-sm mt-1">Verwalte deine persönlichen Daten</p>
      </div>

      {/* Current info */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
          <User size={14} className="text-indigo-400" />
          Aktuelle Daten
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: User,      label: "Name",         value: user.name    ?? "–" },
            { icon: Mail,      label: "E-Mail",        value: user.email },
            { icon: Phone,     label: "Telefon",       value: user.phone   ?? "–" },
            { icon: Building2, label: "Unternehmen",   value: user.company ?? "–" },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/30"
            >
              <Icon size={14} className="text-slate-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm text-slate-200 truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit form – userId is NOT passed, the API route reads it from the session */}
      <ProfileForm
        initialData={{
          name:    user.name    ?? "",
          phone:   user.phone   ?? "",
          company: user.company ?? "",
        }}
      />

      {/* Password */}
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-slate-200 text-sm">Passwort ändern</h2>
        <p className="text-slate-400 text-sm">
          Nutze die Passwort-vergessen-Funktion, um dein Passwort sicher zu
          ändern.
        </p>
        <Link href="/forgot-password" className="btn-secondary text-sm inline-flex">
          Passwort-Reset anfordern
        </Link>
      </div>
    </div>
  );
}
