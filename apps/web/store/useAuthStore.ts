import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'viewer' | 'manager' | 'analyst';

export interface UserProfile {
    id ?: string;
    organization_id ?: string;
    full_name: string;
    email: string;
    role: UserRole;
}

interface AuthState {
    user: UserProfile | null;
    isAuthenticated: boolean;
    hydrated: boolean;
    setHydrated: (value: boolean) => void;
    setUser: (user: UserProfile) => void;
    updateUser: (partial: Partial<UserProfile>) => void;
    logout: () => void;
}

const STORAGE_KEY = 'auth';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hydrated: false,

      setHydrated: (value) => set({ hydrated: value }),
      setUser: (user) => set({ user, isAuthenticated: true }),
      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : state.user,
        })),
      logout: () => {
        // Clear in-memory state immediately
        set({ user: null, isAuthenticated: false });
        // Also wipe the persisted localStorage entry so no stale
        // data can be re-hydrated on next render / page navigation
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // localStorage may not be available in SSR context — safe to ignore
        }
      },
    }),
    {
      name: STORAGE_KEY,

      onRehydrateStorage: () => {
        // Mark the store as hydrated once the persisted state has been loaded
        return (state) =>{
            state?.setHydrated(true);
        }
      }
    }
  )
);