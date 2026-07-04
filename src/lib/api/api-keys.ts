/**
 * Local API key management.
 *
 * Keys are generated in the browser and only the SHA-256 hash is stored in
 * Supabase. The plaintext key is shown once and never persisted.
 */

import { createClient } from '@/lib/supabase/client';
import { ApiError } from './client';

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
}

export interface CreatedApiKey extends ApiKey {
  plaintext_key: string;
  warning: string;
}

export async function listApiKeys(): Promise<ApiKey[]> {
  const supabase = createClient();
  if (!supabase) throw new ApiError('Supabase is not configured', 500);

  const { data, error } = await supabase
    .from('api_keys')
    .select('id, name, key_prefix, created_at, last_used_at')
    .order('created_at', { ascending: false });

  if (error) throw new ApiError(error.message, 400, error.code);
  return (data ?? []) as ApiKey[];
}

export async function createApiKey(name: string): Promise<CreatedApiKey> {
  const supabase = createClient();
  if (!supabase) throw new ApiError('Supabase is not configured', 500);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw new ApiError(userError.message, 401);
  if (!user) throw new ApiError('You must be signed in to create an API key', 401);

  const plaintext = generatePlaintextKey();
  const keyHash = await sha256Hex(plaintext);
  const keyPrefix = plaintext.slice(0, 8);

  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      user_id: user.id,
      name,
      key_hash: keyHash,
      key_prefix: keyPrefix,
    })
    .select('id, name, key_prefix, created_at, last_used_at')
    .single();

  if (error) throw new ApiError(error.message, 400, error.code);

  return {
    ...(data as ApiKey),
    plaintext_key: plaintext,
    warning: 'Store this key securely. It will not be shown again.',
  };
}

function generatePlaintextKey(): string {
  const bytes = new Uint8Array(30);
  crypto.getRandomValues(bytes);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `te_${btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')}`;
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
