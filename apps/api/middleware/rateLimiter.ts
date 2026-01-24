import rateLimit from "express-rate-limit";

/**
 * Rate limiter for authentication login endpoint
 * Prevents brute force attacks by limiting login attempts
 * 5 attempts per 15 minutes per IP
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message:
    "Too many login attempts from this IP, please try again after 15 minutes",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for successful requests (only count failed attempts)
  skipSuccessfulRequests: true,
});

/**
 * Rate limiter for authentication registration endpoint
 * Prevents spam account creation
 * 3 attempts per hour per IP
 */
export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per windowMs
  message:
    "Too many registration attempts from this IP, please try again after an hour",
  standardHeaders: true,
  legacyHeaders: false,
});
