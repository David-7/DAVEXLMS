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

  const cookieOptions = {
    expires: new Date(Date.now() + config.jwtCookieExpire * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'none',
  };

  res.cookie('token', accessToken, cookieOptions);
  res.cookie('refreshToken', refreshToken, cookieOptions);

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
