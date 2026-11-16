import { nanoid } from "nanoid";

const PASTE_ID_LENGTH = 12;

export const generatePasteId = (): string => {
  return nanoid(PASTE_ID_LENGTH);
};
