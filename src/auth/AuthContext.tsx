import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { apiClient } from '../api/client';
import { authApi } from '../api/auth.api';

interface AuthUser {
  userId: string;
  role: 'admin' | 'user';
  firstName: string;
  lastName: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function parseJwtPayload(token: string): AuthUser {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const json = JSON.parse(atob(base64));
  return { userId: json.userId as string, role: json.role as 'admin' | 'user', firstName: json.firstName as string, lastName: json.lastName as string };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const interceptorRef = useRef<number | null>(null);

  const clearAuth = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('refresh_token');
  }, []);

  const applyAccessToken = useCallback((token: string) => {
    setAccessToken(token);
    setUser(parseJwtPayload(token));
  }, []);

  // Wire up apiClient interceptors whenever accessToken changes
  useEffect(() => {
    if (interceptorRef.current !== null) {
      apiClient.interceptors.request.eject(interceptorRef.current);
    }
    interceptorRef.current = apiClient.interceptors.request.use((config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });
  }, [accessToken]);

  // Response interceptor: 401 → try refresh once, then retry
  useEffect(() => {
    const id = apiClient.interceptors.response.use(
      (res) => res,
      async (error) => {
        const original = error.config as { _retry?: boolean };
        if (error.response?.status === 401 && !original._retry) {
          original._retry = true;
          const storedToken = localStorage.getItem('refresh_token');
          if (storedToken) {
            try {
              const tokens = await authApi.refresh(storedToken);
              localStorage.setItem('refresh_token', tokens.refresh_token);
              applyAccessToken(tokens.access_token);
              error.config.headers.Authorization = `Bearer ${tokens.access_token}`;
              return apiClient(error.config);
            } catch {
              clearAuth();
            }
          } else {
            clearAuth();
          }
        }
        return Promise.reject(error);
      },
    );
    return () => {
      apiClient.interceptors.response.eject(id);
    };
  }, [applyAccessToken, clearAuth]);

  // On mount: attempt silent refresh if refresh token exists
  useEffect(() => {
    const stored = localStorage.getItem('refresh_token');
    if (!stored) {
      setIsLoading(false);
      return;
    }
    authApi
      .refresh(stored)
      .then((tokens) => {
        localStorage.setItem('refresh_token', tokens.refresh_token);
        applyAccessToken(tokens.access_token);
      })
      .catch(() => {
        localStorage.removeItem('refresh_token');
      })
      .finally(() => setIsLoading(false));
  }, [applyAccessToken]);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await authApi.login({ email, password });
    localStorage.setItem('refresh_token', tokens.refresh_token);
    applyAccessToken(tokens.access_token);
  }, [applyAccessToken]);

  const logout = useCallback(async () => {
    const stored = localStorage.getItem('refresh_token');
    if (stored && accessToken) {
      try {
        await authApi.logout(stored, accessToken);
      } catch {
        // best-effort
      }
    }
    clearAuth();
  }, [accessToken, clearAuth]);

  return (
    <AuthContext.Provider value={{ user, isLoading, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
