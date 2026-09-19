export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  title: string;
  department: string;
  institution: string;
  accountStatus: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  avatarInitials: string;
}

export interface AuthSession {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresAt: number; // timestamp in ms
}

export interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authMode: 'demo' | 'cognito';
  login: (email: string, password: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (code: string, newPassword: string) => Promise<void>;
  isSessionExpired: boolean;
  clearSessionExpired: () => void;
}
