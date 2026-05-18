import express from 'express';
import {
  createChallenge,
  getAllChallenges,
  getChallengeById,
  submitChallenge,
  evaluateSubmission,
  deleteChallenge,
} from '../controllers/challengeController.js';
import { protect, authorize } from '../middleware/auth.js';
import { challengeSubmissionLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(protect);

router.get('/', getAllChallenges);
router.get('/:challengeId', getChallengeById);

router.post('/', authorize('super_admin', 'admin', 'instructor'), createChallenge);
router.post('/:challengeId/submit', challengeSubmissionLimiter, submitChallenge);
router.patch(
  '/:challengeId/submissions/:submissionId/evaluate',
  authorize('super_admin', 'admin', 'instructor'),
  evaluateSubmission
);
router.delete('/:challengeId', authorize('super_admin', 'admin'), deleteChallenge);

export default router;
