import { Router } from 'express';
import { GardenController } from '../controllers/garden.controller';

const router = Router();

router.get('/my', GardenController.getMyGarden);
router.post('/', GardenController.createGarden);
router.post('/:id/trees', GardenController.addTree);

export default router;

