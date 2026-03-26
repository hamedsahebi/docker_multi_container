import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
} from '../src/utils/jwt';
import * as userService from '../src/services/userService';
import request from 'supertest';
import app from '../src/app';
import fs from 'fs/promises';
import path from 'path';

describe('JWT Utilities', () => {
  const mockPayload = {
    userId: 'test-user-123',
    email: 'test@example.com',
  };

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken(mockPayload);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });

    it('should include userId and email in token', () => {
      const token = generateAccessToken(mockPayload);
      const decoded = verifyAccessToken(token);
      
      expect(decoded).toBeTruthy();
      expect(decoded?.userId).toBe(mockPayload.userId);
      expect(decoded?.email).toBe(mockPayload.email);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(mockPayload);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });

    it('should include userId and email in refresh token', () => {
      const token = generateRefreshToken(mockPayload);
      const decoded = verifyRefreshToken(token);
      
      expect(decoded).toBeTruthy();
      expect(decoded?.userId).toBe(mockPayload.userId);
      expect(decoded?.email).toBe(mockPayload.email);
    });
  });

  describe('generateTokenPair', () => {
    it('should generate both access and refresh tokens', () => {
      const tokens = generateTokenPair(mockPayload);
      
      expect(tokens.accessToken).toBeTruthy();
      expect(tokens.refreshToken).toBeTruthy();
      
      const accessDecoded = verifyAccessToken(tokens.accessToken);
      const refreshDecoded = verifyRefreshToken(tokens.refreshToken);
      
      expect(accessDecoded?.userId).toBe(mockPayload.userId);
      expect(refreshDecoded?.userId).toBe(mockPayload.userId);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid token', () => {
      const token = generateAccessToken(mockPayload);
      const decoded = verifyAccessToken(token);
      
      expect(decoded).toBeTruthy();
      expect(decoded?.userId).toBe(mockPayload.userId);
    });

    it('should return null for invalid token', () => {
      const decoded = verifyAccessToken('invalid-token');
      expect(decoded).toBeNull();
    });

    it('should return null for malformed token', () => {
      const decoded = verifyAccessToken('not.a.token');
      expect(decoded).toBeNull();
    });
  });
});

describe('User Service', () => {
  const USERS_FILE = path.join(__dirname, '../data/users.json');

  beforeEach(async () => {
    // Clear users file before each test
    await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
    await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2));
  });

  afterAll(async () => {
    // Clean up after tests
    try {
      await fs.unlink(USERS_FILE);
    } catch {
      // File may not exist
    }
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        name: 'New User',
        googleId: 'google123',
      };

      const user = await userService.createUser(userData);

      expect(user.id).toBeTruthy();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.googleId).toBe(userData.googleId);
      expect(user.createdAt).toBeTruthy();
      expect(user.lastLogin).toBeTruthy();
    });

    it('should generate unique IDs for different users', async () => {
      const user1 = await userService.createUser({
        email: 'user1@example.com',
        name: 'User 1',
        googleId: 'google1',
      });

      const user2 = await userService.createUser({
        email: 'user2@example.com',
        name: 'User 2',
        googleId: 'google2',
      });

      expect(user1.id).not.toBe(user2.id);
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by email', async () => {
      const createdUser = await userService.createUser({
        email: 'find@example.com',
        name: 'Find Me',
        googleId: 'google456',
      });

      const foundUser = await userService.findUserByEmail('find@example.com');

      expect(foundUser).toBeTruthy();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.email).toBe(createdUser.email);
    });

    it('should return null for non-existent email', async () => {
      const foundUser = await userService.findUserByEmail('nonexistent@example.com');
      expect(foundUser).toBeNull();
    });
  });

  describe('findUserByGoogleId', () => {
    it('should find user by Google ID', async () => {
      await userService.createUser({
        email: 'google@example.com',
        name: 'Google User',
        googleId: 'google789',
      });

      const foundUser = await userService.findUserByGoogleId('google789');

      expect(foundUser).toBeTruthy();
      expect(foundUser?.googleId).toBe('google789');
    });

    it('should return null for non-existent Google ID', async () => {
      const foundUser = await userService.findUserByGoogleId('nonexistent');
      expect(foundUser).toBeNull();
    });
  });

  describe('updateLastLogin', () => {
    it('should update user last login timestamp', async () => {
      const user = await userService.createUser({
        email: 'update@example.com',
        name: 'Update User',
        googleId: 'google999',
      });

      const originalLastLogin = user.lastLogin;
      
      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const updatedUser = await userService.updateLastLogin(user.id);

      expect(updatedUser).toBeTruthy();
      expect(updatedUser?.lastLogin).not.toBe(originalLastLogin);
    });
  });
});

describe('Authentication Routes', () => {
  describe('POST /auth/logout', () => {
    it('should clear authentication cookies', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .expect(200);

      expect(response.body.message).toBe('Logged out successfully');
      
      // Check that cookies are cleared
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
    });
  });

  describe('GET /auth/status', () => {
    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/auth/status')
        .expect(401);
    });

    it('should return user info with valid token', async () => {
      const mockPayload = {
        userId: 'test-user-123',
        email: 'test@example.com',
      };
      
      const token = generateAccessToken(mockPayload);

      const response = await request(app)
        .get('/auth/status')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.authenticated).toBe(true);
      expect(response.body.userId).toBe(mockPayload.userId);
      expect(response.body.email).toBe(mockPayload.email);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should return 401 without refresh token', async () => {
      await request(app)
        .post('/auth/refresh')
        .expect(401);
    });

    it('should return 401 with invalid refresh token', async () => {
      await request(app)
        .post('/auth/refresh')
        .set('Cookie', ['refreshToken=invalid-token'])
        .expect(401);
    });
  });
});

describe('Protected Metrics Routes', () => {
  describe('GET /api/metrics', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/metrics')
        .expect(401);

      expect(response.body.error).toContain('Authentication required');
    });

    it('should return 401 with invalid token', async () => {
      await request(app)
        .get('/api/metrics')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should return metrics with valid token', async () => {
      const mockPayload = {
        userId: 'test-user-123',
        email: 'test@example.com',
      };
      
      const token = generateAccessToken(mockPayload);

      const response = await request(app)
        .get('/api/metrics')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('temperature');
      expect(response.body).toHaveProperty('pressure');
      expect(response.body).toHaveProperty('vibration');
      expect(response.body).toHaveProperty('power');
    });
  });

  describe('GET /api/metrics/:metricType', () => {
    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/metrics/temperature')
        .expect(401);
    });

    it('should return temperature data with valid token', async () => {
      const token = generateAccessToken({
        userId: 'test-user-123',
        email: 'test@example.com',
      });

      const response = await request(app)
        .get('/api/metrics/temperature')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('timestamp');
        expect(response.body[0]).toHaveProperty('value');
      }
    });
  });
});
