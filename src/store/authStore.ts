import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, Student, AdminUser } from '../types';

interface AuthStore extends AuthState {
  token: string | null;
  setUser: (user: Student | AdminUser, role: 'student' | 'admin', token: string) => void;
  clearAuth: () => void;
  clearAllCache: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      token: null,
      isAuthenticated: false,
      
      setUser: (user, role, token) => set({
        user,
        role,
        token,
        isAuthenticated: true,
      }),
      
      clearAuth: () => {
        set({
        user: null,
        role: null,
        token: null,
        isAuthenticated: false,
        });
        
        // Clear all related caches and storage
        get().clearAllCache();
      },
      
      clearAllCache: () => {
        try {
          // Clear localStorage items
          localStorage.removeItem('auth-storage');
          localStorage.removeItem('exam-storage');
          
          // Clear sessionStorage
          sessionStorage.clear();
          
          // Clear React Query cache if available
          if (typeof window !== 'undefined' && (window as any).clearQueryCache) {
            (window as any).clearQueryCache();
          }
          
          // Clear cookies if any (basic clearing)
          document.cookie.split(";").forEach((c) => {
            const eqPos = c.indexOf("=");
            const name = eqPos > -1 ? c.substr(0, eqPos) : c;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
          });
          
          console.log('All cache and storage cleared');
        } catch (error) {
          console.error('Error clearing cache:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 