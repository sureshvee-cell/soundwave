"use client";

import {
  createContext, useContext, useEffect, useState, useCallback, type ReactNode,
} from "react";
import Cookies from "js-cookie";
import { authApi } from "@/lib/api";
import type { User, AuthTokens, LoginCredentials, RegisterCredentials } from "@/types";

interface AuthState {
  user:      User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  login:    (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout:   () => Promise<void>;
  refresh:  () => Promise<void>;
}

const AuthContext = createContext<(AuthState & AuthActions) | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]         = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);

  // ── Bootstrap: load user from token on mount ────────────────────────────
  const loadUser = useCallback(async () => {
    const token = Cookies.get("sw_access_token");
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await authApi.me();
      setUser(data.data);
    } catch {
      Cookies.remove("sw_access_token");
      Cookies.remove("sw_refresh_token");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  // ── Persist tokens ───────────────────────────────────────────────────────
  const saveTokens = (tokens: AuthTokens) => {
    Cookies.set("sw_access_token",  tokens.accessToken,  { expires: 1 / 24, secure: true, sameSite: "strict" });
    Cookies.set("sw_refresh_token", tokens.refreshToken, { expires: 7,      secure: true, sameSite: "strict" });
  };

  // ── Auth actions ─────────────────────────────────────────────────────────
  const login = async (credentials: LoginCredentials) => {
    const { data } = await authApi.login(credentials.email, credentials.password);
    saveTokens(data.data.tokens);
    setUser(data.data.user);
  };

  const register = async (credentials: RegisterCredentials) => {
    const { data } = await authApi.register(credentials);
    saveTokens(data.data.tokens);
    setUser(data.data.user);
  };

  const logout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    Cookies.remove("sw_access_token");
    Cookies.remove("sw_refresh_token");
    setUser(null);
  };

  const refresh = async () => { await loadUser(); };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refresh,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** Returns true if the user has an active premium or above subscription */
export function useIsPremium() {
  const { user } = useAuth();
  const tier = user?.subscription?.tier;
  return tier === "premium" || tier === "family" || tier === "student";
}
