import { Router, Request, Response } from 'express';
import passport from '../config/passport';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';
import { isAuthenticated, attachFullUser } from '../middleware/auth';
import * as userService from '../services/userService';

const router = Router();

// Cookie options
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * @route   GET /auth/google
 * @desc    Initiate Google OAuth flow
 * @access  Public
 */
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

/**
 * @route   GET /auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login?error=auth_failed',
    session: false, // We're using JWT, not sessions
  }),
  (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      if (!user) {
        return res.redirect('/login?error=no_user');
      }

      // Generate JWT tokens
      const { accessToken, refreshToken } = generateTokenPair({
        userId: user.id,
        email: user.email,
      });

      // Set tokens as httpOnly cookies
      res.cookie('accessToken', accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

      // Redirect to frontend dashboard
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/dashboard?auth=success`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      return res.redirect('/login?error=server_error');
    }
  }
);

/**
 * @route   POST /auth/logout
 * @desc    Logout user and clear cookies
 * @access  Private
 */
router.post('/logout', (_req: Request, res: Response) => {
  // Clear authentication cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.json({
    message: 'Logged out successfully',
  });
});

/**
 * @route   GET /auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get('/me', isAuthenticated, attachFullUser, (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Return user without sensitive data
  const { id, email, name, picture, createdAt, lastLogin } = req.user;

  return res.json({
    user: {
      id,
      email,
      name,
      picture,
      createdAt,
      lastLogin,
    },
  });
});

/**
 * @route   POST /auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public (but requires valid refresh token)
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      res.clearCookie('refreshToken');
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Verify user still exists
    const user = await userService.findUserById(payload.userId);

    if (!user) {
      res.clearCookie('refreshToken');
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
    });

    // Set new tokens
    res.cookie('accessToken', tokens.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);

    return res.json({
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({ error: 'Failed to refresh token' });
  }
});

/**
 * @route   GET /auth/status
 * @desc    Check authentication status (lightweight)
 * @access  Public
 */
router.get('/status', isAuthenticated, (req: Request, res: Response) => {
  res.json({
    authenticated: true,
    userId: req.user?.id,
    email: req.user?.email,
  });
});

export default router;
