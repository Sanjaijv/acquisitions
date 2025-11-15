import { jwttoken } from '#utils/jwt.js';
import logger from '#config/logger.js';
import cookies from '#utils/cookies.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const token = cookies.get(req, 'token');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwttoken.verify(token);
    req.user = decoded; // Attach user info to request
    next();
  } catch (e) {
    logger.error('Authentication error:', e);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};