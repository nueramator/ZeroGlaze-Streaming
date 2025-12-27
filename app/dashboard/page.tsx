'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CreatorDashboard } from '@/components/streamer/CreatorDashboard';
import { WalletInfo } from '@/components/wallet/WalletInfo';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const { connected } = useWallet();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-950">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Creator Dashboard
            </h1>
            <p className="text-gray-400">
              Manage your tokens and track your earnings
            </p>
          </div>

          {!connected ? (
            <div className="max-w-md mx-auto text-center py-12">
              <div className="mb-6">
                <svg
                  className="w-16 h-16 text-gray-600 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Connect Your Wallet
              </h2>
              <p className="text-gray-400 mb-6">
                Please connect your wallet to view your dashboard
              </p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <WalletInfo />
              </div>
              <div className="lg:col-span-3">
                <CreatorDashboard />
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
