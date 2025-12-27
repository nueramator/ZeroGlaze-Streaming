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

      {/* How It Works */}
      <section className="py-20 bg-base-100">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* For Streamers */}
            <div className="card bg-gradient-to-br from-primary/5 to-primary/10 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-3 mb-4">
                  <FaRocket className="text-primary text-3xl" />
                  <h3 className="card-title text-2xl">For Streamers</h3>
                </div>

                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <span className="badge badge-primary">1</span>
                    <div>
                      <strong>Connect Your Wallet</strong>
                      <p className="text-sm text-gray-600">Use Phantom or Solflare wallet</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="badge badge-primary">2</span>
                    <div>
                      <strong>Link Your Stream</strong>
                      <p className="text-sm text-gray-600">Connect your Twitch account</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="badge badge-primary">3</span>
                    <div>
                      <strong>Create Your Token</strong>
                      <p className="text-sm text-gray-600">Set name, ticker, and supply</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="badge badge-primary">4</span>
                    <div>
                      <strong>Start Earning</strong>
                      <p className="text-sm text-gray-600">Get 2% of every trade while streaming</p>
                    </div>
                  </li>
                </ol>

                <div className="card-actions justify-end mt-6">
                  <Link href="/streamer" className="btn btn-primary">
                    Get Started
                  </Link>
                </div>
              </div>
            </div>

            {/* For Traders */}
            <div className="card bg-gradient-to-br from-secondary/5 to-secondary/10 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-3 mb-4">
                  <FaChartLine className="text-secondary text-3xl" />
                  <h3 className="card-title text-2xl">For Traders</h3>
                </div>

                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <span className="badge badge-secondary">1</span>
                    <div>
                      <strong>Browse Tokens</strong>
                      <p className="text-sm text-gray-600">Discover trending streamers</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="badge badge-secondary">2</span>
                    <div>
                      <strong>Check Live Status</strong>
                      <p className="text-sm text-gray-600">See who's streaming in real-time</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="badge badge-secondary">3</span>
                    <div>
                      <strong>Buy & Sell</strong>
                      <p className="text-sm text-gray-600">Trade on the bonding curve</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="badge badge-secondary">4</span>
                    <div>
                      <strong>Watch Price Move</strong>
                      <p className="text-sm text-gray-600">Price rises when streamer is live</p>
                    </div>
                  </li>
                </ol>

                <div className="card-actions justify-end mt-6">
                  <Link href="/trader" className="btn btn-secondary">
                    Start Trading
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 gradient-bg">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Why Zeroglaze?</h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="card bg-white shadow-xl card-hover">
              <div className="card-body items-center text-center">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="card-title">Instant Liquidity</h3>
                <p>Built-in bonding curve means instant buy/sell with no order books</p>
              </div>
            </div>

            <div className="card bg-white shadow-xl card-hover">
              <div className="card-body items-center text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="card-title">Live Stream Bonus</h3>
                <p>Streamer earns 2% fee only when live, aligning incentives</p>
              </div>
            </div>

            <div className="card bg-white shadow-xl card-hover">
              <div className="card-body items-center text-center">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="card-title">Optional Freeze</h3>
                <p>Streamers can freeze their tokens to prevent rug pulls</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Connection Status Banner */}
      {!connected && (
        <div className="alert alert-info shadow-lg max-w-2xl mx-auto my-8">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current flex-shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Connect your wallet to get started with Zeroglaze!</span>
          </div>
        </div>
      )}
    </div>
  )
}
