import type { NextConfig } from 'next';

// Build-time validation: ensure required env vars are set in production
if (process.env.NODE_ENV === 'production') {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SITE_URL',
  ];

  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `[BUILD ERROR] Missing required environment variables for production: ${missing.join(', ')}\n` +
        'Set these in your deployment environment or .env.production file.'
    );
  }
}

// PostHog reverse-proxy targets. Client talks to same-origin /ingest (see
// src/lib/posthog/provider.tsx) which is rewritten to PostHog here — this keeps
// the CSP tight and survives ad-blockers.
const POSTHOG_HOST = (process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com').replace(
  /\/$/,
  ''
);
const POSTHOG_ASSET_HOST = POSTHOG_HOST.replace(
  /:\/\/([^.]+)\.i\.posthog\.com/,
  '://$1-assets.i.posthog.com'
);

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  // Required so PostHog's trailing-slash API paths proxy correctly.
  skipTrailingSlashRedirect: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: `${POSTHOG_ASSET_HOST}/static/:path*`,
      },
      {
        source: '/ingest/:path*',
        destination: `${POSTHOG_HOST}/:path*`,
      },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'secure.gravatar.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/browseros',
        destination: 'https://pub-602b789021664e5f8da3d80de3ff5bc5.r2.dev/report.html',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://assets.calendly.com https://*.posthog.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://assets.calendly.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*.googleusercontent.com https://lh3.googleusercontent.com https://secure.gravatar.com https://avatars.githubusercontent.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.hf.space https://*.posthog.com; frame-src https://calendly.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
