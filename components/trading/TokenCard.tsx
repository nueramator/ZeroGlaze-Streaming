'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StreamStatusIndicator } from '@/components/streamer/StreamStatus';
import {
  formatSol,
  formatCompactNumber,
  formatPercent,
} from '@/lib/utils/format';
import type { TokenListItem } from '@/lib/types/api';

interface TokenCardProps {
  token: TokenListItem;
  onClick?: () => void;
}

export function TokenCard({ token, onClick }: TokenCardProps) {
  const progress = (token.progress * 100).toFixed(1);

  return (
    <Card
      padding="none"
      hover
      className="cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <CardContent>
        {/* Header with badge */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {token.tokenSymbol.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">
                  {token.tokenName}
                </h3>
                <p className="text-gray-400 text-sm">${token.tokenSymbol}</p>
              </div>
            </div>
            <StreamStatusIndicator isLive={token.isLive} />
          </div>

          {token.graduated && (
            <Badge variant="purple" size="sm">
              Graduated to DEX
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Price</span>
            <span className="font-semibold text-white">
              {formatSol(token.currentPrice, 6)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Market Cap</span>
            <span className="font-semibold text-white">
              {formatCompactNumber(token.marketCap)} SOL
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">24h Volume</span>
            <span className="font-semibold text-white">
              {formatCompactNumber(token.volume24h)} SOL
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">24h Change</span>
            <span
              className={`font-semibold ${
                token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {formatPercent(token.priceChange24h)}
            </span>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Bonding Curve</span>
              <span className="text-sm font-medium text-purple-400">
                {progress}%
              </span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Creator Info */}
        <div className="p-4 bg-gray-800/30 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Creator</span>
            <span className="text-xs font-mono text-gray-300">
              {token.creator.slice(0, 4)}...{token.creator.slice(-4)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
