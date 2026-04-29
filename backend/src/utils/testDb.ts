import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer | null = null;
const isDocker = process.env.MONGODB_URI?.includes('mongodb-test');

/**
 * Connect to the in-memory database for testing
 */
export async function connectTestDB(): Promise<void> {
  try {
    if (isDocker) {
      // Running in Docker - use the actual MongoDB test container
      const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:testpassword123@mongodb-test:27017/sensor_monitoring_test?authSource=admin';
      await mongoose.connect(mongoUri);
      console.log('✅ Test database connected (Docker MongoDB)');
    } else {
      // Running locally - use MongoDB Memory Server
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('✅ Test database connected (Memory Server)');
    }
  } catch (error) {
    console.error('❌ Error connecting to test database:', error);
    throw error;
  }
}

/**
 * Drop database, close the connection and stop MongoMemoryServer
 */
export async function closeTestDB(): Promise<void> {
  try {
    if (mongoose.connection.readyState !== 0) {
      if (!isDocker) {
        // Only drop database in local testing with Memory Server
        await mongoose.connection.dropDatabase();
      }
      await mongoose.connection.close();
    }
    
    if (mongoServer) {
      await mongoServer.stop();
    }
    
    console.log('✅ Test database closed');
  } catch (error) {
    console.error('❌ Error closing test database:', error);
    throw error;
  }
}

/**
 * Clear all collections in the database
 */
export async function clearTestDB(): Promise<void> {
  try {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  } catch (error) {
    console.error('❌ Error clearing test database:', error);
    throw error;
  }
}

/**
 * Drop all collections in the database
 */
export async function dropTestCollections(): Promise<void> {
  try {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.drop();
    }
  } catch (error) {
    // Ignore error if collection doesn't exist
    if ((error as any).message !== 'ns not found') {
      throw error;
    }
  }
}

export default {
  connectTestDB,
  closeTestDB,
  clearTestDB,
  dropTestCollections,
};
