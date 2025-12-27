'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { TokenList } from '@/components/trader/TokenList'
import { TradingInterface } from '@/components/trader/TradingInterface'
import { FaChartLine } from 'react-icons/fa'

interface Token {
  mint: string
  name: string
  symbol: string
  creator: string
  platform: string
  streamerId: string
  isLive: boolean
  currentPrice: number
  totalSupply: number
  marketCap: number
  volume24h: number
}

export default function TraderPage() {
  const { connected } = useWallet()
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTokens()
  }, [])

  const fetchTokens = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/tokens/list')
      if (response.ok) {
        const data = await response.json()
        setTokens(data.tokens || [])
      }
    } catch (error) {
      console.error('Failed to fetch tokens:', error)
      // Use mock data for MVP
      setTokens(getMockTokens())
    } finally {
      setLoading(false)
    }
  }

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <FaChartLine className="text-6xl text-secondary mb-4" />
            <h2 className="card-title text-2xl mb-2">Trader Portal</h2>
            <p className="mb-6">Connect your wallet to start trading</p>
            <WalletMultiButton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Trade Streamer Tokens</span>
          </h1>
          <p className="text-xl text-gray-600">
            Discover and trade tokens from your favorite streamers
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Token List */}
          <div className="lg:col-span-1">
            <TokenList
              tokens={tokens}
              loading={loading}
              selectedToken={selectedToken}
              onSelectToken={setSelectedToken}
            />
          </div>

          {/* Trading Interface */}
          <div className="lg:col-span-2">
            {selectedToken ? (
              <TradingInterface
                token={selectedToken}
                onTradeComplete={fetchTokens}
              />
            ) : (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body items-center justify-center min-h-[500px]">
                  <FaChartLine className="text-6xl text-gray-300 mb-4" />
                  <p className="text-gray-500 text-center">
                    Select a token from the list to start trading
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Mock data for MVP testing
function getMockTokens(): Token[] {
  return [
    {
      mint: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      name: 'StreamerOne Token',
      symbol: 'SO1',
      creator: 'CreatorWallet123',
      platform: 'twitch',
      streamerId: 'streamer_one',
      isLive: true,
      currentPrice: 0.015,
      totalSupply: 1000000,
      marketCap: 15000,
      volume24h: 2500,
    },
    {
      mint: '8yKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsV',
      name: 'GamerPro Token',
      symbol: 'GPT',
      creator: 'CreatorWallet456',
      platform: 'twitch',
      streamerId: 'gamer_pro',
      isLive: false,
      currentPrice: 0.008,
      totalSupply: 1000000,
      marketCap: 8000,
      volume24h: 1200,
    },
    {
      mint: '9zKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsW',
      name: 'Speedrun Token',
      symbol: 'SPD',
      creator: 'CreatorWallet789',
      platform: 'twitch',
      streamerId: 'speedrunner',
      isLive: true,
      currentPrice: 0.022,
      totalSupply: 1000000,
      marketCap: 22000,
      volume24h: 4500,
    },
  ]
}
