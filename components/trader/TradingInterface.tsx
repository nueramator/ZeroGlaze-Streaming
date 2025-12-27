'use client'

import { useState, useEffect } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { FaTwitch, FaCircle, FaExternalLinkAlt } from 'react-icons/fa'

interface Token {
  mint: string
  name: string
  symbol: string
  platform: string
  streamerId: string
  isLive: boolean
  currentPrice: number
  totalSupply: number
  marketCap: number
  volume24h: number
}

interface TradingInterfaceProps {
  token: Token
  onTradeComplete: () => void
}

type TradeType = 'buy' | 'sell'

export function TradingInterface({ token, onTradeComplete }: TradingInterfaceProps) {
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const [tradeType, setTradeType] = useState<TradeType>('buy')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quote, setQuote] = useState<any>(null)

  // Reset when token changes
  useEffect(() => {
    setAmount('')
    setError(null)
    setQuote(null)
  }, [token.mint])

  // Get quote when amount changes
  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      getQuote()
    } else {
      setQuote(null)
    }
  }, [amount, tradeType])

  const getQuote = async () => {
    try {
      const response = await fetch('/api/trading/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mint: token.mint,
          amount: parseFloat(amount),
          type: tradeType,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setQuote(data)
      } else {
        console.error('Failed to get quote: API returned non-OK status')
        setQuote(null)
      }
    } catch (err) {
      console.error('Failed to get quote:', err)
      setQuote(null)
    }
  }

  const handleTrade = async () => {
    if (!publicKey) return

    setLoading(true)
    setError(null)

    try {
      const endpoint = tradeType === 'buy' ? '/api/trading/buy' : '/api/trading/sell'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyer: publicKey.toString(),
          mint: token.mint,
          amount: parseFloat(amount),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Trade failed')
      }

      const data = await response.json()
      console.log('Trade executed:', data)

      // For MVP, simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Reset form
      setAmount('')
      setQuote(null)
      onTradeComplete()

      // Show success message
      alert(`Successfully ${tradeType === 'buy' ? 'bought' : 'sold'} ${amount} ${token.symbol}!`)
    } catch (err) {
      console.error('Trade error:', err)
      setError(err instanceof Error ? err.message : 'Trade failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Token Info Card */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="card-title text-3xl">
                {token.name}
                <div className="badge badge-lg badge-primary">{token.symbol}</div>
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <FaTwitch className="text-purple-600" />
                <span className="text-sm text-gray-600">@{token.streamerId}</span>
                <a
                  href={`https://twitch.tv/${token.streamerId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-xs btn-ghost"
                >
                  <FaExternalLinkAlt />
                </a>
              </div>
            </div>
            <div className="text-right">
              <div className={`badge badge-lg gap-2 ${token.isLive ? 'badge-success' : 'badge-error'}`}>
                <FaCircle className="text-xs" />
                {token.isLive ? 'LIVE NOW' : 'OFFLINE'}
              </div>
              {token.isLive && (
                <p className="text-xs text-success mt-1">Streamer earning 2% fees</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="stats stats-horizontal shadow bg-base-200">
            <div className="stat">
              <div className="stat-title">Current Price</div>
              <div className="stat-value text-primary text-2xl">
                {token.currentPrice.toFixed(4)} SOL
              </div>
            </div>

            <div className="stat">
              <div className="stat-title">Market Cap</div>
              <div className="stat-value text-2xl">
                {(token.marketCap / 1000).toFixed(1)}K SOL
              </div>
            </div>

            <div className="stat">
              <div className="stat-title">24h Volume</div>
              <div className="stat-value text-2xl">
                {(token.volume24h / 1000).toFixed(1)}K SOL
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trading Card */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title mb-4">Trade {token.symbol}</h3>

          {/* Buy/Sell Tabs */}
          <div className="tabs tabs-boxed mb-6">
            <a
              className={`tab tab-lg flex-1 ${tradeType === 'buy' ? 'tab-active' : ''}`}
              onClick={() => setTradeType('buy')}
            >
              Buy
            </a>
            <a
              className={`tab tab-lg flex-1 ${tradeType === 'sell' ? 'tab-active' : ''}`}
              onClick={() => setTradeType('sell')}
            >
              Sell
            </a>
          </div>

          {/* Amount Input */}
          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">Amount ({token.symbol})</span>
              <span className="label-text-alt">Balance: 0</span>
            </label>
            <input
              type="number"
              placeholder="0.00"
              className="input input-bordered input-lg w-full text-2xl"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="any"
            />
          </div>

          {/* Quote Display */}
          {quote && (
            <div className="card bg-base-200 mb-4">
              <div className="card-body p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Price per token:</span>
                    <span className="font-semibold">{quote.price.toFixed(6)} SOL</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total {tradeType === 'buy' ? 'cost' : 'received'}:</span>
                    <span className="font-semibold">{quote.total.toFixed(4)} SOL</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Platform fee (1%):</span>
                    <span>{quote.platformFee.toFixed(6)} SOL</span>
                  </div>
                  {token.isLive && (
                    <div className="flex justify-between text-xs text-success">
                      <span>Streamer fee (2%):</span>
                      <span>{quote.streamerFee.toFixed(6)} SOL</span>
                    </div>
                  )}
                  <div className="divider my-1"></div>
                  <div className="flex justify-between">
                    <span>Price impact:</span>
                    <span className={`font-semibold ${Math.abs(parseFloat(quote.priceImpact)) > 5 ? 'text-warning' : ''}`}>
                      {quote.priceImpact}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="alert alert-error shadow-lg mb-4">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Trade Button */}
          <button
            onClick={handleTrade}
            className={`btn btn-lg w-full ${tradeType === 'buy' ? 'btn-primary' : 'btn-secondary'}`}
            disabled={!amount || parseFloat(amount) <= 0 || loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner"></span>
                Processing...
              </>
            ) : (
              `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${token.symbol}`
            )}
          </button>

          {/* Info Alert */}
          {!token.isLive && (
            <div className="alert alert-warning mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current flex-shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm">
                Streamer is offline. They earn 2% fees only when streaming live.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Simple Chart Placeholder */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title mb-4">Price Chart</h3>
          <div className="bg-base-200 rounded-lg p-8 flex items-center justify-center min-h-[300px]">
            <div className="text-center">
              <p className="text-gray-500 mb-2">📈 Price Chart</p>
              <p className="text-sm text-gray-400">
                Real-time charting coming soon
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
