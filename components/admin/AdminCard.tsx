// components/admin/AdminCard.tsx
// Reusable card container with optional header for admin pages.

import { type ReactNode } from "react";

interface AdminCardProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function AdminCard({ title, subtitle, action, children, className = "", noPadding }: AdminCardProps) {
  return (
    <div className={`card ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
          <div>
            {title && <h2 className="font-semibold text-slate-200 text-sm">{title}</h2>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPadding ? "" : (title || action) ? "" : "p-5"}>
        {children}
      </div>
    </div>
  );
}
