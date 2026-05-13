"use client";

import { useRouter } from "next/navigation";

const OPTIONS = [
  { value: "newest",     label: "Neueste zuerst" },
  { value: "price_asc",  label: "Preis aufsteigend" },
  { value: "price_desc", label: "Preis absteigend" },
  { value: "name_asc",   label: "Name A–Z" },
];

export function ProductSortSelect({ current, params }: { current: string; params: Record<string, string> }) {
  const router = useRouter();
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sp = new URLSearchParams({ ...params, sortBy: e.target.value });
    sp.delete("page");
    router.push(`/products?${sp.toString()}`);
  };
  return (
    <select
      value={current}
      onChange={handleChange}
      className="input text-sm py-1.5 w-44"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
