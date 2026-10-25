import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService.js';
import { tokenStore } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check a saved token

  // On first load, restore the session if a token is saved.
  useEffect(() => {
    let active = true;
    if (!tokenStore.get()) {
      setLoading(false);
      return undefined;
    }
    authService
      .me()
      .then((res) => active && setUser(res.user))
      .catch(() => tokenStore.clear())
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // api.js fires this event when the server says the token is no longer valid.
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);
    tokenStore.set(res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (details) => {
    const res = await authService.register(details);
    tokenStore.set(res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
