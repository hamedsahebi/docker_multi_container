const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  googleId: string;
  createdAt: string;
  lastLogin: string;
}

interface AuthStatusResponse {
  authenticated: boolean;
  user?: User;
}

class AuthService {
  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_URL}/auth/me`, {
      credentials: 'include', // Important: Send cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Not authenticated');
    }

    const data = await response.json();
    return data.user;
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }
  }

  /**
   * Check authentication status
   */
  async checkStatus(): Promise<AuthStatusResponse> {
    const response = await fetch(`${API_URL}/auth/status`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check auth status');
    }

    return response.json();
  }

  /**
   * Refresh the access token
   */
  async refreshToken(): Promise<void> {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }
  }
}

export const authService = new AuthService();
