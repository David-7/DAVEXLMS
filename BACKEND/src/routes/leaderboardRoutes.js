import express from 'express';
import { getLeaderboard, getMyRank, awardBadge } from '../controllers/leaderboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getLeaderboard);
router.get('/my-rank', getMyRank);
router.post('/badges/:studentId', authorize('super_admin', 'admin'), awardBadge);

export default router;
