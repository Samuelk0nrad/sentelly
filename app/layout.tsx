import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth-provider";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Sentelly - AI-Powered Dictionary & Pronunciation Guide',
    template: '%s | Sentelly'
  },
  description: 'Discover word meanings instantly with AI-powered definitions, pronunciation guides, and intelligent spelling correction. Your smart dictionary companion for enhanced vocabulary learning.',
  keywords: [
    'AI dictionary',
    'word definitions',
    'pronunciation guide',
    'spelling correction',
    'vocabulary learning',
    'intelligent dictionary',
    'word meanings',
    'language learning',
    'pronunciation audio',
    'smart dictionary'
  ],
  authors: [{ name: 'Sentelly Team' }],
  creator: 'Sentelly',
  publisher: 'Sentelly',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://sentelly.netlify.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sentelly.netlify.app',
    siteName: 'Sentelly',
    title: 'Sentelly - AI-Powered Dictionary & Pronunciation Guide',
    description: 'Discover word meanings instantly with AI-powered definitions, pronunciation guides, and intelligent spelling correction.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Sentelly - AI Dictionary with Pronunciation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sentelly - AI-Powered Dictionary & Pronunciation Guide',
    description: 'Discover word meanings instantly with AI-powered definitions, pronunciation guides, and intelligent spelling correction.',
    images: ['/og-image.png'],
    creator: '@sentelly',
    site: '@sentelly',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'education',
  classification: 'Educational Technology',
  referrer: 'origin-when-cross-origin',
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7a372' },
    { media: '(prefers-color-scheme: dark)', color: '#ff8a80' },
  ],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#f7a372',
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Sentelly',
  },
  applicationName: 'Sentelly',
  generator: 'Next.js',
  abstract: 'AI-powered dictionary with pronunciation guides and intelligent spelling correction for enhanced vocabulary learning.',
  archives: ['https://sentelly.netlify.app/sitemap.xml'],
  assets: ['https://sentelly.netlify.app'],
  bookmarks: ['https://sentelly.netlify.app'],
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'format-detection': 'telephone=no',
    'msapplication-TileColor': '#f7a372',
    'msapplication-config': '/browserconfig.xml',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.elevenlabs.io" />
        <link rel="dns-prefetch" href="https://generativelanguage.googleapis.com" />
        <meta name="theme-color" content="#f7a372" />
        <meta name="msapplication-navbutton-color" content="#f7a372" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}