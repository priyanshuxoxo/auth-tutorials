import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,
  message: null,

  signup: async (email, password, name) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(`${API_URL}/signup`, {
        email,
        password,
        name,
      });
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      toast.success("Signup Successful!");
    } catch (error) {
      set({
        error: error.response?.data?.message || "Signup failed",
        isLoading: false,
      });
      throw error;
    }
  },

  verifyEmail: async (code) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(`${API_URL}/verify-email`, { code });
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Email verification failed",
        isLoading: false,
      });
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/check-auth`);
      set({
        user: response.data.user,
        isAuthenticated: true,
        isCheckingAuth: false,
        error: null,
      });
    } catch {
      set({
        error: null,
        isCheckingAuth: false,
        isAuthenticated: false,
      });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      toast.success("Login Successful!");
    } catch (error) {
      set({
        error: error.response?.data?.message || "Login failed",
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await axios.post(`${API_URL}/logout`);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      toast.success("Logout Successful!");
    } catch (error) {
      set({
        error: error.response?.data?.message || "Logout failed",
        isLoading: false,
      });
      throw error;
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, {
        email,
      });
      set({ isLoading: false, message: response.data.message });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Forgot Password failed",
        isLoading: false,
      });
      throw error;
    }
  },

  resetPassword: async (token, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/reset-password/${token}`, {
        newPassword,
      });
      set({ isLoading: false, message: response.data.message });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Reset Password failed",
        isLoading: false,
      });
      throw error;
    }
  },
}));
