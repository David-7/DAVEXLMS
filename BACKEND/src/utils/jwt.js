import jwt from 'jsonwebtoken';
import config from '../config/env.js';

export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpire,
  });
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwtRefreshSecret);
  } catch (error) {
    return null;
  }
};

export const sendTokenResponse = (user, statusCode, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'none',
    partitioned: true,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'none',
    partitioned: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const userResponse = {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    status: user.status,
    plan: user.plan,
    accountNumber: user.accountNumber,
    admissionNumber: user.admissionNumber,
    profilePhoto: user.profilePhoto,
  };

  res.status(statusCode).json({
    success: true,
    accessToken,
    refreshToken,
    user: userResponse,
  });
};
