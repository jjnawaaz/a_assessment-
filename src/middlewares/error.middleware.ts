import type { ErrorRequestHandler } from "express";

/**
 * Custom application error that carries an HTTP status code.
 *
 * Used to represent expected application-level errors and communicate
 * appropriate HTTP responses through the centralized error middleware.
 *
 * @param message - Descriptive error message.
 * @param statusCode - HTTP status code associated with the error. Defaults to 500.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
  ) {
    super(message);

    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Centralized Express error-handling middleware.
 *
 * Handles application errors by returning their associated HTTP status
 * codes and messages. Unexpected errors are logged and returned as
 * generic 500 responses to avoid exposing internal implementation details.
 *
 * @param err - Error passed through the Express middleware chain.
 * @param _req - Express request object (unused).
 * @param res - Express response used to return the error payload.
 * @param _next - Express next function (unused).
 * @returns A JSON error response.
 */
export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  console.error("Unexpected server error:", err);

  res.status(500).json({
    error: "Internal server error",
  });
};
