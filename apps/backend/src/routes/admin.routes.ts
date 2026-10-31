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

// 회원 관리 (P55-ADMIN-USERS)
router.get('/users', AdminController.getUsers);
router.post('/users', AdminController.createUser);
router.put('/users/:id', AdminController.updateUser);
router.delete('/users/:id', AdminController.deleteUser);

export default router;

