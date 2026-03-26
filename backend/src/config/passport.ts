import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Profile } from 'passport';
import * as userService from '../services/userService';

// Get Google OAuth credentials from environment
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'test-client-id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'test-client-secret';
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback';

if (process.env.NODE_ENV !== 'test' && (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET)) {
  console.warn('⚠️  Warning: Google OAuth credentials not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
}

/**
 * Configure Passport Google OAuth 2.0 Strategy
 */
export function configurePassport(): void {
  // Serialize user to session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await userService.findUserById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Configure Google OAuth strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: CALLBACK_URL,
        scope: ['profile', 'email'],
      },
      async (_accessToken: string, _refreshToken: string, profile: Profile, done) => {
        try {
          // Extract profile information
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName;
          const picture = profile.photos?.[0]?.value;

          if (!email) {
            return done(new Error('No email found in Google profile'), undefined);
          }

          // Check if user already exists by Google ID
          let user = await userService.findUserByGoogleId(googleId);

          if (user) {
            // Update last login
            const updatedUser = await userService.updateLastLogin(user.id);
            return done(null, updatedUser || user);
          }

          // Check if user exists by email (account linking)
          user = await userService.findUserByEmail(email);

          if (user) {
            // Link Google account to existing user
            const linkedUser = await userService.updateUser(user.id, { googleId, picture });
            return done(null, linkedUser || user);
          }

          // Create new user
          const newUser = await userService.createUser({
            email,
            name,
            googleId,
            picture,
          });

          return done(null, newUser);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

export default passport;
