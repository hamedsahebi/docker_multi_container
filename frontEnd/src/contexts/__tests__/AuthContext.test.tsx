import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { authService } from '../../services/authService';

// Mock the auth service
vi.mock('../../services/authService', () => ({
  authService: {
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
    checkStatus: vi.fn(),
    refreshToken: vi.fn(),
  },
}));

// Mock window.location
const mockWindowLocation = {
  href: '',
  search: '',
  pathname: '/',
};

Object.defineProperty(window, 'location', {
  value: mockWindowLocation,
  writable: true,
});

// Test component that uses the auth hook
function TestComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'loaded'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
      <div data-testid="user">{user ? user.name : 'no user'}</div>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWindowLocation.search = '';
    mockWindowLocation.pathname = '/';
  });

  it('should provide initial loading state', () => {
    vi.mocked(authService.getCurrentUser).mockImplementation(
      () => new Promise<never>(() => {}) // Never resolves
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
  });

  it('should set user when authentication succeeds', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      googleId: 'google123',
      createdAt: '2024-01-01',
      lastLogin: '2024-01-01',
    };

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('user')).toHaveTextContent('Test User');
  });

  it('should handle authentication failure', async () => {
    vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error('Not authenticated'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('no user');
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    // Suppress console error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleError.mockRestore();
  });
});
