import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';

const router = Router();

router.get('/dashboard', AdminController.getDashboard);
router.get('/landscapers', AdminController.getLandscapers);
router.put('/landscapers/:id/verify', AdminController.verifyLandscaper);
router.get('/matching', AdminController.getMatching);
router.put('/matching/:id/assign', AdminController.assignMatching);
router.put('/simulations/:id/review', AdminController.reviewSimulation);
router.get('/species', AdminController.getSpecies);
router.post('/species', AdminController.createOrUpdateSpecies);

export default router;

