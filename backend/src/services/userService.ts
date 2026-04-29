import { UserModel, UserDocument } from '../models/User';
import { User } from '../types';

/**
 * Convert UserDocument to User interface
 */
function toUser(userDoc: UserDocument): User {
  const userObj = userDoc.toObject();
  return {
    id: userObj.id,
    email: userObj.email,
    name: userObj.name,
    googleId: userObj.googleId,
    picture: userObj.picture,
    createdAt: userObj.createdAt,
    lastLogin: userObj.lastLogin,
  };
}

/**
 * Find user by ID
 */
export async function findUserById(id: string): Promise<User | null> {
  try {
    const user = await UserModel.findById(id);
    return user ? toUser(user) : null;
  } catch (error) {
    console.error('Error finding user by ID:', error);
    return null;
  }
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const user = await UserModel.findByEmail(email);
    return user ? toUser(user) : null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
}

/**
 * Find user by Google ID
 */
export async function findUserByGoogleId(googleId: string): Promise<User | null> {
  try {
    const user = await UserModel.findByGoogleId(googleId);
    return user ? toUser(user) : null;
  } catch (error) {
    console.error('Error finding user by Google ID:', error);
    return null;
  }
}

/**
 * Create a new user
 */
export async function createUser(userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>): Promise<User> {
  try {
    const newUser = new UserModel({
      email: userData.email,
      name: userData.name,
      googleId: userData.googleId,
      picture: userData.picture,
      lastLogin: new Date(),
    });

    const savedUser = await newUser.save();
    return toUser(savedUser);
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }
}

/**
 * Update user's last login timestamp
 */
export async function updateLastLogin(userId: string): Promise<User | null> {
  try {
    const user = await UserModel.findById(userId);
    
    if (!user) {
      return null;
    }

    await user.updateLastLogin();
    return toUser(user);
  } catch (error) {
    console.error('Error updating last login:', error);
    return null;
  }
}

/**
 * Update user data
 */
export async function updateUser(userId: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
  try {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return user ? toUser(user) : null;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

/**
 * Delete user by ID
 */
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const result = await UserModel.findByIdAndDelete(userId);
    return !!result;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
}

/**
 * Get all users (for admin purposes - use with caution)
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const users = await UserModel.find().sort({ createdAt: -1 });
    return users.map(toUser);
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
}

/**
 * Count total users
 */
export async function countUsers(): Promise<number> {
  try {
    return await UserModel.countDocuments();
  } catch (error) {
    console.error('Error counting users:', error);
    return 0;
  }
}
