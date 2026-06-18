import { create } from "zustand";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:5000";
axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  login: async (userCred) => {
    try {
      set({ loading: true, error: null });

      const res = await axios.post(
        "/user-api/login",
        userCred
      );

      set({
        currentUser: res.data.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      });

      return true;
    } catch (err) {
      set({
        currentUser: null,
        isAuthenticated: false,
        loading: false,
        error: err.response?.data?.message || "Login failed",
      });

      return false;
    }
  },

  register: async (userData) => {
    try {
      set({ loading: true, error: null });

      const res = await axios.post(
        "/user-api/register",
        userData
      );

      set({
        loading: false,
        error: null,
      });

      return res.data;
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || "Registration failed",
      });

      return null;
    }
  },

  logout: async () => {
    try {
      await axios.get("/user-api/logout");

      set({
        currentUser: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Logout failed",
      });
    }
  },

  checkAuth: async () => {
    try {
      set({ loading: true });

      const res = await axios.get("/user-api/check-auth");

      set({
        currentUser: res.data.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch {
      try {
        await axios.post("/user-api/refresh");

        const res = await axios.get("/user-api/check-auth");

        set({
          currentUser: res.data.payload,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
      } catch {
        set({
          currentUser: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });
      }
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await axios.put(
        "/user-api/profile",
        data
      );

      set({
        currentUser: res.data.payload,
      });

      return true;
    } catch {
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));