import { Request, Response, NextFunction } from 'express';
import { User } from '../types';
import { verifyAccessToken } from '../utils/jwt';

// Extend Express Request to include user
declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}

/**
 * Middleware to check if user is authenticated
 * Validates JWT from httpOnly cookie or Authorization header
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction): void {
  try {
    // Try to get token from cookie first (preferred method)
    let token = req.cookies?.accessToken;

    // Fallback to Authorization header (for API clients)
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      res.status(401).json({ error: 'Authentication required. No token provided.' });
      return;
    }

    // Verify token
    const payload = verifyAccessToken(token);

    if (!payload) {
      res.status(401).json({ error: 'Invalid or expired token.' });
      return;
    }

    // Attach user info to request (lightweight - just ID and email)
    req.user = {
      id: payload.userId,
      email: payload.email,
    } as User;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed.' });
  }
}

/**
 * Middleware to attach full user object to request
 * Should be used after isAuthenticated
 */
export async function attachFullUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'User not authenticated.' });
      return;
    }

    const userService = await import('../services/userService');
    const fullUser = await userService.findUserById(req.user.id);

    if (!fullUser) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    req.user = fullUser;
    next();
  } catch (error) {
    console.error('Error attaching user:', error);
    res.status(500).json({ error: 'Failed to load user data.' });
  }
}

/**
 * Optional authentication - doesn't fail if no token
 * Useful for endpoints that work differently for authenticated users
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    let token = req.cookies?.accessToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (token) {
      const payload = verifyAccessToken(token);
      if (payload) {
        req.user = {
          id: payload.userId,
          email: payload.email,
        } as User;
      }
    }

    next();
  } catch (error) {
    // Silent fail - just continue without user
    next();
  }
}
