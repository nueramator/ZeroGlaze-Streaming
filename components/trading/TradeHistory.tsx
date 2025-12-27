'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ComponentLoader } from '@/components/ui/LoadingSpinner';
import {
  formatSol,
  formatTokenAmount,
  formatTimeAgo,
  truncateAddress,
} from '@/lib/utils/format';

interface Trade {
  id: string;
  tradeType: 'buy' | 'sell';
  tokenAmount: number;
  solAmount: number;
  pricePerToken: number;
  traderWallet: string;
  transactionSignature: string;
  createdAt: string;
}

interface TradeHistoryProps {
  tokenMint: string;
  limit?: number;
}

export function TradeHistory({ tokenMint, limit = 20 }: TradeHistoryProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        // In production, fetch from API
        // For MVP, generate sample data
        const sampleTrades: Trade[] = Array.from({ length: 10 }, (_, i) => ({
          id: `trade-${i}`,
          tradeType: Math.random() > 0.5 ? 'buy' : 'sell',
          tokenAmount: Math.random() * 1000 + 100,
          solAmount: Math.random() * 5 + 0.1,
          pricePerToken: Math.random() * 0.005 + 0.001,
          traderWallet: `${Math.random().toString(36).substring(7)}...${Math.random()
            .toString(36)
            .substring(7)}`,
          transactionSignature: Math.random().toString(36).substring(2),
          createdAt: new Date(
            Date.now() - Math.random() * 3600000
          ).toISOString(),
        }));

        setTimeout(() => {
          setTrades(sampleTrades);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching trade history:', error);
        setIsLoading(false);
      }
    };

    fetchTrades();

    // Subscribe to real-time updates via Supabase in production
    // For now, poll every 10 seconds
    const interval = setInterval(fetchTrades, 10000);
    return () => clearInterval(interval);
  }, [tokenMint]);

  if (isLoading) {
    return (
      <Card padding="lg">
        <ComponentLoader />
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <CardHeader>
        <CardTitle>Recent Trades</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {trades.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No trades yet</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="grid grid-cols-5 gap-4 px-4 py-2 text-xs text-gray-400 font-medium border-b border-gray-800">
                <div>Type</div>
                <div className="text-right">Amount</div>
                <div className="text-right">Price</div>
                <div className="text-right">Total</div>
                <div className="text-right">Time</div>
              </div>

              {/* Trades */}
              {trades.map((trade) => (
                <div
                  key={trade.id}
                  className="grid grid-cols-5 gap-4 px-4 py-3 hover:bg-gray-800/50 rounded-lg transition-colors cursor-pointer"
                  onClick={() => {
                    // Open transaction in explorer
                    window.open(
                      `https://explorer.solana.com/tx/${trade.transactionSignature}`,
                      '_blank'
                    );
                  }}
                >
                  <div>
                    <Badge
                      variant={trade.tradeType === 'buy' ? 'success' : 'danger'}
                      size="sm"
                    >
                      {trade.tradeType.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-right text-white font-medium">
                    {formatTokenAmount(trade.tokenAmount)}
                  </div>
                  <div className="text-right text-gray-300">
                    {formatSol(trade.pricePerToken, 6)}
                  </div>
                  <div className="text-right text-white font-medium">
                    {formatSol(trade.solAmount)}
                  </div>
                  <div className="text-right text-gray-400 text-sm">
                    {formatTimeAgo(trade.createdAt)}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
