// store/compare.ts
// Product comparison store — Zustand with localStorage persistence.
// Stores up to 4 products. No login required.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product } from "@/types";

const MAX_COMPARE = 4;

interface CompareStore {
  items: Product[];
  add: (product: Product) => boolean; // returns false if max reached
  remove: (productId: string) => void;
  clear: () => void;
  isSelected: (productId: string) => boolean;
  isFull: () => boolean;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      items: [],

      add: (product) => {
        const state = get();
        if (state.items.length >= MAX_COMPARE) return false;
        if (state.items.some((p) => p.id === product.id)) return true;
        set({ items: [...state.items, product] });
        return true;
      },

      remove: (productId) => {
        set((state) => ({
          items: state.items.filter((p) => p.id !== productId),
        }));
      },

      clear: () => set({ items: [] }),

      isSelected: (productId) => get().items.some((p) => p.id === productId),

      isFull: () => get().items.length >= MAX_COMPARE,
    }),
    {
      name: "it-shop-compare",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
