import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import User from '../models/User.js';
import { AppError } from '../utils/errorHandler.js';
import logger from '../config/logger.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new AppError('Not authorized to access this route', 401));
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret);

      const user = await User.findById(decoded.id).select('-password -refreshToken');

      if (!user) {
        return next(new AppError('User no longer exists', 401));
      }

      if (user.status === 'blocked' || user.status === 'suspended') {
        return next(new AppError('Account blocked, please contact admin', 403));
      }

      if (user.isDeleted) {
        return next(new AppError('Account has been deleted', 403));
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return next(new AppError('Token expired, please login again', 401));
      }
      return next(new AppError('Invalid token', 401));
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    next(new AppError('Authentication failed', 401));
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authorized', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`Role ${req.user.role} is not authorized to access this route`, 403)
      );
    }

    next();
  };
};

export const checkAccountStatus = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Not authorized', 401));
  }

  if (req.user.status !== 'active') {
    return next(new AppError('Account is not active', 403));
  }

  next();
};

export const checkPremium = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Not authorized', 401));
  }

  if (req.user.plan !== 'premium') {
    return next(new AppError('This feature is only available for premium users', 403));
  }

  next();
};
