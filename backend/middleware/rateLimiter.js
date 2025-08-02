const rateLimit = require('express-rate-limit');

/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting the number of requests per IP
 */

/**
 * General rate limiter for API endpoints
 */
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      name: 'RateLimitError',
      message: 'Too many requests from this IP, please try again later.'
    }
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        name: 'RateLimitError',
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.round(req.rateLimit.resetTime / 1000)
      }
    });
  }
});

/**
 * Strict rate limiter for authentication endpoints
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth endpoints
  message: {
    success: false,
    error: {
      name: 'RateLimitError',
      message: 'Too many authentication attempts, please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        name: 'RateLimitError',
        message: 'Too many authentication attempts from this IP, please try again later.',
        retryAfter: Math.round(req.rateLimit.resetTime / 1000)
      }
    });
  }
});

/**
 * Moderate rate limiter for order creation
 */
const orderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 order requests per minute
  message: {
    success: false,
    error: {
      name: 'RateLimitError',
      message: 'Too many order requests, please slow down.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        name: 'RateLimitError',
        message: 'Too many order requests from this IP, please slow down.',
        retryAfter: Math.round(req.rateLimit.resetTime / 1000)
      }
    });
  }
});

/**
 * Lenient rate limiter for public endpoints (menu, etc.)
 */
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs for public endpoints
  message: {
    success: false,
    error: {
      name: 'RateLimitError',
      message: 'Too many requests, please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        name: 'RateLimitError',
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.round(req.rateLimit.resetTime / 1000)
      }
    });
  }
});

/**
 * Very strict rate limiter for admin operations
 */
const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 admin requests per minute
  message: {
    success: false,
    error: {
      name: 'RateLimitError',
      message: 'Too many admin requests, please slow down.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        name: 'RateLimitError',
        message: 'Too many admin requests from this IP, please slow down.',
        retryAfter: Math.round(req.rateLimit.resetTime / 1000)
      }
    });
  }
});

/**
 * Custom rate limiter factory
 * @param {Object} options - Rate limiter options
 * @returns {Function} Rate limiter middleware
 */
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: {
          name: 'RateLimitError',
          message: options.message || 'Too many requests, please try again later.',
          retryAfter: Math.round(req.rateLimit.resetTime / 1000)
        }
      });
    }
  };

  return rateLimit({ ...defaultOptions, ...options });
};

module.exports = {
  apiLimiter,
  authLimiter,
  orderLimiter,
  publicLimiter,
  adminLimiter,
  createRateLimiter
};