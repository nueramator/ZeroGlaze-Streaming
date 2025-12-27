'use client'

import { FaTwitch, FaCircle } from 'react-icons/fa'

interface Token {
  mint: string
  name: string
  symbol: string
  platform: string
  streamerId: string
  isLive: boolean
  currentPrice: number
  volume24h: number
  marketCap: number
}

interface TokenListProps {
  tokens: Token[]
  loading: boolean
  selectedToken: Token | null
  onSelectToken: (token: Token) => void
}

export function TokenList({ tokens, loading, selectedToken, onSelectToken }: TokenListProps) {
  if (loading) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">Available Tokens</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-24 w-full"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card bg-base-100 shadow-xl sticky top-4">
      <div className="card-body">
        <h2 className="card-title mb-4">Available Tokens</h2>

        {tokens.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No tokens available yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Be the first to create one!
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {tokens.map((token) => (
              <button
                key={token.mint}
                onClick={() => onSelectToken(token)}
                className={`card bg-base-200 w-full text-left transition-all hover:shadow-lg ${
                  selectedToken?.mint === token.mint
                    ? 'ring-2 ring-primary'
                    : ''
                }`}
              >
                <div className="card-body p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FaTwitch className="text-purple-600" />
                      <div>
                        <h3 className="font-bold">{token.symbol}</h3>
                        <p className="text-xs text-gray-600">{token.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaCircle
                        className={`text-xs ${
                          token.isLive ? 'text-success' : 'text-error'
                        }`}
                      />
                      <span className="text-xs">
                        {token.isLive ? 'LIVE' : 'Offline'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="font-semibold">
                        {token.currentPrice.toFixed(4)} SOL
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">24h Vol</p>
                      <p className="font-semibold">
                        {(token.volume24h / 1000).toFixed(1)}K
                      </p>
                    </div>
                  </div>

                  {token.isLive && (
                    <div className="badge badge-success badge-sm mt-2">
                      Earning 2% Fees
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
