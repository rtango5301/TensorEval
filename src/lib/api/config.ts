/**
 * API Configuration
 * Routes all backend requests through the server-side load balancer gateway.
 */

export const API_CONFIG = {
  baseUrl: '/api/gateway',
} as const;

/**
 * Constructs the full API URL for a given path
 * @param path - API endpoint path (e.g., '/api/datasets')
 * @returns Full URL routed through the gateway (e.g., '/api/gateway/api/datasets')
 */
export function getApiUrl(path: string): string {
  return `${API_CONFIG.baseUrl}${path}`;
}
