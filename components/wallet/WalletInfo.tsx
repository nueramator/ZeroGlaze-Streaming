'use client';

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { formatSol, truncateAddress } from '@/lib/utils/format';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function WalletInfo() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      return;
    }

    const fetchBalance = async () => {
      try {
        setIsLoading(true);
        const balance = await connection.getBalance(publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Error fetching balance:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();

    // Subscribe to balance changes
    const subscriptionId = connection.onAccountChange(
      publicKey,
      (accountInfo) => {
        setBalance(accountInfo.lamports / LAMPORTS_PER_SOL);
      }
    );

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [publicKey, connection]);

  if (!connected || !publicKey) {
    return null;
  }

  return (
    <Card padding="md" className="w-full">
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-400 mb-1">Wallet Address</p>
            <p className="font-mono text-sm text-white break-all">
              {truncateAddress(publicKey.toBase58(), 8)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Balance</p>
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <p className="text-lg font-semibold text-white">
                {balance !== null ? formatSol(balance) : '—'}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
