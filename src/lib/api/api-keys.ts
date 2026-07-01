/**
 * API Keys client — create/list/revoke SDK API keys via the backend.
 */

import { apiGet, apiPost, apiDelete } from './client';

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  active: boolean;
}

export interface CreatedApiKey extends ApiKey {
  plaintext_key: string;
  warning: string;
}

export async function listApiKeys(): Promise<ApiKey[]> {
  const data = await apiGet<{ api_keys: ApiKey[] }>('/api/api-keys');
  return data.api_keys;
}

export async function createApiKey(name: string): Promise<CreatedApiKey> {
  return apiPost<CreatedApiKey>('/api/api-keys', { name });
}

export async function revokeApiKey(id: string): Promise<{ revoked: boolean }> {
  return apiDelete<{ revoked: boolean }>(`/api/api-keys/${id}`);
}
