'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { TokenCreationWizard } from '@/components/streamer/TokenCreationWizard'
import { FaRocket, FaTwitch } from 'react-icons/fa'

export default function StreamerPage() {
  const { connected, publicKey } = useWallet()
  const [hasToken, setHasToken] = useState(false)

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <FaRocket className="text-6xl text-primary mb-4" />
            <h2 className="card-title text-2xl mb-2">Streamer Portal</h2>
            <p className="mb-6">Connect your wallet to create your token</p>
            <WalletMultiButton />
          </div>
        </div>
      </div>
    )
  }

  if (hasToken) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="alert alert-success shadow-lg mb-8">
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Your token has been created successfully!</span>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Token Dashboard</h2>
              <p className="text-gray-600 mb-6">
                Manage your token, view analytics, and track earnings
              </p>

              <div className="stats stats-vertical lg:stats-horizontal shadow">
                <div className="stat">
                  <div className="stat-title">Total Trades</div>
                  <div className="stat-value text-primary">142</div>
                  <div className="stat-desc">Last 24 hours</div>
                </div>

                <div className="stat">
                  <div className="stat-title">Your Earnings</div>
                  <div className="stat-value text-secondary">0.24 SOL</div>
                  <div className="stat-desc">From trading fees</div>
                </div>

                <div className="stat">
                  <div className="stat-title">Current Price</div>
                  <div className="stat-value">0.015 SOL</div>
                  <div className="stat-desc">Per token</div>
                </div>
              </div>

              <div className="divider"></div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaTwitch className="text-purple-600 text-2xl" />
                    <div>
                      <p className="font-semibold">Stream Status</p>
                      <p className="text-sm text-gray-600">Not currently streaming</p>
                    </div>
                  </div>
                  <div className="badge badge-error">Offline</div>
                </div>

                <div className="alert alert-info">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current flex-shrink-0 w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Start streaming to earn 2% from every trade!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Create Your Token</span>
            </h1>
            <p className="text-xl text-gray-600">
              Launch your own tradable token in minutes
            </p>
          </div>

          <TokenCreationWizard onComplete={() => setHasToken(true)} />
        </div>
      </div>
    </div>
  )
}
