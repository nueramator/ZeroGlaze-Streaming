'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TradingInterface } from '@/components/trading/TradingInterface';
import { PriceChart } from '@/components/trading/PriceChart';
import { TradeHistory } from '@/components/trading/TradeHistory';
import { OrderBook } from '@/components/trading/OrderBook';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StreamStatus } from '@/components/streamer/StreamStatus';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import {
  formatSol,
  formatCompactNumber,
  formatPercent,
  truncateAddress,
} from '@/lib/utils/format';
import toast from 'react-hot-toast';
import type { TokenDetailsResponse } from '@/lib/types/api';

export default function TokenDetailPage() {
  const params = useParams();
  const tokenMint = params.mint as string;
  const [token, setToken] = useState<TokenDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch(`/api/tokens/${tokenMint}`);
        const data = await response.json();

        if (data.success) {
          setToken(data.data);
        } else {
          toast.error('Token not found');
        }
      } catch (error) {
        console.error('Error fetching token:', error);
        toast.error('Failed to load token');
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
  }, [tokenMint]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!token) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              Token Not Found
            </h2>
            <p className="text-gray-400">
              The token you're looking for doesn't exist
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-950">
        <div className="container mx-auto px-4 py-12">
          {/* Token Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {token.tokenSymbol.charAt(0)}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {token.tokenName}
                  </h1>
                  <p className="text-gray-400">${token.tokenSymbol}</p>
                </div>
              </div>
              <StreamStatus
                tokenMint={token.tokenMint}
                platform={token.creatorTwitch ? 'twitch' : 'youtube'}
              />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card padding="md">
                <CardContent>
                  <p className="text-sm text-gray-400 mb-1">Price</p>
                  <p className="text-xl font-bold text-white">
                    {formatSol(token.currentPrice, 6)}
                  </p>
                </CardContent>
              </Card>

              <Card padding="md">
                <CardContent>
                  <p className="text-sm text-gray-400 mb-1">Market Cap</p>
                  <p className="text-xl font-bold text-white">
                    {formatCompactNumber(token.marketCap)} SOL
                  </p>
                </CardContent>
              </Card>

              <Card padding="md">
                <CardContent>
                  <p className="text-sm text-gray-400 mb-1">Volume</p>
                  <p className="text-xl font-bold text-white">
                    {formatCompactNumber(token.totalVolume)} SOL
                  </p>
                </CardContent>
              </Card>

              <Card padding="md">
                <CardContent>
                  <p className="text-sm text-gray-400 mb-1">Progress</p>
                  <p className="text-xl font-bold text-purple-400">
                    {(token.progress * 100).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Creator Info */}
            <Card padding="md">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Creator</p>
                    <p className="font-mono text-white">
                      {truncateAddress(token.creator)}
                    </p>
                  </div>
                  {token.freezeCreatorAllocation && (
                    <Badge variant="success">Frozen Allocation</Badge>
                  )}
                  {token.graduated && <Badge variant="purple">Graduated</Badge>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chart and History */}
            <div className="lg:col-span-2 space-y-6">
              <PriceChart tokenMint={token.tokenMint} />
              <TradeHistory tokenMint={token.tokenMint} />
            </div>

            {/* Trading Interface and Order Book */}
            <div className="space-y-6">
              <TradingInterface
                tokenMint={token.tokenMint}
                tokenSymbol={token.tokenSymbol}
                currentPrice={token.currentPrice}
              />
              <OrderBook tokenMint={token.tokenMint} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
