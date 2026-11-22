import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, setSessionExpiredHandler, setToken } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  // On page load, ask the server who the stored token belongs to.
  useEffect(() => {
    setSessionExpiredHandler(logout);
    if (!getToken()) return;
    api
      .me()
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, [logout]);

  const authenticate = useCallback(async (request) => {
    const { token, user: nextUser } = await request;
    setToken(token);
    setUser(nextUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login: (credentials) => authenticate(api.login(credentials)),
      register: (details) => authenticate(api.register(details)),
      logout,
    }),
    [user, loading, authenticate, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
