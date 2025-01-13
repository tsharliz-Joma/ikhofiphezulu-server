const rateLimit = require("express-rate-limit");
const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log", level: "error" }),
  ],
});

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 300,
  message: "Too many requests from this IP, please try again after 30 minutes",
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      status: "error",
      message: "Too many requests from this IP, please try again after 30 minutes",
    });
  },
});

const adminLimiter = rateLimit({
  windowMs: 10 * 60 * 2000, // 10 minutes
  max: 50, // Limit each IP to 5 login attempts per window
  message: "Too many login attempts. Please try again later.",
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res
      .status(429)
      .json({ status: "error", message: "Too many login attempts. Please try again later." });
  },
});

module.exports = { limiter, adminLimiter, logger };
