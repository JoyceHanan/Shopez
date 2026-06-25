import { create } from 'zustand'
import axios from 'axios'

export const useCartStore = create((set) => ({
  items: [],
  subtotal: 0,
  totalItems: 0,
  loading: false,
  error: null,

  fetchCart: async () => {
    try {
      set({ loading: true, error: null })
      const res = await axios.get('/cart-api/')
      set({ items: res.data.payload, subtotal: res.data.subtotal, totalItems: res.data.totalItems, loading: false })
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || 'Failed to fetch cart' })
    }
  },

  addToCart: async ({ productId, size, quantity = 1 }) => {
    try {
      const res = await axios.post('/cart-api/add', { productId, size, quantity })
      return { success: true, data: res.data }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to add to cart' }
    }
  },

  updateQuantity: async (itemId, quantity) => {
    try {
      const res = await axios.put(`/cart-api/${itemId}`, { quantity })
      set(state => ({
        items: state.items.map(i => i._id === itemId ? res.data.payload : i)
      }))
      return true
    } catch {
      return false
    }
  },

  removeFromCart: async (itemId) => {
    try {
      await axios.delete(`/cart-api/${itemId}`)
      set(state => ({ items: state.items.filter(i => i._id !== itemId) }))
      return true
    } catch {
      return false
    }
  },

  clearCart: async () => {
    try {
      await axios.delete('/cart-api/')
      set({ items: [], subtotal: 0, totalItems: 0 })
      return true
    } catch {
      return false
    }
  },

  clearError: () => set({ error: null }),
}))
