'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { authApi } from './api';
import type { AuthUser } from './types';

const STORAGE_KEY = 'hal_rt';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: true,
  });

  const applyTokens = useCallback(
    async (accessToken: string, refreshToken: string) => {
      localStorage.setItem(STORAGE_KEY, refreshToken);
      const user = await authApi.me(accessToken);
      setState({ user, accessToken, isLoading: false });
    },
    [],
  );

  useEffect(() => {
    const rt = localStorage.getItem(STORAGE_KEY);
    if (!rt) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }
    authApi
      .refresh(rt)
      .then((tokens) => applyTokens(tokens.access_token, tokens.refresh_token))
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        setState((s) => ({ ...s, isLoading: false }));
      });
  }, [applyTokens]);

  const login = useCallback(
    async (email: string, password: string) => {
      const tokens = await authApi.login(email, password);
      await applyTokens(tokens.access_token, tokens.refresh_token);
    },
    [applyTokens],
  );

  const register = useCallback(
    async (email: string, password: string) => {
      const tokens = await authApi.register(email, password);
      await applyTokens(tokens.access_token, tokens.refresh_token);
    },
    [applyTokens],
  );

  const logout = useCallback(async () => {
    const rt = localStorage.getItem(STORAGE_KEY);
    if (rt) {
      authApi.logout(rt).catch(() => {});
      localStorage.removeItem(STORAGE_KEY);
    }
    setState({ user: null, accessToken: null, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
