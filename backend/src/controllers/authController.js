import authService from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

class AuthController {
  async register(req, res, next) {
    try {
      const { email, password, fullName } = req.body;
      const result = await authService.register({ email, password, fullName });

      // Set refresh token cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return sendSuccess(res, result, 'User registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });

      // Set refresh token cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return sendSuccess(res, result, 'Login successful', 200);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      const result = await authService.refreshAccessToken(rawRefreshToken);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return sendSuccess(res, result, 'Access token refreshed successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      await authService.logout(rawRefreshToken, req.user?.userId);

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      return sendSuccess(res, null, 'Logged out successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);
      return sendSuccess(res, result, result.message, 200);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      const result = await authService.resetPassword(token, newPassword);
      return sendSuccess(res, result, result.message, 200);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const result = await authService.getCurrentUser(req.user.userId);
      return sendSuccess(res, result, 'User identity retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
export default authController;
