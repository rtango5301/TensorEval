import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

const PROTECTED_ROUTES = ['/dashboard', '/datasets', '/evaluations'];

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const devAuthBypass = process.env.DEV_AUTH_BYPASS === 'true';

  // Handle missing Supabase configuration
  if (!supabaseUrl || !supabaseAnonKey) {
    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
      request.nextUrl.pathname.startsWith(route)
    );

    if (devAuthBypass) {
      // Explicit dev bypass: allow access only when DEV_AUTH_BYPASS=true and Supabase is not configured
      if (isProtectedRoute) {
        logger.warn('middleware', 'DEV_AUTH_BYPASS active — auth bypassed', {
          path: request.nextUrl.pathname,
        });
      }
      return NextResponse.next({ request });
    }

    // Production: fail closed - block protected routes
    if (isProtectedRoute) {
      logger.error('middleware', 'Supabase credentials missing — blocking protected route', {
        path: request.nextUrl.pathname,
      });
      return new NextResponse('Authentication service unavailable', { status: 503 });
    }

    // Allow public routes in production
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh auth token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect dashboard routes
  const isAuthRoute = PROTECTED_ROUTES.some((route) => request.nextUrl.pathname.startsWith(route));

  if (isAuthRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from login
  if (request.nextUrl.pathname === '/login' && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
