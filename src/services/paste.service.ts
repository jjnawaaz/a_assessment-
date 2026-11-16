import prisma from "../lib/prisma.js";
import { AppError } from "../middlewares/error.middleware.js";
import { generatePasteId } from "../utils/generate-id.js";
import type { CreatePasteInput, PasteResponse } from "../types/paste.types.js";

/**
 * Creates a new paste and persists it to the database.
 *
 * Validates the supplied content and optional constraints before
 * creating the paste. A paste can have an optional expiration date
 * and a maximum number of permitted views.
 *
 * @param input - Paste content and optional expiration/view constraints.
 * @returns The newly created paste, including its generated ID and metadata.
 *
 * @throws {AppError} 400 - If content is missing or invalid.
 * @throws {AppError} 400 - If the expiration date is invalid or not in the future.
 * @throws {AppError} 400 - If maxViews is not a positive integer.
 */
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

/**
 * Retrieves an available paste and atomically consumes one view.
 *
 * A paste is considered available when:
 * - It exists.
 * - It has not passed its expiration time.
 * - Its view count has not reached its configured maximum.
 *
 * Availability checks and the view-count increment are performed
 * in a single database operation. This prevents concurrent requests
 * from exceeding the configured view limit through race conditions.
 *
 * @param id - Unique identifier of the paste to retrieve.
 * @returns The paste with its updated view count.
 *
 * @throws {AppError} 404 - If the paste does not exist, has expired,
 * or has exhausted its view limit.
 */
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
