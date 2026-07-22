import { create } from 'zustand';
import { Product } from '@workspace/api-client-react';

export interface CartItem {
  product: Product;
  weightKg: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, weightKg: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, weightKg: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: JSON.parse(localStorage.getItem('cart_items') || '[]'),
  addItem: (product, weightKg) => {
    set((state) => {
      const existing = state.items.find((item) => item.product.id === product.id);
      let newItems;
      if (existing) {
        newItems = state.items.map((item) =>
          item.product.id === product.id
            ? { ...item, weightKg: item.weightKg + weightKg }
            : item
        );
      } else {
        newItems = [...state.items, { product, weightKg }];
      }
      localStorage.setItem('cart_items', JSON.stringify(newItems));
      return { items: newItems };
    });
  },
  removeItem: (productId) => {
    set((state) => {
      const newItems = state.items.filter((item) => item.product.id !== productId);
      localStorage.setItem('cart_items', JSON.stringify(newItems));
      return { items: newItems };
    });
  },
  updateQuantity: (productId, weightKg) => {
    set((state) => {
      const newItems = state.items.map((item) =>
        item.product.id === productId ? { ...item, weightKg } : item
      );
      localStorage.setItem('cart_items', JSON.stringify(newItems));
      return { items: newItems };
    });
  },
  clearCart: () => {
    localStorage.removeItem('cart_items');
    set({ items: [] });
  },
  getTotal: () => {
    return get().items.reduce((total, item) => total + item.product.pricePerKg * item.weightKg, 0);
  },
}));
