'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatSol, formatTokenAmount } from '@/lib/utils/format';
import toast from 'react-hot-toast';
import type { TradeQuote } from '@/lib/types/api';

interface TradingInterfaceProps {
  tokenMint: string;
  tokenSymbol: string;
  currentPrice: number;
}

type TradeType = 'buy' | 'sell';

export function TradingInterface({
  tokenMint,
  tokenSymbol,
  currentPrice,
}: TradingInterfaceProps) {
  const { publicKey, connected } = useWallet();
  const [tradeType, setTradeType] = useState<TradeType>('buy');
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<TradeQuote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Fetch quote when amount changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (amount && parseFloat(amount) > 0) {
        fetchQuote();
      } else {
        setQuote(null);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [amount, tradeType]);

  const fetchQuote = async () => {
    try {
      setIsLoadingQuote(true);
      const response = await fetch('/api/trading/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenMint,
          tokenAmount: parseFloat(amount),
          isBuy: tradeType === 'buy',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setQuote(data.data);
      } else {
        toast.error(data.error || 'Failed to fetch quote');
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const handleTrade = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!quote) {
      toast.error('Quote not available');
      return;
    }

    try {
      setIsExecuting(true);

      const endpoint = tradeType === 'buy' ? '/api/trading/buy' : '/api/trading/sell';
      const requestData =
        tradeType === 'buy'
          ? {
              tokenMint,
              tokenAmount: parseFloat(amount),
              maxSolCost: quote.totalCost * 1.01, // 1% slippage
              buyerWallet: publicKey.toBase58(),
            }
          : {
              tokenMint,
              tokenAmount: parseFloat(amount),
              minSolOutput: quote.solAmount * 0.99, // 1% slippage
              sellerWallet: publicKey.toBase58(),
            };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Successfully ${tradeType === 'buy' ? 'bought' : 'sold'} ${amount} ${tokenSymbol}!`
        );
        setAmount('');
        setQuote(null);
        // Refresh the page or update token data
        window.location.reload();
      } else {
        toast.error(data.error || `Failed to ${tradeType} tokens`);
      }
    } catch (error) {
      console.error('Trade execution error:', error);
      toast.error(`Failed to ${tradeType} tokens`);
    } finally {
      setIsExecuting(false);
    }
  };

  const setPercentage = (percent: number) => {
    // For MVP, just set placeholder amounts
    // In production, calculate based on wallet balance
    const baseAmount = tradeType === 'buy' ? 1000 : 100;
    setAmount(((baseAmount * percent) / 100).toString());
  };

  return (
    <Card padding="lg">
      <CardHeader>
        <CardTitle>Trade ${tokenSymbol}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Trade Type Selector */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={tradeType === 'buy' ? 'primary' : 'secondary'}
            onClick={() => setTradeType('buy')}
            fullWidth
          >
            Buy
          </Button>
          <Button
            variant={tradeType === 'sell' ? 'primary' : 'secondary'}
            onClick={() => setTradeType('sell')}
            fullWidth
          >
            Sell
          </Button>
        </div>

        {/* Amount Input */}
        <div className="space-y-4 mb-6">
          <Input
            label={`${tradeType === 'buy' ? 'Buy' : 'Sell'} Amount`}
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            rightIcon={<span className="font-semibold">{tokenSymbol}</span>}
          />

          {/* Quick Amount Buttons */}
          <div className="flex gap-2">
            {[25, 50, 75, 100].map((percent) => (
              <button
                key={percent}
                onClick={() => setPercentage(percent)}
                className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors"
              >
                {percent}%
              </button>
            ))}
          </div>
        </div>

        {/* Quote Display */}
        {isLoadingQuote ? (
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
            <p className="text-center text-gray-400">Loading quote...</p>
          </div>
        ) : quote ? (
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Price per token</span>
              <span className="text-white font-medium">
                {formatSol(quote.pricePerToken, 6)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">
                {tradeType === 'buy' ? 'SOL Cost' : 'SOL Received'}
              </span>
              <span className="text-white font-medium">
                {formatSol(quote.solAmount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Platform Fee (0.5%)</span>
              <span className="text-white font-medium">
                {formatSol(quote.platformFee)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Creator Fee (1%)</span>
              <span className="text-white font-medium">
                {formatSol(quote.creatorFee)}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-700">
              <span className="text-gray-400 font-semibold">Total</span>
              <span className="text-white font-semibold">
                {formatSol(quote.totalCost)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Price Impact</span>
              <span
                className={
                  quote.priceImpact > 5 ? 'text-red-400' : 'text-gray-300'
                }
              >
                {quote.priceImpact.toFixed(2)}%
              </span>
            </div>
            {quote.priceImpact > 5 && (
              <Badge variant="warning" size="sm">
                High price impact
              </Badge>
            )}
          </div>
        ) : amount && parseFloat(amount) > 0 ? (
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
            <p className="text-center text-gray-400 text-sm">
              Enter an amount to see quote
            </p>
          </div>
        ) : null}

        {/* Trade Button */}
        <Button
          onClick={handleTrade}
          variant="primary"
          fullWidth
          isLoading={isExecuting}
          disabled={!connected || !quote || isLoadingQuote}
        >
          {!connected
            ? 'Connect Wallet'
            : tradeType === 'buy'
            ? 'Buy Tokens'
            : 'Sell Tokens'}
        </Button>

        {/* Info */}
        <div className="mt-4 p-3 bg-purple-900/20 border border-purple-700 rounded-lg">
          <p className="text-xs text-purple-300">
            Trades are executed on a bonding curve. Price increases as more tokens
            are bought and decreases as tokens are sold.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
