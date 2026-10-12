import { createContext, useContext, useMemo, useState, type PropsWithChildren } from "react";
import { clearToken, getCurrentUser } from "../api/client";
import type { AuthUser } from "../types/api";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loginState: (user: AuthUser | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(() => getCurrentUser());

  const loginState = (nextUser: AuthUser | null) => setUser(nextUser);
  const logout = () => {
    clearToken();
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === "ADMIN",
    loginState,
    logout,
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
