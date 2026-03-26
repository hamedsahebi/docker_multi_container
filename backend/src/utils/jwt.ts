import jwt from 'jsonwebtoken';
import { AuthTokenPayload } from '../types';

// Get JWT secrets from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production';

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

/**
 * Generate access token (short-lived)
 */
export function generateAccessToken(payload: Omit<AuthTokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

/**
 * Generate refresh token (long-lived)
 */
export function generateRefreshToken(payload: Omit<AuthTokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.log('Access token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.log('Invalid access token');
    }
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as AuthTokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.log('Refresh token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.log('Invalid refresh token');
    }
    return null;
  }
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(payload: Omit<AuthTokenPayload, 'iat' | 'exp'>): {
  accessToken: string;
  refreshToken: string;
} {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

/**
 * Decode token without verifying (for debugging)
 */
export function decodeToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.decode(token) as AuthTokenPayload;
  } catch {
    return null;
  }
}
