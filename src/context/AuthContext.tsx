'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface Permission {
  module: string;
  actions: string[];
}

interface DecodedToken {
  id: string;
  email: string;
  role: string;
  name: string;
  avatar?: string;
  permissions: Permission[];
  exp: number;
}

interface Admin {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  permissions: Permission[];
  role: string;
}
// Settings Interfaces
interface Setting {
  companyName: string;
  comapnyFavicon: string;
  comapnyLogo: string;
  companyEmail: string;
  companyWhatsapp: string;
  welcome_balance: {
    allowed: boolean;
    welcome_amount: number;
  };
}

interface AuthContextType {
  admin: Admin | null;
  isLoading: boolean;
  isAuthenticatedAdmin: boolean;
  login: (token: string) => void;
  logout: () => void;
  checkAuth: () => void;
  updateAdmin: (updates: Partial<Admin>) => void; // ✅ new
}

interface SettingsContextType {
  settings: Setting | null;
  isLoadingSettings: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);
// Settings Provider Component (Standalone)
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Setting | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoadingSettings(true);
      setError(null);

      const response = await fetch('/api/v1/admin/settings/config', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.status}`);
      }

      const settingsData = await response.json();
      setSettings(settingsData.data);

      // Store in localStorage for persistence across page refreshes
      if (settingsData.data) {
        localStorage.setItem('appSettings', JSON.stringify(settingsData.data));
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');

      // Fallback to localStorage if available
      const cachedSettings = localStorage.getItem('appSettings');
      if (cachedSettings) {
        setSettings(JSON.parse(cachedSettings));
      }
    } finally {
      setIsLoadingSettings(false);
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    await fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    // Check if settings are already in localStorage to show immediately
    const cachedSettings = localStorage.getItem('appSettings');
    if (cachedSettings) {
      setSettings(JSON.parse(cachedSettings));
      setIsLoadingSettings(false);
    }

    // Then fetch fresh settings
    fetchSettings();
  }, [fetchSettings]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoadingSettings,
        error,
        refreshSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
// Hook for using Settings
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticatedAdmin, setIsAuthenticatedAdmin] = useState(false);

  const clearCookies = useCallback(() => {
    document.cookie
      .split(';')
      .forEach((cookie) => {
        document.cookie = cookie
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
      });

    document.cookie =
      'admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }, []);

  const clearAuthData = useCallback(async () => {
    try {
      await fetch('/api/v1/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    setAdmin(null);
    setIsAuthenticatedAdmin(false);
    clearCookies();
    if (
      typeof window !== 'undefined' &&
      window.location.pathname.includes('/admin')
    ) {
      router.push('/login');
    }
  }, [router, clearCookies]);

  const login = useCallback(
    (token: string) => {
      if (!token) {
        console.error('Login failed: Token is null or undefined.');
        clearAuthData();
        return;
      }

      try {
        const decoded: DecodedToken = jwtDecode(token);
        console.log("decoded token:", decoded);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          console.warn('Token expired at login.');
          clearAuthData();
          return;
        }

        const adminData: Admin = {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          avatar: decoded?.avatar || '/images/logo/logo.png',
          permissions: decoded.permissions,
          role: decoded.role,

        };

        setAdmin(adminData);
        setIsAuthenticatedAdmin(true);
        localStorage.setItem('adminToken', token);
        localStorage.setItem('admin', JSON.stringify(adminData));

      } catch (error) {
        console.error('Login failed: Invalid token', error);
        clearAuthData();
      }
    },
    [clearAuthData]
  );

  const logout = useCallback(() => {
    clearAuthData();
  }, [clearAuthData]);

  const checkAuth = useCallback(() => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        clearAuthData();
        return;
      }

      const decoded: DecodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      console.log("decoded token:", decoded);

      if (decoded.exp < currentTime) {
        console.warn('Token expired. Logging out.');
        clearAuthData();
        return;
      }

      const adminData: Admin = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        avatar: decoded?.avatar || '/images/logo/logo.png',
        permissions: decoded.permissions,
        role: decoded.role,
      };
      setAdmin(adminData);
      setIsAuthenticatedAdmin(true);
      localStorage.setItem('admin', JSON.stringify(adminData));
      // const a= window.location.pathname.includes('/admin') ? router.push('/admin') : router.push('/login');
    } catch (error) {
      console.error('Invalid or modified token. Logging out.', error);
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthData]);

  // ✅ NEW FUNCTION
  const updateAdmin = useCallback((updates: Partial<Admin>) => {
    setAdmin((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem('admin', JSON.stringify(updated));
      return updated;
    });
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        admin,
        isLoading,
        isAuthenticatedAdmin,
        login,
        logout,
        checkAuth,
        updateAdmin, // ✅ available everywhere
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
// Optional: Safe hooks that don't throw errors (return undefined if provider not found)
export function useSettingsSafe() {
  return useContext(SettingsContext);
}
