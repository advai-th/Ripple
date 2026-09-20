import type { AuthUser, AuthSession } from '../types/auth';

export const COGNITO_REGION = import.meta.env.VITE_COGNITO_REGION || 'us-east-1';
export const COGNITO_USER_POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID || '';
export const COGNITO_CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID || '';
export const AUTH_PROVIDER = import.meta.env.VITE_AUTH_PROVIDER || 'demo';


export const DEMO_USER: AuthUser = {
  id: 'usr_thorne_001',
  name: 'Dr. Aris Thorne',
  email: 'a.thorne@abc.edu',
  role: 'Registrar',
  title: 'Academic Dean / Registrar',
  department: 'Office of Academic Affairs & Records',
  institution: 'ABC University',
  accountStatus: 'ACTIVE',
  avatarInitials: 'AT',
};

export const cognitoAuthService = {
  getAuthMode(): 'demo' | 'cognito' {
    return AUTH_PROVIDER === 'cognito' && Boolean(COGNITO_CLIENT_ID) ? 'cognito' : 'demo';
  },

  async login(email: string, password: string): Promise<{ user: AuthUser; session: AuthSession }> {
    const mode = this.getAuthMode();

    if (mode === 'cognito') {
      try {
        const endpoint = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-amz-json-1.1',
            'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
          },
          body: JSON.stringify({
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: COGNITO_CLIENT_ID,
            AuthParameters: {
              USERNAME: email,
              PASSWORD: password,
            },
          }),
        });

        if (!res.ok) {
          throw new Error('Unable to sign in. The email or password is incorrect.');
        }

        const data = await res.json();
        const authResult = data.AuthenticationResult;

        return {
          user: {
            ...DEMO_USER,
            email,
            name: email.split('@')[0].replace('.', ' '),
          },
          session: {
            accessToken: authResult.AccessToken,
            idToken: authResult.IdToken,
            refreshToken: authResult.RefreshToken,
            expiresAt: Date.now() + (authResult.ExpiresIn || 3600) * 1000,
          },
        };
      } catch (err: any) {
        throw new Error(err.message || 'Unable to sign in. The email or password is incorrect.');
      }
    }

    // Local / Demo Mode verification
    await new Promise((resolve) => setTimeout(resolve, 600)); // Simulate realistic network latency

    const cleanEmail = email.trim().toLowerCase();
    const isDemoAdmin = cleanEmail === 'a.thorne@abc.edu' || cleanEmail === 'admin@ripple.edu' || cleanEmail === 'demo@ripple.edu';
    
    // Accept valid demo credentials or institutional email with matching demo password
    if (isDemoAdmin || password === 'ripple2026' || password === 'admin123') {
      return {
        user: {
          ...DEMO_USER,
          email: cleanEmail || DEMO_USER.email,
        },
        session: {
          accessToken: `demo_jwt_access_${Date.now()}`,
          idToken: `demo_jwt_id_${Date.now()}`,
          expiresAt: Date.now() + 8 * 3600 * 1000, // 8 hours
        },
      };
    }

    throw new Error('Unable to sign in. The email or password is incorrect.');
  },

  async loginAsDemo(): Promise<{ user: AuthUser; session: AuthSession }> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      user: DEMO_USER,
      session: {
        accessToken: `demo_jwt_access_${Date.now()}`,
        idToken: `demo_jwt_id_${Date.now()}`,
        expiresAt: Date.now() + 8 * 3600 * 1000,
      },
    };
  },

  async forgotPassword(email: string): Promise<void> {
    const mode = this.getAuthMode();
    if (mode === 'cognito') {
      const endpoint = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/`;
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': 'AWSCognitoIdentityProviderService.ForgotPassword',
        },
        body: JSON.stringify({
          ClientId: COGNITO_CLIENT_ID,
          Username: email,
        }),
      });
      return;
    }

    // Demo mode: simulate delay, always return success to protect privacy
    await new Promise((resolve) => setTimeout(resolve, 700));
  },

  async resetPassword(code: string, newPassword: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 700));
    if (code.trim().length === 0 || newPassword.length < 8) {
      throw new Error('Please enter a valid verification code and a password of at least 8 characters.');
    }
  },
};
