import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../authService';

// Mock fetch
global.fetch = vi.fn();

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should fetch current user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        googleId: 'google123',
        createdAt: '2024-01-01',
        lastLogin: '2024-01-01',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      } as Response);

      const user = await authService.getCurrentUser();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/me'),
        expect.objectContaining({
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
      expect(user).toEqual(mockUser);
    });

    it('should throw error when not authenticated', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
      } as Response);

      await expect(authService.getCurrentUser()).rejects.toThrow('Not authenticated');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
      } as Response);

      await authService.logout();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/logout'),
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      );
    });

    it('should throw error when logout fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
      } as Response);

      await expect(authService.logout()).rejects.toThrow('Logout failed');
    });
  });

  describe('checkStatus', () => {
    it('should check auth status successfully', async () => {
      const mockStatus = {
        authenticated: true,
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus,
      } as Response);

      const status = await authService.checkStatus();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/status'),
        expect.objectContaining({
          credentials: 'include',
        })
      );
      expect(status).toEqual(mockStatus);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
      } as Response);

      await authService.refreshToken();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/refresh'),
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      );
    });

    it('should throw error when token refresh fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
      } as Response);

      await expect(authService.refreshToken()).rejects.toThrow('Token refresh failed');
    });
  });
});
