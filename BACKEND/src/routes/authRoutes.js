import express from 'express';
import {
  login,
  activateAccount,
  requestPasswordReset,
  resetPassword,
  refreshToken,
  logout,
  getMe,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter.js';
import { sanitizeLoginInput } from '../middleware/sanitizer.js';

const router = express.Router();

router.post('/login', authLimiter, sanitizeLoginInput, login);
router.post('/activate', activateAccount);
router.post('/password-reset/request', passwordResetLimiter, requestPasswordReset);
router.post('/password-reset/reset', resetPassword);
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;
