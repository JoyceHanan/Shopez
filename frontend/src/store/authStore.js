import { create } from "zustand";
import axios from "axios";
export const useAuthStore = create((set) => ({
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  // LOGIN
  login: async (userCred) => {
    try {
      set({
        loading: true,
        error: null,
      });
      const res=await axios.post(`/user-api/login`,userCred,{withCredentials: true});
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
        error:
          err.response?.data?.message ||
          "Login failed",
      });
      return false;
    }
  },
  // REGISTER
  register:async(userData)=>{
    try {
      set({
        loading: true,
        error: null,
      });
      const res=await axios.post(`/user-api/register`,userData,{withCredentials: true});
      set({
        loading: false,
        error: null,
      });
      return res.data;
    } catch (err) {
      set({
        loading: false,
        error:
          err.response?.data?.message ||
          "Registration failed",
      });
    }
  },
  // LOGOUT
  logout:async()=>{
    try {
      await axios.get(`/user-api/logout`,{withCredentials: true});
      set({
        currentUser: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    } catch (err) {
      set({
        error:
          err.response?.data?.message ||
          "Logout failed",
      });
    }
  },
  // CHECK AUTH
  checkAuth: async()=>{
    try {
      set({
        loading: true,
      });
      const res=await axios.get(`/user-api/check-auth`,{withCredentials: true,}
      );
      set({
        currentUser: res.data.payload || null,
        isAuthenticated: true,
        loading: false,
        error: null,
      });

    } catch (err) {
      try {
        //refresh token
        await axios.post(`/user-api/refresh`,{},{withCredentials: true});
        //retry check-auth
        const res=await axios.get(`/user-api/check-auth`,{withCredentials: true});
        set({
          currentUser: res.data.payload || null,
          isAuthenticated: true,
          loading: false,
          error: null,
        });

      } catch (refreshErr) {
        set({
          currentUser: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });
      }
    }
  },
  // CLEAR ERROR
  clearError:()=>{
    set({
      error: null,
    });
  },
}));