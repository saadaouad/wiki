'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import Loading from '@/components/loading';
import { useFetch } from '@/hooks/index';
import type { AuthContextType, MeResponse } from '@/types/index';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTokenState(localStorage.getItem('token'));
    setHydrated(true);
  }, []);

  const setSessionToken = useCallback((next: string | null) => {
    if (next) {
      localStorage.setItem('token', next);
    } else {
      localStorage.removeItem('token');
    }
    setTokenState(next);
  }, []);

  const { data, loading: fetchLoading } = useFetch<MeResponse>('/me', token ?? '');

  const user = data?.user ?? null;
  const loading = !hydrated || (!!token && fetchLoading);
  const isAuthenticated = !!user;

  if (loading) return <Loading />;

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, setSessionToken, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
