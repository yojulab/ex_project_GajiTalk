import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// ./backend/.env (apps/backend/.env) 우선 탐색 로드
const candidateEnvPaths = [
  path.resolve(__dirname, '../../.env'),
  path.resolve(process.cwd(), 'apps/backend/.env'),
  path.resolve(process.cwd(), 'backend/.env'),
  path.resolve(process.cwd(), '.env')
];

for (const envPath of candidateEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://admin:admin123@external_project_db_mongo:27017/soohyung?authSource=admin';

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

