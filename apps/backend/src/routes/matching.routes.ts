import { Router } from 'express';
import { MatchingController } from '../controllers/matching.controller';

const router = Router();

router.get('/landscapers', MatchingController.getLandscapers);
router.get('/landscapers/:id', MatchingController.getLandscaperById);

router.post('/requests', MatchingController.createRequest);
router.get('/requests', MatchingController.getRequests);
router.get('/requests/:id', MatchingController.getRequestById);
router.post('/requests/:id/quotes', MatchingController.submitQuote);
router.put('/requests/:id/accept-quote', MatchingController.acceptQuote);
router.post('/requests/:id/complete', MatchingController.completeJob);
router.post('/requests/:id/review', MatchingController.reviewJob);

export default router;

