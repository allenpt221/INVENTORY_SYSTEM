import axios from '../lib/axios';
import { create } from 'zustand';

type User = {
  id?: number;
  username: string;
  email: string;
  role?: string;
  image: string;
  admin_id?: number | null;
  staff_id?: number
};


export type userUpdateLoad = User;


export type signupStaff = {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  image?: string;
}

interface UserState {
  user: User | null;
  staffDetails: User[];
  loading: boolean;
  checkingAuth: boolean;
  justLoggedIn: boolean;
  setJustLoggedIn: (value: boolean) => void;
  setUser: (user: User) => void;
  clearUser: () => void;
  signupStaff: (createuser: signupStaff) => Promise<void>;
  login: (email: string, password: string) => Promise<Boolean>;
  checkAuth: () => Promise<void>;
  refreshToken: () => Promise<any>;
  logout: () => Promise<void>;
  getStaff: () => Promise<void>;
}

export const authUserStore = create<UserState>((set, get) => ({
  user: null,
  staffDetails: [],
  loading: false,
  checkingAuth: true,
  justLoggedIn: false,
  setJustLoggedIn: (value) => set({ justLoggedIn: value }),

  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),

  // only manager can create staff account
  signupStaff: async(createuser: signupStaff): Promise<void> => {
    try {
      const res = await axios.post('/auth/signstaff', createuser);

      set((state) => ({
      staffDetails: [...state.staffDetails, res.data.staff],
    }));

    } catch (error: any) {
      const message = error?.response?.data?.error || 'Failed to create staff. Please try again.';
        console.error('Signup error:', message);
        throw new Error(message);
    }
  },
  
  getStaff: async (): Promise<void> => {
    try {
      const res = await axios.get('auth/getstaff');
      set({staffDetails: res.data.staff});
    } catch (error: any) {
      console.error('Error fetching the staff details:', error);
    }
  },

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


let refreshPromise: Promise<any> | null = null;

axios.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				// If a refresh is already in progress, wait for it to complete
				if (refreshPromise) {
					await refreshPromise;
					return axios(originalRequest);
				}

				// Start a new refresh process
				refreshPromise = authUserStore.getState().refreshToken();
				await refreshPromise;
				refreshPromise = null;

				return axios(originalRequest);
			} catch (refreshError) {
				// If refresh fails, redirect to login or handle as needed
				authUserStore.getState().logout();
				return Promise.reject(refreshError);
			}
		}
		return Promise.reject(error);
	}
);
