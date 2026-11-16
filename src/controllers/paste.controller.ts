import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";
import { createPaste, getPaste } from "../services/paste.service.js";

import type { CreatePasteInput } from "../types/paste.types.js";
import { AppError } from "../middlewares/error.middleware.js";

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
