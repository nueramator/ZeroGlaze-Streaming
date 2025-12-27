'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { formatCompactNumber } from '@/lib/utils/format';

interface StreamStatusProps {
  tokenMint: string;
  platform: 'twitch' | 'youtube';
  autoRefresh?: boolean;
}

interface StreamData {
  isLive: boolean;
  viewerCount?: number;
  streamTitle?: string;
  lastChecked: string;
}

export function StreamStatus({
  tokenMint,
  platform,
  autoRefresh = true,
}: StreamStatusProps) {
  const [streamData, setStreamData] = useState<StreamData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(
          `/api/streamer/verify-stream?tokenMint=${tokenMint}&platform=${platform}`
        );
        const data = await response.json();

        if (data.success) {
          setStreamData(data.data);
        }
      } catch (error) {
        console.error('Error fetching stream status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();

    // Auto-refresh every 60 seconds if enabled
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchStatus, 60000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [tokenMint, platform, autoRefresh]);

  if (isLoading) {
    return (
      <Badge variant="default" size="sm">
        Checking...
      </Badge>
    );
  }

  if (!streamData) {
    return (
      <Badge variant="default" size="sm">
        Unknown
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={streamData.isLive ? 'success' : 'default'}
        size="sm"
      >
        {streamData.isLive ? (
          <>
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2" />
            Live
          </>
        ) : (
          'Offline'
        )}
      </Badge>
      {streamData.isLive && streamData.viewerCount !== undefined && (
        <span className="text-sm text-gray-400">
          {formatCompactNumber(streamData.viewerCount)} viewers
        </span>
      )}
    </div>
  );
}

export function StreamStatusIndicator({
  isLive,
  className,
}: {
  isLive: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`w-3 h-3 rounded-full ${
          isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-600'
        }`}
      />
      <span className={`text-sm font-medium ${isLive ? 'text-green-400' : 'text-gray-400'}`}>
        {isLive ? 'Live' : 'Offline'}
      </span>
    </div>
  );
}
