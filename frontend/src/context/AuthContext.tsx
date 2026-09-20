import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthUser, AuthSession, AuthContextType } from '../types/auth';
import { cognitoAuthService } from '../services/cognitoAuth';


const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_USER_KEY = 'ripple_auth_user';
const STORAGE_SESSION_KEY = 'ripple_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false);

  const authMode = cognitoAuthService.getAuthMode();

  // Load session from localStorage on initial mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_USER_KEY);
      const savedSession = localStorage.getItem(STORAGE_SESSION_KEY);

      if (savedUser && savedSession) {
        const parsedSession: AuthSession = JSON.parse(savedSession);
        if (parsedSession.expiresAt > Date.now()) {
          setUser(JSON.parse(savedUser));
          setSession(parsedSession);
        } else {
          // Expired
          localStorage.removeItem(STORAGE_USER_KEY);
          localStorage.removeItem(STORAGE_SESSION_KEY);
          setIsSessionExpired(true);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_USER_KEY);
      localStorage.removeItem(STORAGE_SESSION_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Periodic expiration checker (every 30 seconds)
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      if (session.expiresAt <= Date.now()) {
        logout();
        setIsSessionExpired(true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [session]);

  const login = async (email: string, password: string) => {
    const res = await cognitoAuthService.login(email, password);
    setUser(res.user);
    setSession(res.session);
    setIsSessionExpired(false);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(res.user));
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(res.session));
  };

  const loginAsDemo = async () => {
    const res = await cognitoAuthService.loginAsDemo();
    setUser(res.user);
    setSession(res.session);
    setIsSessionExpired(false);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(res.user));
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(res.session));
  };

  const logout = () => {
    setUser(null);
    setSession(null);
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem(STORAGE_SESSION_KEY);
  };

  const forgotPassword = async (email: string) => {
    await cognitoAuthService.forgotPassword(email);
  };

  const resetPassword = async (code: string, newPassword: string) => {
    await cognitoAuthService.resetPassword(code, newPassword);
  };

  const clearSessionExpired = () => {
    setIsSessionExpired(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: Boolean(user && session),
        isLoading,
        authMode,
        login,
        loginAsDemo,
        logout,
        forgotPassword,
        resetPassword,
        isSessionExpired,
        clearSessionExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
