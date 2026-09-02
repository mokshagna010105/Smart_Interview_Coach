import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';

/**
 * Generate short-lived JWT Access Token
 * @param {object} user - User object containing _id, email, and role
 * @returns {string}
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN || '15m'
    }
  );
};

/**
 * Generate secure random refresh token string
 * @returns {string}
 */
export const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

/**
 * Generate secure random reset token
 * @returns {string}
 */
export const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash raw token with SHA-256 before database storage
 * @param {string} token
 * @returns {string}
 */
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Verify JWT Access Token
 * @param {string} token
 * @returns {object} Decoded payload
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
};
