import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '../types/user';
import { INITIAL_USER } from '../utils/mockData';
import { api, getToken, clearToken } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  loginDemo: () => Promise<boolean>;
  register: (
    name: string,
    email: string,
    pass: string,
    chronotype?: string
  ) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updated: Partial<UserProfile>) => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('sleepcycle_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_USER;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // On initial mount: if a token exists in localStorage, verify with backend /auth/me
  useEffect(() => {
    const token = getToken();
    if (token) {
      let isMounted = true;
      api
        .getMe()
        .then((profile) => {
          if (isMounted) {
            setUser(profile);
            localStorage.setItem('sleepcycle_user', JSON.stringify(profile));
          }
        })
        .catch((err) => {
          console.warn('Initial session validation failed with backend:', err.message);
          // If token was rejected as unauthorized, clear token
          if (err.message.includes('401') || err.message.includes('Could not validate')) {
            clearToken();
            if (isMounted) {
              setUser(null);
              localStorage.removeItem('sleepcycle_user');
            }
          }
        });
      return () => {
        isMounted = false;
      };
    }
  }, []);

  // Synchronize user to localStorage for offline cache
  useEffect(() => {
    if (user) {
      localStorage.setItem('sleepcycle_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sleepcycle_user');
    }
  }, [user]);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const { user: authedProfile } = await api.login(email, pass);
      setUser(authedProfile);
      return true;
    } catch (err: any) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const { user: demoProfile } = await api.demoLogin();
      setUser(demoProfile);
      return true;
    } catch (err: any) {
      console.warn('Backend demo-login endpoint failed, falling back to local demo user:', err.message);
      setUser(INITIAL_USER);
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    pass: string,
    chronotype = 'bear'
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const { user: registeredProfile } = await api.register(name, email, pass, chronotype);
      setUser(registeredProfile);
      return true;
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Please try again.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setError(null);
  };

  const updateProfile = async (updated: Partial<UserProfile>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      // Optimistically update local user state
      setUser((prev) => (prev ? { ...prev, ...updated } : null));

      // Persist to backend users/profile
      const updatedUser = await api.updateProfile(updated);

      // If sleep target was updated, also synchronize with sleep goals
      if (
        updated.targetSleepMinutes !== undefined ||
        updated.targetBedtime !== undefined ||
        updated.targetWakeTime !== undefined
      ) {
        try {
          await api.updateGoals({
            target_duration_minutes: updated.targetSleepMinutes,
            target_bedtime: updated.targetBedtime,
            target_wake_time: updated.targetWakeTime,
          });
        } catch (goalErr) {
          console.warn('Failed to sync goals table:', goalErr);
        }
      }

      setUser(updatedUser);
      return true;
    } catch (err: any) {
      console.warn('Profile update failed on backend, preserving local changes:', err.message);
      // Keep optimistic changes locally
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        loginDemo,
        register,
        logout,
        updateProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
