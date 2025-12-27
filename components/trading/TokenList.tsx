'use client';

import { useState, useEffect } from 'react';
import { TokenCard } from './TokenCard';
import { ComponentLoader } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import type { TokenListItem } from '@/lib/types/api';

type FilterType = 'all' | 'live' | 'trending' | 'graduated';

export function TokenList() {
  const [tokens, setTokens] = useState<TokenListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (filter === 'live') params.append('isLive', 'true');
        if (filter === 'graduated') params.append('graduated', 'true');
        if (filter === 'trending') params.append('sortBy', 'volume24h');

        const response = await fetch(`/api/tokens/list?${params}`);
        const data = await response.json();

        if (data.success) {
          setTokens(data.data);
        } else {
          toast.error('Failed to load tokens');
        }
      } catch (error) {
        console.error('Error fetching tokens:', error);
        toast.error('Failed to load tokens');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokens();
  }, [filter]);

  const handleTokenClick = (tokenMint: string) => {
    window.location.href = `/token/${tokenMint}`;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        <FilterButton
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          All Tokens
        </FilterButton>
        <FilterButton
          active={filter === 'live'}
          onClick={() => setFilter('live')}
        >
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
          Live Now
        </FilterButton>
        <FilterButton
          active={filter === 'trending'}
          onClick={() => setFilter('trending')}
        >
          Trending
        </FilterButton>
        <FilterButton
          active={filter === 'graduated'}
          onClick={() => setFilter('graduated')}
        >
          Graduated
        </FilterButton>
      </div>

      {/* Token Grid */}
      {isLoading ? (
        <ComponentLoader />
      ) : tokens.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No tokens found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tokens.map((token) => (
            <TokenCard
              key={token.tokenMint}
              token={token}
              onClick={() => handleTokenClick(token.tokenMint)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center ${
        active
          ? 'bg-purple-600 text-white'
          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  );
}
