import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  variantName?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  slug: string;
}

interface CartStore {
  items: CartItem[];
  _hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, qty: number) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,
      setHasHydrated: (val) => set({ _hasHydrated: val }),
      addItem: (item) => {
        set((state) => {
          const key = `${item.productId}::${item.variantId ?? ""}`;
          const existing = state.items.find((i) => `${i.productId}::${i.variantId ?? ""}` === key);
          if (existing) {
            return { items: state.items.map((i) => `${i.productId}::${i.variantId ?? ""}` === key ? { ...i, quantity: i.quantity + item.quantity } : i) };
          }
          return { items: [...state.items, item] };
        });
      },
      removeItem: (productId, variantId) => {
        set((state) => ({ items: state.items.filter((i) => !(i.productId === productId && i.variantId === variantId)) }));
      },
      updateQuantity: (productId, variantId, qty) => {
        if (qty <= 0) { get().removeItem(productId, variantId); return; }
        set((state) => ({ items: state.items.map((i) => i.productId === productId && i.variantId === variantId ? { ...i, quantity: qty } : i) }));
      },
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),
      itemCount: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
    }),
    {
      name: "limelime-cart",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      onRehydrateStorage: () => (state) => { state?.setHasHydrated(true); },
    }
  )
);
