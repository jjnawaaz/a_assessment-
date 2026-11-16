export interface CreatePasteInput {
  content: string;
  expiresAt?: string;
  maxViews?: number;
}

export interface PasteResponse {
  id: string;
  content: string;
  createdAt: Date;
  expiresAt: Date | null;
  maxViews: number | null;
  viewCount: number;
}

export interface CreatePasteResponse {
  id: string;
  url: string;
  expiresAt: Date | null;
  maxViews: number | null;
}

export interface ErrorResponse {
  error: string;
}
