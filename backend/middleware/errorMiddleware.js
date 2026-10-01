const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Sequelize Unique Constraint Error
  if (err.name === "SequelizeUniqueConstraintError") {
    statusCode = 409;
    const field = err.errors && err.errors[0] ? err.errors[0].path : "field";
    message = `Duplicate value for field: ${field}`;
  }

  // Sequelize Validation Error
  if (err.name === "SequelizeValidationError") {
    statusCode = 400;
    message = err.errors
      ? err.errors.map((e) => e.message).join(", ")
      : err.message;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token has expired";
  }

  // Never send stack trace in production
  if (process.env.NODE_ENV === "development") {
    console.error(`[ERROR] ${statusCode} – ${message}`, err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
