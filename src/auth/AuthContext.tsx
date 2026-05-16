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

  const accessTokenRef = useRef<string | null>(null);

  const isRefreshingRef = useRef(false);
  const refreshSubscribers = useRef<Array<(token: string | null) => void>>([]);

  const clearAuth = useCallback(() => {
    accessTokenRef.current = null;
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('refresh_token');
  }, []);

  const applyAccessToken = useCallback((token: string) => {
    accessTokenRef.current = token;
    setAccessToken(token);
    setUser(parseJwtPayload(token));
  }, []);


  useEffect(() => {
    const reqId = apiClient.interceptors.request.use((config) => {
      const token = accessTokenRef.current;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    const resId = apiClient.interceptors.response.use(
      (res) => res,
      async (error) => {
        const original = error.config as { _retry?: boolean };

        if (error.response?.status !== 401 || original._retry) {
          return Promise.reject(error);
        }

        original._retry = true;

        if (isRefreshingRef.current) {
   
          return new Promise((resolve, reject) => {
            refreshSubscribers.current.push((newToken) => {
              if (!newToken) { reject(error); return; }
              error.config.headers.Authorization = `Bearer ${newToken}`;
              resolve(apiClient(error.config));
            });
          });
        }

        isRefreshingRef.current = true;
        const storedToken = localStorage.getItem('refresh_token');

        if (!storedToken) {
          isRefreshingRef.current = false;
          clearAuth();
          return Promise.reject(error);
        }

        try {
          const tokens = await authApi.refresh(storedToken);
          localStorage.setItem('refresh_token', tokens.refresh_token);
          applyAccessToken(tokens.access_token);

          
          refreshSubscribers.current.forEach((cb) => cb(tokens.access_token));
          refreshSubscribers.current = [];

          error.config.headers.Authorization = `Bearer ${tokens.access_token}`;
          return apiClient(error.config);
        } catch {
          refreshSubscribers.current.forEach((cb) => cb(null));
          refreshSubscribers.current = [];
          clearAuth();
          return Promise.reject(error);
        } finally {
          isRefreshingRef.current = false;
        }
      },
    );

    return () => {
      apiClient.interceptors.request.eject(reqId);
      apiClient.interceptors.response.eject(resId);
    };
  }, [applyAccessToken, clearAuth]);


  useEffect(() => {
    const stored = localStorage.getItem('refresh_token');
    if (!stored) {
      setIsLoading(false);
      return;
    }
    isRefreshingRef.current = true;
    authApi
      .refresh(stored)
      .then((tokens) => {
        localStorage.setItem('refresh_token', tokens.refresh_token);
        applyAccessToken(tokens.access_token);
        refreshSubscribers.current.forEach((cb) => cb(tokens.access_token));
        refreshSubscribers.current = [];
      })
      .catch(() => {
        localStorage.removeItem('refresh_token');
        refreshSubscribers.current.forEach((cb) => cb(null));
        refreshSubscribers.current = [];
      })
      .finally(() => {
        isRefreshingRef.current = false;
        setIsLoading(false);
      });
  }, [applyAccessToken]);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await authApi.login({ email, password });
    localStorage.setItem('refresh_token', tokens.refresh_token);
    applyAccessToken(tokens.access_token);
  }, [applyAccessToken]);

  const logout = useCallback(async () => {
    const stored = localStorage.getItem('refresh_token');
    if (stored && accessTokenRef.current) {
      try {
        await authApi.logout(stored, accessTokenRef.current);
      } catch {
     
      }
    }
    clearAuth();
  }, [clearAuth]);

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
