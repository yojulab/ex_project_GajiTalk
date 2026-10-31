import { Router } from 'express';
import { SimulationController } from '../controllers/simulation.controller';

const router = Router();

router.post('/analyze', SimulationController.analyze);
router.get('/', SimulationController.list);
router.get('/:id', SimulationController.getById);
router.post('/:id/re-render', SimulationController.reRender);

export default router;

