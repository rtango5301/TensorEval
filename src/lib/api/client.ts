/**
 * API Client
 * Core API client with Supabase JWT token injection for authenticated requests
 */

import { createClient } from '@/lib/supabase/client';
import { getApiUrl } from './config';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isValidationError(): boolean {
    return this.status === 400;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }

  get isRateLimited(): boolean {
    return this.status === 429 || this.code === 'RATE_LIMIT_EXCEEDED';
  }
}

/**
 * In-memory token cache to avoid calling supabase.auth.getSession() on every request
 */
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Clears the cached auth token. Call this on logout.
 */
export function clearTokenCache() {
  cachedToken = null;
  tokenExpiresAt = 0;
}

/**
 * Gets the current user's JWT access token from Supabase
 * Uses an in-memory cache to avoid redundant getSession() calls
 * @returns The access token or null if not authenticated
 */
async function getAccessToken(): Promise<string | null> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  const supabase = createClient();
  if (!supabase) return null;
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    cachedToken = session.access_token;
    // Cache until 60 seconds before expiry (session.expires_at is in seconds)
    tokenExpiresAt = session.expires_at ? session.expires_at * 1000 - 60000 : now + 4 * 60 * 1000; // default 4 min cache
  } else {
    cachedToken = null;
    tokenExpiresAt = 0;
  }

  return cachedToken;
}

/**
 * Builds headers for API requests, including JWT authentication
 */
async function buildHeaders(includeAuth: boolean = true): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = await getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * Handles API response and throws ApiError for non-ok responses
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const genericMessages: Record<number, string> = {
      400: 'Invalid request. Please check your input.',
      401: 'Your session has expired. Please sign in again.',
      403: 'You do not have permission to perform this action.',
      404: 'The requested resource was not found.',
      429: 'Too many requests. Please try again later.',
    };

    let code: string | undefined;
    try {
      const errorData = await response.json();
      code = errorData.code;
    } catch {
      // Response body is not JSON
    }

    const message =
      genericMessages[response.status] ||
      (response.status >= 500
        ? 'A server error occurred. Please try again later.'
        : `Request failed (${response.status}).`);

    throw new ApiError(message, response.status, code);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * Makes a GET request to the API
 * @param path - API endpoint path
 * @param requireAuth - Whether to include JWT token (default: true)
 */
export async function apiGet<T>(path: string, requireAuth: boolean = true): Promise<T> {
  const headers = await buildHeaders(requireAuth);
  const response = await fetch(getApiUrl(path), {
    method: 'GET',
    headers,
  });
  return handleResponse<T>(response);
}

/**
 * Makes a POST request to the API
 * @param path - API endpoint path
 * @param body - Request body
 * @param requireAuth - Whether to include JWT token (default: true)
 */
export async function apiPost<T>(
  path: string,
  body: unknown,
  requireAuth: boolean = true
): Promise<T> {
  const headers = await buildHeaders(requireAuth);
  const response = await fetch(getApiUrl(path), {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

/**
 * Makes a DELETE request to the API
 * @param path - API endpoint path
 * @param requireAuth - Whether to include JWT token (default: true)
 */
export async function apiDelete<T>(path: string, requireAuth: boolean = true): Promise<T> {
  const headers = await buildHeaders(requireAuth);
  const response = await fetch(getApiUrl(path), {
    method: 'DELETE',
    headers,
  });
  return handleResponse<T>(response);
}
