import { nanoid } from "nanoid";

/** Number of characters used in generated paste identifiers. */
const PASTE_ID_LENGTH = 12;

/**
 * Generates a unique identifier for a paste using Nano ID.
 *
 * Uses a fixed identifier length to produce compact, URL-friendly
 * IDs suitable for sharing paste links.
 *
 * @returns A randomly generated 12-character paste identifier.
 */
export const generatePasteId = (): string => {
  return nanoid(PASTE_ID_LENGTH);
};
