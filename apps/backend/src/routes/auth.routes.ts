import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', AuthController.me);
router.get('/demo-users', AuthController.getDemoUsers);
router.put('/users/:id/roles', AuthController.updateUserRoles);

export default router;
