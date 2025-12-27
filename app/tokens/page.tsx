'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TokenList } from '@/components/trading/TokenList';

export default function TokensPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-950">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Explore Tokens
            </h1>
            <p className="text-gray-400">
              Discover and trade streamer tokens on bonding curves
            </p>
          </div>

          <TokenList />
        </div>
      </main>
      <Footer />
    </>
  );
}
