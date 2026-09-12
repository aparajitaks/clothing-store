import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [], // array of product objects

      toggle: (product) => {
        const exists = get().items.find((p) => p.id === product.id);
        if (exists) {
          set((state) => ({ items: state.items.filter((p) => p.id !== product.id) }));
          return 'removed';
        } else {
          set((state) => ({ items: [product, ...state.items] }));
          return 'added';
        }
      },

      add: (product) => {
        const exists = get().items.find((p) => p.id === product.id);
        if (!exists) {
          set((state) => ({ items: [product, ...state.items] }));
        }
      },

      remove: (productId) => {
        set((state) => ({ items: state.items.filter((p) => p.id !== productId) }));
      },

      isInWishlist: (productId) => get().items.some((p) => p.id === productId),

      clearWishlist: () => set({ items: [] }),

      count: () => get().items.length,
    }),
    { name: 'teya-wishlist' }
  )
);

export default useWishlistStore;
