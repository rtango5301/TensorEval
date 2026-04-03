/**
 * URL validation utilities shared between client and server.
 */

/**
 * Client-safe URL validation that blocks internal/private addresses.
 */
export function isValidExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    const hostname = parsed.hostname.toLowerCase();

    // Block IPv4 private/reserved
    if (
      hostname === 'localhost' ||
      hostname === '0.0.0.0' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
      hostname === '169.254.169.254'
    ) {
      return false;
    }

    // Block IPv6 literals
    if (
      hostname === '[::1]' ||
      hostname === '[::ffff:127.0.0.1]' ||
      hostname.startsWith('[fe80:') ||
      hostname.startsWith('[fc00:') ||
      hostname.startsWith('[fd') ||
      hostname.startsWith('[::ffff:10.') ||
      hostname.startsWith('[::ffff:192.168.') ||
      hostname.startsWith('[::ffff:169.254.')
    ) {
      return false;
    }

    // Block dangerous suffixes
    if (
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.localhost')
    ) {
      return false;
    }

    // Block cloud metadata endpoints
    if (hostname === 'metadata.google.internal' || hostname === 'instance-data') {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Server-only: resolve DNS and check that ALL resolved IPs (v4 + v6) are not private.
 * Fails closed: if DNS resolution fails or returns zero records, the request is blocked.
 */
export async function isResolvedIpSafe(hostname: string): Promise<boolean> {
  try {
    const dns = await import('dns');
    const { promisify } = await import('util');
    const resolve4 = promisify(dns.resolve4);
    const resolve6 = promisify(dns.resolve6);

    const allAddresses: string[] = [];

    // Resolve IPv4
    try {
      const v4 = await resolve4(hostname);
      allAddresses.push(...v4);
    } catch {
      // No A records — that's fine, check AAAA
    }

    // Resolve IPv6
    try {
      const v6 = await resolve6(hostname);
      allAddresses.push(...v6);
    } catch {
      // No AAAA records — that's fine
    }

    // If NO records resolved at all, fail closed
    if (allAddresses.length === 0) {
      return false;
    }

    for (const ip of allAddresses) {
      if (isPrivateIp(ip)) return false;
    }
    return true;
  } catch {
    // Any unexpected error: fail closed
    return false;
  }
}

function isPrivateIp(ip: string): boolean {
  // IPv4
  if (ip.includes('.') && !ip.includes(':')) {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some((p) => isNaN(p))) return true;
    if (parts[0] === 10) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 127) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts[0] === 0) return true;
    return false;
  }

  // IPv6
  const normalized = ip.toLowerCase();
  if (normalized === '::1') return true;
  if (normalized.startsWith('fe80:')) return true; // link-local
  if (normalized.startsWith('fc00:') || normalized.startsWith('fd')) return true; // ULA
  if (normalized.startsWith('::ffff:')) {
    // IPv4-mapped IPv6 — extract and check the IPv4 part
    const v4Part = normalized.slice(7);
    if (v4Part.includes('.')) return isPrivateIp(v4Part);
  }

  return false;
}
