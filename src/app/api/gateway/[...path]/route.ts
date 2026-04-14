import { NextRequest, NextResponse } from 'next/server';

/**
 * Load Balancer API Gateway
 *
 * Proxies requests to a randomly selected backend worker.
 * Retries once on a different worker if the first attempt fails (5xx or network error).
 *
 * Workers are configured via the WORKER_URLS environment variable (comma-separated).
 */

const TIMEOUT_MS = 30_000;

function getWorkerUrls(): string[] {
  const raw = process.env.WORKER_URLS;
  if (raw) {
    return raw
      .split(',')
      .map((u) => u.trim())
      .filter(Boolean);
  }

  // Fallback to single backend URL
  const fallback =
    process.env.TENSOREVALS_BACKEND_URL || 'https://shivam274-tensorevalengine.hf.space';
  return [fallback];
}

/** Pick a random worker, optionally excluding one URL */
function pickWorker(workers: string[], exclude?: string): string | null {
  const candidates = exclude ? workers.filter((w) => w !== exclude) : workers;
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * Build headers for the backend worker.
 * - Replaces Authorization with HF proxy token
 * - Maps the client's Supabase JWT to X-Supabase-Auth
 * - Strips hop-by-hop headers
 */
function forwardHeaders(req: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};
  const skipHeaders = new Set([
    'host',
    'connection',
    'keep-alive',
    'transfer-encoding',
    'authorization', // handled separately below
  ]);

  req.headers.forEach((value, key) => {
    if (!skipHeaders.has(key.toLowerCase())) {
      headers[key] = value;
    }
  });

  // HF proxy authentication
  const hfToken = process.env.TENSOREVALS_BACKEND_API_KEY;
  if (hfToken) {
    headers['Authorization'] = `Bearer ${hfToken}`;
  }

  // Forward the client's Supabase JWT as X-Supabase-Auth
  const clientAuth = req.headers.get('authorization');
  if (clientAuth) {
    headers['X-Supabase-Auth'] = clientAuth;
  }

  return headers;
}

async function proxyRequest(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const workers = getWorkerUrls();

  if (workers.length === 0) {
    return NextResponse.json({ error: 'No workers configured' }, { status: 503 });
  }

  const { path } = await params;
  const targetPath = '/' + path.join('/');
  const searchParams = req.nextUrl.search; // includes the leading '?'
  const fullPath = `${targetPath}${searchParams}`;

  const method = req.method;
  const headers = forwardHeaders(req);

  // Read body once for potential retry
  let body: ArrayBuffer | null = null;
  if (method !== 'GET' && method !== 'HEAD') {
    body = await req.arrayBuffer();
  }

  const firstWorker = pickWorker(workers)!;
  const result = await attemptFetch(firstWorker, fullPath, method, headers, body);

  if (result.ok) {
    return result.response;
  }

  // Retry on a different worker
  const secondWorker = pickWorker(workers, firstWorker);
  if (!secondWorker) {
    // Only one worker configured, return the original error
    return result.response;
  }

  const retry = await attemptFetch(secondWorker, fullPath, method, headers, body);
  return retry.response;
}

async function attemptFetch(
  workerUrl: string,
  path: string,
  method: string,
  headers: Record<string, string>,
  body: ArrayBuffer | null
): Promise<{ ok: boolean; response: NextResponse }> {
  const url = `${workerUrl}${path}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(url, {
      method,
      headers,
      body: body && body.byteLength > 0 ? body : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // Treat 5xx as a failure worth retrying
    if (res.status >= 500) {
      const responseBody = await res.text();
      return {
        ok: false,
        response: new NextResponse(responseBody, {
          status: res.status,
          headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
        }),
      };
    }

    // Success — forward the response
    const responseBody = await res.arrayBuffer();
    const responseHeaders = new Headers();
    res.headers.forEach((value, key) => {
      const skip = ['transfer-encoding', 'connection', 'keep-alive'];
      if (!skip.includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    return {
      ok: true,
      response: new NextResponse(responseBody, {
        status: res.status,
        headers: responseHeaders,
      }),
    };
  } catch (error) {
    // Network error or timeout
    const message = error instanceof Error ? error.message : 'Worker unreachable';
    return {
      ok: false,
      response: NextResponse.json({ error: `Gateway error: ${message}` }, { status: 502 }),
    };
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const PATCH = proxyRequest;
