/**
 * Defines the input contract for creating a paste.
 *
 * @property content - Text content to be stored in the paste.
 * @property expiresAt - Optional ISO 8601 expiration timestamp.
 * @property maxViews - Optional maximum number of permitted views.
 */
export interface CreatePasteInput {
  content: string;
  expiresAt?: string;
  maxViews?: number;
}

/**
 * Represents a paste returned by the service layer.
 *
 * Includes the paste content, creation metadata, expiration settings,
 * configured view limit, and current view count.
 */
export interface PasteResponse {
  id: string;
  content: string;
  createdAt: Date;
  expiresAt: Date | null;
  maxViews: number | null;
  viewCount: number;
}

/**
 * Defines the response contract for successfully creating a paste.
 *
 * @property id - Unique identifier assigned to the paste.
 * @property url - Shareable URL for accessing the paste.
 * @property expiresAt - Optional expiration timestamp.
 * @property maxViews - Optional maximum number of permitted views.
 */
export interface CreatePasteResponse {
  id: string;
  url: string;
  expiresAt: Date | null;
  maxViews: number | null;
}

/**
 * Defines the standard JSON structure returned by API error responses.
 *
 * @property error - Human-readable description of the error.
 */
export interface ErrorResponse {
  error: string;
}
