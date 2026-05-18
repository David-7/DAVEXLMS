import rateLimit from 'express-rate-limit';
import config from '../config/env.js';

export const generalLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later',
    });
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again after 15 minutes',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts, please try again after 15 minutes',
    });
  },
});

export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many password reset attempts, please try again after an hour',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many password reset attempts, please try again later',
    });
  },
});

export const challengeSubmissionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many submissions, please slow down',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many submissions, please slow down',
    });
  },
});

export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Too many search requests, please slow down',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many search requests, please slow down',
    });
  },
});

export const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Too many messages, please slow down',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Sending messages too fast, please slow down',
    });
  },
});
