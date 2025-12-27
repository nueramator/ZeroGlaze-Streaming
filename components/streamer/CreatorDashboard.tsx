'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ComponentLoader } from '@/components/ui/LoadingSpinner';
import { formatSol, formatCompactNumber, formatPercent } from '@/lib/utils/format';
import toast from 'react-hot-toast';

interface CreatorStats {
  totalTokensCreated: number;
  totalVolumeGenerated: number;
  totalFeesEarned: number;
  tokens: Array<{
    tokenMint: string;
    tokenName: string;
    tokenSymbol: string;
    currentPrice: number;
    marketCap: number;
    totalVolume: number;
    isLive: boolean;
    graduated: boolean;
    creatorFeesCollected: number;
  }>;
}

export function CreatorDashboard() {
  const { publicKey } = useWallet();
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!publicKey) return;

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/streamer/profile?wallet=${publicKey.toBase58()}`
        );
        const data = await response.json();

        if (data.success) {
          setStats(data.data);
        } else {
          toast.error('Failed to load creator stats');
        }
      } catch (error) {
        console.error('Error fetching creator stats:', error);
        toast.error('Failed to load creator stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [publicKey]);

  if (isLoading) {
    return <ComponentLoader />;
  }

  if (!stats) {
    return (
      <Card padding="lg">
        <div className="text-center py-12">
          <p className="text-gray-400">No creator data found</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card padding="lg">
          <CardHeader>
            <CardDescription>Total Tokens Created</CardDescription>
            <CardTitle className="text-3xl">
              {stats.totalTokensCreated}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card padding="lg">
          <CardHeader>
            <CardDescription>Total Volume Generated</CardDescription>
            <CardTitle className="text-3xl">
              {formatSol(stats.totalVolumeGenerated)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card padding="lg">
          <CardHeader>
            <CardDescription>Total Fees Earned</CardDescription>
            <CardTitle className="text-3xl text-green-400">
              {formatSol(stats.totalFeesEarned)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Token List */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Your Tokens</CardTitle>
          <CardDescription>
            Manage and track your created tokens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.tokens.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">
                  You haven't created any tokens yet
                </p>
              </div>
            ) : (
              stats.tokens.map((token) => (
                <div
                  key={token.tokenMint}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={() =>
                    (window.location.href = `/token/${token.tokenMint}`)
                  }
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {token.tokenSymbol.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-white">
                          {token.tokenName}
                        </h4>
                        <span className="text-gray-400">
                          ${token.tokenSymbol}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={token.isLive ? 'success' : 'default'}
                          size="sm"
                        >
                          {token.isLive ? 'Live' : 'Offline'}
                        </Badge>
                        {token.graduated && (
                          <Badge variant="purple" size="sm">
                            Graduated
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-400">Fees Earned</p>
                    <p className="font-semibold text-green-400">
                      {formatSol(token.creatorFeesCollected || 0)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Vol: {formatCompactNumber(token.totalVolume)} SOL
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
