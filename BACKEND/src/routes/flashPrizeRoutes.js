import express from 'express';
import {
  createFlashPrize,
  getActivePrizes,
  claimPrize,
  getAllPrizes,
  deletePrize,
} from '../controllers/flashPrizeController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/active', getActivePrizes);
router.post('/:prizeId/claim', claimPrize);

router.post('/', authorize('super_admin', 'admin'), createFlashPrize);
router.get('/', authorize('super_admin', 'admin'), getAllPrizes);
router.delete('/:prizeId', authorize('super_admin', 'admin'), deletePrize);

export default router;
