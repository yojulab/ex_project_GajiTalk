import { Router } from 'express';
import authRoutes from './auth.routes';
import simulationRoutes from './simulation.routes';
import gardenRoutes from './garden.routes';
import matchingRoutes from './matching.routes';
import adminRoutes from './admin.routes';
import { MatchingController } from '../controllers/matching.controller';
import { AdminController } from '../controllers/admin.controller';

const router = Router();

router.use('/auth', authRoutes);
router.use('/simulations', simulationRoutes);
router.use('/gardens', gardenRoutes);
router.use('/matching', matchingRoutes);
router.use('/admin', adminRoutes);

// WORK_ORDER.md 5장 표의 직속 엔드포인트 직접 매핑
router.get('/landscapers', MatchingController.getLandscapers);
router.get('/landscapers/:id', MatchingController.getLandscaperById);
router.get('/species', AdminController.getSpecies);

router.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'SOOHYUNG Backend API',
    port: 30020,
    timestamp: new Date().toISOString()
  });
});

export default router;

