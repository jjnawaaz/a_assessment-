import type { Request, Response, NextFunction } from "express";

import { getPaste } from "../services/paste.service.js";
import { AppError } from "../middlewares/error.middleware.js";

/**
 * Renders a shared paste as an HTML page.
 *
 * Retrieves the paste through the paste service, which also checks
 * its availability and consumes one view. The paste content is HTML-
 * escaped before rendering to prevent stored cross-site scripting (XSS).
 *
 * @route GET /p/:id
 * @param req - Express request containing the paste ID as a route parameter.
 * @param res - Express response used to return the rendered HTML page.
 * @param next - Express middleware function for forwarding errors.
 * @returns A 200 OK response containing the HTML representation of the paste.
 * @throws {AppError} 400 - If the paste ID is invalid.
 * @throws {AppError} 404 - If the paste does not exist or is unavailable.
 */
export const getPastePageController = async (
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

    const escapedContent = paste.content
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

    res.status(200).type("html").send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Shared Paste</title>
          <style>
            body {
              font-family: system-ui, sans-serif;
              max-width: 900px;
              margin: 40px auto;
              padding: 0 20px;
              background: #f8fafc;
              color: #1e293b;
            }

            pre {
              padding: 24px;
              background: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              white-space: pre-wrap;
              overflow-wrap: anywhere;
              line-height: 1.6;
            }
          </style>
        </head>
        <body>
          <h1>Shared Paste</h1>
          <pre>${escapedContent}</pre>
        </body>
      </html>
    `);
  } catch (error) {
    next(error);
  }
};
