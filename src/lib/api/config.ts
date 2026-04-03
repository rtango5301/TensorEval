/**
 * API Configuration
 * Environment-based API URL configuration for TensorEvalEngine backend
 */

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '',
} as const;

/**
 * Constructs the full API URL for a given path
 * @param path - API endpoint path (e.g., '/api/datasets')
 * @returns Full URL with base URL prepended
 */
export function getApiUrl(path: string): string {
  return `${API_CONFIG.baseUrl}${path}`;
}
