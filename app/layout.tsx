import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { WalletContextProvider } from '@/lib/contexts/WalletContext';
import { ToastProvider } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Zeroglaze - Streamer Token Launchpad on Solana',
  description:
    'Launch your own token as a streamer. Trade with bonding curves. Earn fees on every transaction.',
  keywords: ['solana', 'token', 'launchpad', 'streaming', 'bonding curve'],
  openGraph: {
    title: 'Zeroglaze - Streamer Token Launchpad',
    description: 'Launch your own token as a streamer on Solana',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 text-white antialiased`}>
        <ErrorBoundary>
          <WalletContextProvider>
            {children}
            <ToastProvider />
          </WalletContextProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
