'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ComponentLoader } from '@/components/ui/LoadingSpinner';
import { formatSol, formatTokenAmount } from '@/lib/utils/format';

interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

interface OrderBookProps {
  tokenMint: string;
}

export function OrderBook({ tokenMint }: OrderBookProps) {
  const [buyOrders, setBuyOrders] = useState<OrderBookEntry[]>([]);
  const [sellOrders, setSellOrders] = useState<OrderBookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In production, this would fetch real order book data
    // For MVP with bonding curve, we can show the curve points
    const generateCurvePoints = () => {
      const basePrice = 0.001;
      const k = 0.0001;
      const currentSupply = 500000;

      const buyPoints: OrderBookEntry[] = [];
      const sellPoints: OrderBookEntry[] = [];

      // Generate sell orders (higher prices)
      for (let i = 1; i <= 5; i++) {
        const amount = 10000 * i;
        const supply = currentSupply + amount;
        const price = basePrice + k * supply;
        sellPoints.push({
          price,
          amount,
          total: price * amount,
        });
      }

      // Generate buy orders (lower prices)
      for (let i = 1; i <= 5; i++) {
        const amount = 10000 * i;
        const supply = Math.max(0, currentSupply - amount);
        const price = basePrice + k * supply;
        buyPoints.push({
          price,
          amount,
          total: price * amount,
        });
      }

      return { buyPoints, sellPoints };
    };

    setIsLoading(true);
    setTimeout(() => {
      const { buyPoints, sellPoints } = generateCurvePoints();
      setBuyOrders(buyPoints);
      setSellOrders(sellPoints);
      setIsLoading(false);
    }, 500);
  }, [tokenMint]);

  if (isLoading) {
    return (
      <Card padding="lg">
        <ComponentLoader />
      </Card>
    );
  }

  const maxTotal = Math.max(
    ...buyOrders.map((o) => o.total),
    ...sellOrders.map((o) => o.total)
  );

  return (
    <Card padding="lg">
      <CardHeader>
        <CardTitle>Order Book</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Sell Orders */}
          <div>
            <h4 className="text-xs font-medium text-gray-400 mb-2">
              SELL ORDERS
            </h4>
            <div className="space-y-1">
              {sellOrders.reverse().map((order, index) => (
                <OrderBookRow
                  key={`sell-${index}`}
                  order={order}
                  maxTotal={maxTotal}
                  type="sell"
                />
              ))}
            </div>
          </div>

          {/* Spread */}
          <div className="py-2 text-center border-y border-gray-800">
            <span className="text-sm font-medium text-gray-400">
              Bonding Curve Price
            </span>
          </div>

          {/* Buy Orders */}
          <div>
            <h4 className="text-xs font-medium text-gray-400 mb-2">
              BUY ORDERS
            </h4>
            <div className="space-y-1">
              {buyOrders.map((order, index) => (
                <OrderBookRow
                  key={`buy-${index}`}
                  order={order}
                  maxTotal={maxTotal}
                  type="buy"
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OrderBookRow({
  order,
  maxTotal,
  type,
}: {
  order: OrderBookEntry;
  maxTotal: number;
  type: 'buy' | 'sell';
}) {
  const percentage = (order.total / maxTotal) * 100;

  return (
    <div className="relative overflow-hidden rounded">
      {/* Background bar */}
      <div
        className={`absolute inset-y-0 left-0 ${
          type === 'buy' ? 'bg-green-900/20' : 'bg-red-900/20'
        }`}
        style={{ width: `${percentage}%` }}
      />

      {/* Content */}
      <div className="relative grid grid-cols-3 gap-4 px-3 py-2 text-sm">
        <div
          className={`font-medium ${
            type === 'buy' ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {formatSol(order.price, 6)}
        </div>
        <div className="text-white text-right">
          {formatTokenAmount(order.amount)}
        </div>
        <div className="text-gray-400 text-right">
          {formatSol(order.total)}
        </div>
      </div>
    </div>
  );
}
