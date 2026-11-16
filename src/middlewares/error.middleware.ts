import type { ErrorRequestHandler } from "express";

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
