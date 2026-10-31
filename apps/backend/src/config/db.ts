import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://admin:admin123@graphrag_agent_db_mongo:27017/soohyung?authSource=admin';

export const connectDB = async () => {
  try {
    console.log(`[Database] Connecting to MongoDB: ${MONGO_URI.replace(/:[^:]*@/, ':****@')}`);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });
    console.log('[Database] MongoDB connected successfully to database:', mongoose.connection.name);
  } catch (err: any) {
    console.error('[Database] MongoDB connection error:', err.message);
    process.exit(1);
  }
};

