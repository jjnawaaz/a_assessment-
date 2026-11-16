import express from "express";
import cors from "cors";

import pasteRouter from "./routes/paste.routes.js";
import { getPastePageController } from "./controllers/paste-page.controller.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

/**
 * Configures and initializes the Express application.
 *
 * Registers application-wide middleware for cross-origin requests
 * and JSON/form request parsing, exposes the health-check endpoint,
 * mounts paste-related API routes, and serves browser-based paste pages.
 *
 * Registers the centralized error-handling middleware after all routes
 * to ensure errors from route handlers are handled consistently.
 *
 * @returns The configured Express application instance.
 */
const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Aganitha Assessment API is running",
  });
});

// Paste routes
app.use("/api/pastes", pasteRouter);
app.get("/p/:id", getPastePageController);

// Global error handler
app.use(errorMiddleware);

export default app;
