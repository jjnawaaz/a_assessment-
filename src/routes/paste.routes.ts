import { Router } from "express";

import {
  createPasteController,
  getPasteController,
} from "../controllers/paste.controller.js";

/**
 * Defines the HTTP routes for paste-related operations.
 *
 * Maps incoming requests to their corresponding controllers:
 * - POST /       Creates a new paste.
 * - GET /:id     Retrieves an existing paste by its unique identifier.
 *
 * Mounted under the /api/pastes base path in the Express application.
 */
const pasteRouter = Router();

pasteRouter.post("/", createPasteController);

pasteRouter.get("/:id", getPasteController);

export default pasteRouter;
