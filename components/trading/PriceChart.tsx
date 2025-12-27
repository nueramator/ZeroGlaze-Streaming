'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ComponentLoader } from '@/components/ui/LoadingSpinner';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PriceChartProps {
  tokenMint: string;
  timeframe?: '1H' | '24H' | '7D' | '30D';
}

interface PricePoint {
  timestamp: string;
  price: number;
  volume: number;
}

export function PriceChart({ tokenMint, timeframe = '24H' }: PriceChartProps) {
  const [priceData, setPriceData] = useState<PricePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);

  useEffect(() => {
    // In production, fetch real price history from API
    // For MVP, generate sample data
    const generateSampleData = () => {
      const now = Date.now();
      const points: PricePoint[] = [];
      const dataPoints = selectedTimeframe === '1H' ? 12 : 24;

      for (let i = dataPoints; i >= 0; i--) {
        const timestamp = new Date(now - i * 3600000);
        const basePrice = 0.001;
        const randomChange = (Math.random() - 0.5) * 0.0002;
        points.push({
          timestamp: timestamp.toISOString(),
          price: basePrice + randomChange,
          volume: Math.random() * 1000,
        });
      }

      return points;
    };

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPriceData(generateSampleData());
      setIsLoading(false);
    }, 500);
  }, [tokenMint, selectedTimeframe]);

  const chartData = {
    labels: priceData.map((point) => {
      const date = new Date(point.timestamp);
      return selectedTimeframe === '1H'
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Price (SOL)',
        data: priceData.map((point) => point.price),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#F9FAFB',
        bodyColor: '#D1D5DB',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: any) => {
            return `Price: ${context.parsed.y.toFixed(6)} SOL`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          color: '#374151',
        },
        ticks: {
          color: '#9CA3AF',
          maxTicksLimit: 8,
        },
      },
      y: {
        grid: {
          color: '#374151',
        },
        ticks: {
          color: '#9CA3AF',
          callback: (value: any) => {
            return value.toFixed(6);
          },
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Price Chart</CardTitle>
          <div className="flex gap-2">
            {(['1H', '24H', '7D', '30D'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedTimeframe === tf
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {isLoading ? (
            <ComponentLoader />
          ) : (
            <Line data={chartData} options={options} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
