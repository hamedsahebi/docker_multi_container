import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sensor_monitoring';

/**
 * Connect to MongoDB database
 */
export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    
    // Log the database name for clarity
    const dbName = mongoose.connection.db?.databaseName;
    console.log(`📊 Database: ${dbName}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    // In production, you might want to exit the process
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Disconnect from MongoDB database
 */
export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB disconnected successfully');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
    throw error;
  }
}

/**
 * Check if database is connected
 */
export function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Get the current database connection
 */
export function getConnection(): typeof mongoose.connection {
  return mongoose.connection;
}

// Graceful shutdown handlers
process.on('SIGINT', async () => {
  console.log('\n⚠️  SIGINT received, closing MongoDB connection...');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  SIGTERM received, closing MongoDB connection...');
  await disconnectDB();
  process.exit(0);
});

export default { connectDB, disconnectDB, isConnected, getConnection };
