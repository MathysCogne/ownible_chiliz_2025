import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Ownible - Own a Piece of the Action',
  description: 'The RWA platform for sports & entertainment collectibles, powered by Chiliz.',
  manifest: '/ico/manifest.json',
  icons: {
    shortcut: '/ico/favicon-16x16.png',
    apple: [
      { url: '/ico/apple-icon.png' },
      { url: '/ico/apple-icon-57x57.png', sizes: '57x57' },
      { url: '/ico/apple-icon-60x60.png', sizes: '60x60' },
      { url: '/ico/apple-icon-72x72.png', sizes: '72x72' },
      { url: '/ico/apple-icon-76x76.png', sizes: '76x76' },
      { url: '/ico/apple-icon-114x114.png', sizes: '114x114' },
      { url: '/ico/apple-icon-120x120.png', sizes: '120x120' },
      { url: '/ico/apple-icon-144x144.png', sizes: '144x144' },
      { url: '/ico/apple-icon-152x152.png', sizes: '152x152' },
      { url: '/ico/apple-icon-180x180.png', sizes: '180x180' },
    ],
    other: [
      {
        rel: 'icon',
        url: '/ico/android-icon-192x192.png',
        sizes: '192x192',
      },
      {
        rel: 'icon',
        url: '/ico/favicon-32x32.png',
        sizes: '32x32',
      },
      {
        rel: 'icon',
        url: '/ico/favicon-96x96.png',
        sizes: '96x96',
      },
      {
        rel: 'icon',
        url: '/ico/favicon-16x16.png',
        sizes: '16x16',
      },
    ],
  },
  openGraph: {
    title: 'Ownible - Own a Piece of the Action',
    description: 'The RWA platform for sports & entertainment collectibles, powered by Chiliz.',
    url: 'https://ownible.io',
    siteName: 'Ownible',
    images: [
      {
        url: '/ico/ms-icon-310x310.png', 
        width: 310,
        height: 310,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ownible - Own a Piece of the Action',
    description: 'The RWA platform for sports & entertainment collectibles, powered by Chiliz.',
    images: ['/ico/ms-icon-310x310.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
