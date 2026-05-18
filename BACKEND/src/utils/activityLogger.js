import ActivityLog from '../models/ActivityLog.js';
import logger from '../config/logger.js';

export const logActivity = async ({
  user,
  action,
  description,
  ipAddress,
  userAgent,
  metadata = {},
  severity = 'info',
}) => {
  try {
    await ActivityLog.create({
      user: user || null,
      action,
      description,
      ipAddress,
      userAgent,
      metadata,
      severity,
    });
  } catch (error) {
    logger.error('Failed to log activity:', error);
  }
};

export const getClientInfo = (req) => {
  return {
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent') || 'Unknown',
  };
};
