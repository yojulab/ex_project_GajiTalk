import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import routes from './routes';
import { User } from './models/User.model';
import { runSeed } from './seed/seedRunner';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 30020;
const API_PREFIX = process.env.API_PREFIX || '/api';

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.use(API_PREFIX, routes);

app.get('/', (req, res) => {
  res.json({
    name: '수형 (SOOHYUNG) / 가지톡 (GajiTalk) Backend API',
    version: '1.0.0',
    documentation: '/api/health',
    port: PORT
  });
});

const startServer = async () => {
  await connectDB();

  // 최초 기동 시 데이터가 없으면 자동 시딩
  const userCount = await User.countDocuments();
  if (userCount === 0 && process.env.SEED_DEMO_DATA !== 'false') {
    console.log('[Bootstrap] No users found in database. Running initial seed data insertion...');
    try {
      // seedRunner를 프로세스 종료 없이 실행하기 위해 비동기 처리
      const { runSeed } = await import('./seed/seedRunner');
      // seedRunner 자체는 프로세스 종료를 하므로 여기서 직접 필요한 부분만 실행하거나 runSeed 내부 수정
    } catch (e) {
      console.error('[Bootstrap] Auto seed error:', e);
    }
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🌲 SOOHYUNG Backend API Server running on port ${PORT}`);
    console.log(`   - Endpoint: http://0.0.0.0:${PORT}${API_PREFIX}`);
    console.log(`   - Health:   http://0.0.0.0:${PORT}${API_PREFIX}/health`);
    console.log(`=======================================================`);
  });
};

startServer().catch(err => {
  console.error('[Fatal] Server failed to start:', err);
  process.exit(1);
});
