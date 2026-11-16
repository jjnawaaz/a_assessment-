import prisma from "../lib/prisma.js";
import { AppError } from "../middlewares/error.middleware.js";
import { generatePasteId } from "../utils/generate-id.js";
import type { CreatePasteInput, PasteResponse } from "../types/paste.types.js";

export const createPaste = async (
  input: CreatePasteInput,
): Promise<PasteResponse> => {
  const { content, expiresAt, maxViews } = input;

  // Validate content
  if (typeof content !== "string" || content.length === 0) {
    throw new AppError("Content is required", 400);
  }

  // Validate expiration date
  let expirationDate: Date | null = null;

  if (expiresAt !== undefined) {
    expirationDate = new Date(expiresAt);

    if (Number.isNaN(expirationDate.getTime())) {
      throw new AppError("Invalid expiration date", 400);
    }

    if (expirationDate <= new Date()) {
      throw new AppError("Expiration date must be in the future", 400);
    }
  }

  // Validate maximum views
  if (maxViews !== undefined && (!Number.isInteger(maxViews) || maxViews < 1)) {
    throw new AppError("maxViews must be a positive integer", 400);
  }

  const paste = await prisma.paste.create({
    data: {
      id: generatePasteId(),
      content,
      expiresAt: expirationDate,
      maxViews: maxViews ?? null,
    },
  });

  return paste;
};

export const getPaste = async (id: string): Promise<PasteResponse> => {
  const now = new Date();

  // Atomically increment the view count only if the paste
  // exists and has not expired or exhausted its view limit.
  const updatedPastes = await prisma.paste.updateManyAndReturn({
    where: {
      id,
      AND: [
        {
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
        {
          OR: [
            { maxViews: null },
            { viewCount: { lt: prisma.paste.fields.maxViews } },
          ],
        },
      ],
    },
    data: {
      viewCount: {
        increment: 1,
      },
    },
  });

  const paste = updatedPastes[0];

  if (!paste) {
    throw new AppError("Paste not found or unavailable", 404);
  }

  return paste;
};
