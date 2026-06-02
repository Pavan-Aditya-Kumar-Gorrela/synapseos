import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'viewer' | 'manager' | 'analyst';

export interface UserProfile {
  id?: string;
  organization_id?: string;
  full_name: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;         // ← added: persisted JWT / access token
  isAuthenticated: boolean;
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  setUser: (user: UserProfile) => void;
  setToken: (token: string) => void;  // ← added: call this after login
  updateUser: (partial: Partial<UserProfile>) => void;
  logout: () => void;
}

const STORAGE_KEY = 'auth';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hydrated: false,

      setHydrated: (value) => set({ hydrated: value }),

      setUser: (user) => set({ user, isAuthenticated: true }),

      /** Call this right after a successful login with the JWT returned by the backend. */
      setToken: (token) => set({ token }),

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : state.user,
        })),

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // SSR-safe
        }
      },
    }),
    {
      name: STORAGE_KEY,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);