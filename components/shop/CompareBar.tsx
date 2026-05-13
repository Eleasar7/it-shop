"use client";

// components/shop/CompareBar.tsx — IT-shop style

import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, GitCompare, Package, ArrowRight } from "lucide-react";
import { useCompareStore } from "@/store/compare";

export function CompareBar() {
  const { items, remove, clear } = useCompareStore();
  const router = useRouter();
  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#dadce0] shadow-lg animate-slide-up">
      <div className="section py-2.5 flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <GitCompare size={15} className="text-[#1a56db]" />
          <span className="text-sm font-bold text-gray-800">
            Vergleich <span className="text-[#1a56db]">({items.length}/4)</span>
          </span>
        </div>

        <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {items.map((product) => (
            <div key={product.id}
              className="flex items-center gap-2 flex-shrink-0 bg-[#f8f9fa] border border-[#dadce0] rounded-md px-2.5 py-1.5"
            >
              <div className="w-7 h-7 bg-white border border-[#e8eaed] rounded overflow-hidden relative flex-shrink-0">
                {product.images[0] ? (
                  <Image src={product.images[0]} alt={product.name} fill className="object-contain p-0.5" sizes="28px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={12} className="text-gray-400" />
                  </div>
                )}
              </div>
              <span className="text-xs font-medium text-gray-700 max-w-[100px] truncate">{product.name}</span>
              <button onClick={() => remove(product.id)} className="text-gray-400 hover:text-red-500 transition-colors ml-1">
                <X size={12} />
              </button>
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: 4 - items.length }).map((_, i) => (
            <div key={`empty-${i}`}
              className="flex-shrink-0 w-24 h-9 border border-dashed border-[#dadce0] rounded-md bg-[#f8f9fa]"
            />
          ))}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={clear} className="text-xs text-gray-500 hover:text-gray-700 hidden sm:block">
            Leeren
          </button>
          <button
            onClick={() => router.push("/compare")}
            disabled={items.length < 2}
            className="btn-primary text-sm py-2 px-4 disabled:opacity-40"
          >
            Vergleichen <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
