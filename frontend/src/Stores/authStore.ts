import axios from '../lib/axios';
import { create } from 'zustand';

type User = {
  id: string;
  username: string;
  email: string;
  role: string;
};

interface UserState {
  user: User | null;
  loading: boolean;
  checkingAuth: boolean;
  justLoggedIn: boolean;
  setJustLoggedIn: (value: boolean) => void;
  setUser: (user: User) => void;
  clearUser: () => void;
  login: (email: string, password: string) => Promise<Boolean>;
  checkAuth: () => Promise<void>;
  refreshToken: () => Promise<any>;
  logout: () => Promise<void>;
}

export const authUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,
  justLoggedIn: false,
  setJustLoggedIn: (value) => set({ justLoggedIn: value }),

  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),

  login: async (email: string, password: string): Promise<Boolean> => {
    set({ loading: true });
    try {
      const res = await axios.post('auth/login', { email, password });
      set({ user: res.data.user, loading: false, justLoggedIn: true });
      return true
    } catch (error: any) {
      console.error('Invalid credentials:', error);
      set({ loading: false });
      return false;
    }
  },

  logout: async (): Promise<void> => {
      try {
        await axios.post('auth/logout');
        set({user: null})
    } catch (error) {
      console.error('logout failed:', error);
        
    }
  },

  checkAuth: async (): Promise<void> => {
    set({ checkingAuth: true });
    try {
      const res = await axios.get('auth/getprofile');
      set({ user: res.data, checkingAuth: false });
    } catch (error: any) {
      console.log(error.message);
      set({ checkingAuth: false, user: null });
    }
  },

  refreshToken: async (): Promise<any> => {
    if (get().checkingAuth) return;

    set({ checkingAuth: true });
    try {
      const response = await axios.post('/auth/refresh');
      set({ checkingAuth: false });
      return response.data;
    } catch (error) {
      set({ user: null, checkingAuth: false });
      throw error;
    }
  },
}));
