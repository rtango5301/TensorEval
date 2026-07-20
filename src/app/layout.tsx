import type { Metadata } from 'next';
import { Inter, IBM_Plex_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/toast-context';
import { Toast } from '@/components/ui/toast';
import { PostHogProvider } from '@/lib/posthog/provider';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TensorEval — CI/CD for Agentic Workflows',
  description:
    'The CI/CD platform built for deterministic AI evaluation. Catch regressions, latency spikes, and hallucinations before they reach production.',
  metadataBase: new URL('https://tensoreval.com'),
  keywords: [
    'AI evaluation',
    'CI/CD',
    'AI agents',
    'LLM testing',
    'machine learning',
    'regression testing',
  ],
  authors: [{ name: 'TensorEval' }],
  openGraph: {
    title: 'TensorEval — CI/CD for Agentic Workflows',
    description:
      'The CI/CD platform built for deterministic AI evaluation. Catch regressions, latency spikes, and hallucinations before they reach production.',
    type: 'website',
    url: 'https://tensoreval.com',
    siteName: 'TensorEval',
    images: [
      {
        url: '/og-image.png',
        width: 1376,
        height: 768,
        alt: 'TensorEval — CI/CD for Agentic Workflows',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TensorEval — CI/CD for Agentic Workflows',
    description:
      'The CI/CD platform built for deterministic AI evaluation. Catch regressions, latency spikes, and hallucinations before they reach production.',
    images: [
      {
        url: '/og-image.png',
        width: 1376,
        height: 768,
        alt: 'TensorEval — CI/CD for Agentic Workflows',
      },
    ],
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
    shortcut: '/favicon.ico',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to Google Fonts for Material Symbols */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Material Symbols for dashboard icons */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body
        className={`${inter.variable} ${ibmPlexMono.variable} ${spaceGrotesk.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <PostHogProvider>
          <ToastProvider>
            {children}
            <Toast />
          </ToastProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
