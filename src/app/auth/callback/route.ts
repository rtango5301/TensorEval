import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';

function getRedirectOrigin(request: NextRequest, fallbackOrigin: string) {
  // In production on Vercel, use x-forwarded-host to get the real domain
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  const forwardedHost = request.headers.get('x-forwarded-host');
  if (forwardedHost && process.env.NODE_ENV !== 'development') {
    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      // In production without SITE_URL, don't trust forwarded headers
      return fallbackOrigin;
    }
    const proto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() || 'https';
    return `${proto}://${forwardedHost}`;
  }
  return fallbackOrigin;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const redirectOrigin = getRedirectOrigin(request, origin);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const error_description = searchParams.get('error_description');

  // Handle OAuth errors from provider
  if (error) {
    const errorUrl = new URL('/login', redirectOrigin);
    errorUrl.searchParams.set('error', 'auth_failed');
    return NextResponse.redirect(errorUrl);
  }

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(`${redirectOrigin}/login?error=auth_not_configured`);
    }

    // Create Supabase client directly with explicit cookie handling
    // (no try-catch that swallows errors like the shared createClient)
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    });

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      const next = searchParams.get('next') ?? '/dashboard';
      // Validate redirect target to prevent open redirect attacks
      const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
      const targetUrl = new URL(safeNext, redirectOrigin);
      if (targetUrl.origin !== new URL(redirectOrigin).origin) {
        return NextResponse.redirect(`${redirectOrigin}/dashboard`);
      }
      return NextResponse.redirect(targetUrl);
    }

    const allCookies = cookieStore.getAll();
    const codeVerifierCookie = allCookies.find((c) => c.name.includes('code-verifier'));

    console.error('[auth/callback] Code exchange failed:', {
      message: exchangeError.message,
      code: exchangeError.code,
      siteUrlSet: !!process.env.NEXT_PUBLIC_SITE_URL,
      hasCodeVerifierCookie: !!codeVerifierCookie,
    });
  }

  return NextResponse.redirect(`${redirectOrigin}/login?error=auth_failed`);
}
