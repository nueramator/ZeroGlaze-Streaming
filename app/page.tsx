'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-purple-900/30 border border-purple-700 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-purple-300">
                Live on Solana Devnet
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Launch Your Token.
              <br />
              Stream. Earn.
            </h1>

            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              The first token launchpad built for streamers. Create your token,
              trade on bonding curves, and earn fees on every transaction.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/create">
                <Button size="lg" variant="primary">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create Token
                </Button>
              </Link>
              <Link href="/tokens">
                <Button size="lg" variant="outline">
                  Explore Tokens
                  <svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20 border-t border-gray-800">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Why Choose Zeroglaze?
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl">
                <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Instant Launch</h3>
                <p className="text-gray-400">
                  Create and launch your token in minutes. No technical knowledge
                  required.
                </p>
              </div>

              <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl">
                <div className="w-12 h-12 bg-pink-600/20 rounded-xl flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-pink-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Earn Fees</h3>
                <p className="text-gray-400">
                  Collect 1% on every trade of your token. Turn your community
                  into revenue.
                </p>
              </div>

              <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl">
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Fair Launch</h3>
                <p className="text-gray-400">
                  Bonding curves ensure fair pricing. No presales, no team
                  allocations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-700 rounded-3xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Launch?
            </h2>
            <p className="text-gray-300 mb-8">
              Join hundreds of streamers already earning with their tokens
            </p>
            <Link href="/create">
              <Button size="lg" variant="primary">
                Create Your Token Now
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
