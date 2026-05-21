import express from 'express';
import {
  createChallenge,
  getAllChallenges,
  getChallengeById,
  submitChallenge,
  gradeSubmission,
  deleteChallenge,
} from '../controllers/challengeController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getAllChallenges);
router.get('/:challengeId', getChallengeById);

router.post('/', authorize('super_admin', 'admin', 'instructor'), createChallenge);
router.post('/:challengeId/submit', authorize('student'), submitChallenge);
router.patch(
  '/:challengeId/submissions/:submissionId/grade',
  authorize('super_admin', 'admin', 'instructor'),
  gradeSubmission
);
router.delete('/:challengeId', authorize('super_admin', 'admin', 'instructor'), deleteChallenge);

export default router;
