import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1, size = null, color = null) => {
        set((state) => {
          const id = product.id || product.productId;
          const existingIndex = state.items.findIndex(
            (i) => (i.id === id || i.productId === id) && i.size === size && i.color === color
          );

          if (existingIndex > -1) {
            const updated = [...state.items];
            updated[existingIndex].quantity += quantity;
            return { items: updated };
          }

          let imgUrl = null;
          if (Array.isArray(product.images) && product.images.length > 0) {
            const primary = product.images.find((img) => img.isPrimary) || product.images[0];
            imgUrl = typeof primary === 'string' ? primary : primary?.url;
          } else if (product.image || product.image_url) {
            imgUrl = product.image_url || product.image;
          }

          const newItem = {
            id,
            productId: id,
            name: product.name,
            slug: product.slug,
            price: Number(product.price),
            image: imgUrl,
            image_url: imgUrl,
            size,
            color,
            quantity: Math.max(1, quantity),
          };

          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (productId, size = null, color = null) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !((i.id === productId || i.productId === productId) && i.size === size && i.color === color)
          ),
        }));
      },

      updateQuantity: (productId, quantity, size = null, color = null) => {
        // Handle argument order (if quantity is passed first or last)
        let qty = typeof quantity === 'number' ? quantity : 1;
        let s = size;
        let c = color;

        // If called as (productId, size, color, quantity)
        if (typeof color === 'number') {
          qty = color;
          c = size;
          s = quantity;
        }

        if (qty < 1) {
          get().removeItem(productId, s, c);
          return;
        }

        set((state) => ({
          items: state.items.map((i) =>
            (i.id === productId || i.productId === productId) && i.size === s && i.color === c
              ? { ...i, quantity: qty }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getSubtotal: () => {
        const items = get().items || [];
        return items.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);
      },

      getItemCount: () => {
        const items = get().items || [];
        return items.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0);
      },

      isInCart: (productId) => {
        const items = get().items || [];
        return items.some((i) => i.id === productId || i.productId === productId);
      },
    }),
    {
      name: 'teya-cart',
    }
  )
);

export default useCartStore;
