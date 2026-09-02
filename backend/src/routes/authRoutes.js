import { Router } from 'express';
import authController from '../controllers/authController.js';
import validate from '../middleware/validateMiddleware.js';
import requireAuth from '../middleware/authMiddleware.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema
} from '../validators/authValidators.js';

const router = Router();

// Public Auth Endpoints
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// Authenticated Endpoints
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.getMe);

export default router;
