'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'ENTHUSIAST' | 'SHOPKEEPER';
  isVerifiedShop: boolean;
  shopName?: string | null;
  shopAddress?: string | null;
  businessHours?: string | null;
  phone?: string | null;
  whatsappNumber?: string | null;
  city: string;
  avatarUrl?: string | null;
  createdAt: string;
  stats?: {
    trustScore: number;
    reviewCount: number;
    itemAsDescribedPct: number;
    avgCommunication: number;
    cleanFaultsPct: number;
    itemsSold: number;
    itemsBought: number;
    activeListingsCount: number;
    sourcingRequestsCount: number;
  };
}

export interface RegisterFormData {
  name: string;
  email: string;
  password?: string;
  role?: string;
  isVerifiedShop?: boolean;
  shopName?: string | null;
  shopAddress?: string | null;
  businessHours?: string | null;
  phone?: string | null;
  whatsappNumber?: string | null;
  city?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterFormData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loginAsDemo: (type: 'shopkeeper' | 'enthusiast' | 'shopkeeper-karachi') => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  loginAsDemo: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error('Failed to load user:', e);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || 'Failed to sign in' };
    } catch (e) {
      const err = e instanceof Error ? e.message : 'Network error';
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData: RegisterFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || 'Failed to create account' };
    } catch (e) {
      const err = e instanceof Error ? e.message : 'Network error';
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const loginAsDemo = async (type: 'shopkeeper' | 'enthusiast' | 'shopkeeper-karachi') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleType: type }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        router.push('/home');
      }
    } catch (e) {
      console.error('Demo login error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        loginAsDemo,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
