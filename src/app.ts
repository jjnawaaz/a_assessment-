import express from "express";
import cors from "cors";

import pasteRouter from "./routes/paste.routes.js";
import { getPastePageController } from "./controllers/paste-page.controller.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

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
