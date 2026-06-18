import { create } from "zustand";
import api from "../utils/axios";

// Mirrors the pattern used in authStore.js
// Talks to cartAPI.js on the backend (cart items are keyed by userId)
export const useCartStore = create((set) => ({
  items: [],
  loading: false,

  fetchCart: async (userId) => {
    set({ loading: true });
    try {
      const res = await api.get(`/cart/${userId}`);
      set({ items: res.data.items || res.data || [], loading: false });
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      set({ loading: false });
    }
  },

  addToCart: async (userId, product, quantity = 1) => {
    try {
      const res = await api.post(`/cart/${userId}`, {
        productId: product._id,
        quantity,
      });
      set({ items: res.data.items || res.data });
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  },

  updateQuantity: async (userId, productId, quantity) => {
    try {
      const res = await api.put(`/cart/${userId}`, { productId, quantity });
      set({ items: res.data.items || res.data });
    } catch (err) {
      console.error("Failed to update cart quantity:", err);
    }
  },

  removeFromCart: async (userId, productId) => {
    try {
      const res = await api.delete(`/cart/${userId}/${productId}`);
      set({ items: res.data.items || res.data });
    } catch (err) {
      console.error("Failed to remove item from cart:", err);
    }
  },

  clearCart: () => set({ items: [] }),
}));