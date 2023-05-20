const rateLimit = require('express-rate-limit');

const resendOTPLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 3, //maximum of 3 requests per minute
    message: 'Too many OTP resend requests. Please try again later.',
  });

module.exports = {resendOTPLimiter};