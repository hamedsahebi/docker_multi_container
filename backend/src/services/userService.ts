import fs from 'fs/promises';
import path from 'path';
import { User } from '../types';

const USERS_FILE = path.join(__dirname, '../../data/users.json');

// Ensure users file exists
async function ensureUsersFile(): Promise<void> {
  try {
    await fs.access(USERS_FILE);
  } catch {
    // File doesn't exist, create it with empty array
    await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
    await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2));
  }
}

// Read all users from file
async function getAllUsers(): Promise<User[]> {
  await ensureUsersFile();
  const data = await fs.readFile(USERS_FILE, 'utf-8');
  return JSON.parse(data);
}

// Write users to file
async function saveUsers(users: User[]): Promise<void> {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

// Find user by ID
export async function findUserById(id: string): Promise<User | null> {
  const users = await getAllUsers();
  return users.find(user => user.id === id) || null;
}

// Find user by email
export async function findUserByEmail(email: string): Promise<User | null> {
  const users = await getAllUsers();
  return users.find(user => user.email === email) || null;
}

// Find user by Google ID
export async function findUserByGoogleId(googleId: string): Promise<User | null> {
  const users = await getAllUsers();
  return users.find(user => user.googleId === googleId) || null;
}

// Create a new user
export async function createUser(userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>): Promise<User> {
  const users = await getAllUsers();
  
  const newUser: User = {
    ...userData,
    id: generateUserId(),
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };
  
  users.push(newUser);
  await saveUsers(users);
  
  return newUser;
}

// Update user's last login
export async function updateLastLogin(userId: string): Promise<User | null> {
  const users = await getAllUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return null;
  }
  
  users[userIndex].lastLogin = new Date().toISOString();
  await saveUsers(users);
  
  return users[userIndex];
}

// Update user data
export async function updateUser(userId: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
  const users = await getAllUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return null;
  }
  
  users[userIndex] = {
    ...users[userIndex],
    ...updates,
  };
  
  await saveUsers(users);
  return users[userIndex];
}

// Delete user
export async function deleteUser(userId: string): Promise<boolean> {
  const users = await getAllUsers();
  const filteredUsers = users.filter(user => user.id !== userId);
  
  if (filteredUsers.length === users.length) {
    return false; // User not found
  }
  
  await saveUsers(filteredUsers);
  return true;
}

// Generate unique user ID
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
