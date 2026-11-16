import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";
import { createPaste, getPaste } from "../services/paste.service.js";

import type { CreatePasteInput } from "../types/paste.types.js";
import { AppError } from "../middlewares/error.middleware.js";

/**
 * Handles the creation of a new paste.
 *
 * Delegates input validation and persistence to the paste service,
 * then returns the created paste's ID, shareable URL, and optional
 * expiration and view-limit metadata.
 *
 * @route POST /api/pastes
 * @param req - Express request containing the paste creation payload.
 * @param res - Express response used to return the created paste.
 * @param next - Express middleware function for forwarding errors.
 * @returns A 201 Created response containing the paste metadata.
 */
export const createPasteController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const input = req.body as CreatePasteInput;

    const paste = await createPaste(input);

    res.status(201).json({
      id: paste.id,
      url: `${env.APP_URL}/p/${paste.id}`,
      expiresAt: paste.expiresAt,
      maxViews: paste.maxViews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles retrieval of an existing paste.
 *
 * Validates the paste identifier, delegates availability checks and
 * view-count management to the paste service, and returns the paste
 * content along with its metadata.
 *
 * A successful retrieval consumes one view.
 *
 * @route GET /api/pastes/:id
 * @param req - Express request containing the paste ID as a route parameter.
 * @param res - Express response used to return the paste data.
 * @param next - Express middleware function for forwarding errors.
 * @returns A 200 OK response containing the paste data.
 * @throws {AppError} 400 - If the paste ID is invalid.
 * @throws {AppError} 404 - If the paste does not exist or is unavailable.
 */
export const getPasteController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      throw new AppError("Invalid paste ID", 400);
    }

    const paste = await getPaste(id);

    res.status(200).json({
      id: paste.id,
      content: paste.content,
      createdAt: paste.createdAt,
      expiresAt: paste.expiresAt,
      maxViews: paste.maxViews,
      viewCount: paste.viewCount,
    });
  } catch (error) {
    next(error);
  }
};
