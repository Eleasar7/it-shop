// store/cart.ts
// Warenkorb-State mit Zustand
// Hinweis: Preise werden beim Checkout IMMER serverseitig validiert!

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, Product } from "@/types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  // Aktionen
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Berechnete Werte
  getItemCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.productId === product.id
          );

          if (existingIndex >= 0) {
            // Menge erhöhen (max: Lagerbestand)
            const newItems = [...state.items];
            const existing = newItems[existingIndex];
            const newQuantity = Math.min(
              existing.quantity + quantity,
              product.stock
            );
            newItems[existingIndex] = { ...existing, quantity: newQuantity };
            return { items: newItems, isOpen: true };
          }

          // Neues Item hinzufügen
          const newItem: CartItem = {
            productId: product.id,
            quantity: Math.min(quantity, product.stock),
            product: {
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              images: product.images,
              stock: product.stock,
              brand: product.brand,
            },
          };

          return { items: [...state.items, newItem], isOpen: true };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: Math.min(quantity, item.product.stock) }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        ),
    }),
    {
      name: "it-shop-cart",
      storage: createJSONStorage(() => localStorage),
      // Nur Items persistieren, nicht UI-State
      partialize: (state) => ({ items: state.items }),
    }
  )
);
