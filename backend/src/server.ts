import app from './app';
import { connectDB } from './config/database';

const PORT = process.env.PORT || 5000;

/**
 * Start the server and connect to MongoDB
 */
async function startServer(): Promise<void> {
  try {
    // Connect to MongoDB first
    await connectDB();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api/metrics`);
      console.log(`🔐 Auth available at http://localhost:${PORT}/auth`);
      console.log(`💚 Health check at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
