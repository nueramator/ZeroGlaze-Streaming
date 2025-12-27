/**
 * Bonding Curve Utilities
 * Mathematical calculations for constant product AMM
 */

// Constants from math.md
export const BONDING_CURVE_CONFIG = {
  totalSupply: 1_000_000_000,
  curveSupply: 800_000_000,
  creatorSupply: 200_000_000,

  virtualSolReserves: 30 * 1e9, // 30 SOL in lamports
  virtualTokenReserves: 1_073_000_000, // tokens

  platformFeeBps: 100, // 1%
  creatorFeeLiveBps: 200, // 2%
  creatorFeeOfflineBps: 20, // 0.2%

  graduationThresholdSol: 85 * 1e9, // 85 SOL in lamports
  graduationFeeSol: 6 * 1e9, // 6 SOL in lamports
} as const;

/**
 * Calculate current price per token
 */
export function calculatePrice(
  virtualSolReserves: number,
  virtualTokenReserves: number
): number {
  if (virtualTokenReserves === 0) return 0;
  return virtualSolReserves / virtualTokenReserves;
}

/**
 * Calculate buy cost (SOL required to buy X tokens)
 */
export function calculateBuyCost(
  virtualSolReserves: number,
  virtualTokenReserves: number,
  tokenAmount: number,
  isLive: boolean
): {
  solRequired: number;
  platformFee: number;
  creatorFee: number;
  totalCost: number;
  newPrice: number;
  priceImpact: number;
} {
  // Calculate constant K
  const k = virtualSolReserves * virtualTokenReserves;

  // New reserves after buying
  const newVirtualTokenReserves = virtualTokenReserves - tokenAmount;
  if (newVirtualTokenReserves <= 0) {
    throw new Error('Insufficient token supply');
  }

  const newVirtualSolReserves = k / newVirtualTokenReserves;
  const solRequired = newVirtualSolReserves - virtualSolReserves;

  // Calculate fees
  const platformFee = Math.floor(solRequired * (BONDING_CURVE_CONFIG.platformFeeBps / 10000));
  const creatorFeeBps = isLive
    ? BONDING_CURVE_CONFIG.creatorFeeLiveBps
    : BONDING_CURVE_CONFIG.creatorFeeOfflineBps;
  const creatorFee = Math.floor(solRequired * (creatorFeeBps / 10000));

  const totalCost = solRequired + platformFee + creatorFee;

  // Calculate new price and impact
  const currentPrice = calculatePrice(virtualSolReserves, virtualTokenReserves);
  const newPrice = calculatePrice(newVirtualSolReserves, newVirtualTokenReserves);
  const priceImpact = ((newPrice - currentPrice) / currentPrice) * 100;

  return {
    solRequired,
    platformFee,
    creatorFee,
    totalCost,
    newPrice,
    priceImpact,
  };
}

/**
 * Calculate sell output (SOL received for selling X tokens)
 */
export function calculateSellOutput(
  virtualSolReserves: number,
  virtualTokenReserves: number,
  tokenAmount: number,
  isLive: boolean
): {
  solToReturn: number;
  platformFee: number;
  creatorFee: number;
  netOutput: number;
  newPrice: number;
  priceImpact: number;
} {
  // Calculate constant K
  const k = virtualSolReserves * virtualTokenReserves;

  // New reserves after selling
  const newVirtualTokenReserves = virtualTokenReserves + tokenAmount;
  const newVirtualSolReserves = k / newVirtualTokenReserves;
  const solToReturn = virtualSolReserves - newVirtualSolReserves;

  // Calculate fees
  const platformFee = Math.floor(solToReturn * (BONDING_CURVE_CONFIG.platformFeeBps / 10000));
  const creatorFeeBps = isLive
    ? BONDING_CURVE_CONFIG.creatorFeeLiveBps
    : BONDING_CURVE_CONFIG.creatorFeeOfflineBps;
  const creatorFee = Math.floor(solToReturn * (creatorFeeBps / 10000));

  const netOutput = solToReturn - platformFee - creatorFee;

  // Calculate new price and impact
  const currentPrice = calculatePrice(virtualSolReserves, virtualTokenReserves);
  const newPrice = calculatePrice(newVirtualSolReserves, newVirtualTokenReserves);
  const priceImpact = ((currentPrice - newPrice) / currentPrice) * 100;

  return {
    solToReturn,
    platformFee,
    creatorFee,
    netOutput,
    newPrice,
    priceImpact,
  };
}

/**
 * Calculate market cap based on current price
 */
export function calculateMarketCap(currentPrice: number): number {
  return currentPrice * BONDING_CURVE_CONFIG.totalSupply;
}

/**
 * Calculate progress to graduation (0-100%)
 */
export function calculateProgress(tokensSold: number): number {
  return Math.min(100, (tokensSold / BONDING_CURVE_CONFIG.curveSupply) * 100);
}

/**
 * Check if token should graduate
 */
export function shouldGraduate(realSolReserves: number): boolean {
  return realSolReserves >= BONDING_CURVE_CONFIG.graduationThresholdSol;
}

/**
 * Calculate expected returns for a trader
 */
export function calculateExpectedReturns(
  entryPrice: number,
  exitPrice: number,
  tokenAmount: number,
  isLive: boolean
): {
  grossProfit: number;
  fees: number;
  netProfit: number;
  roi: number;
} {
  const buyCost = entryPrice * tokenAmount;
  const sellRevenue = exitPrice * tokenAmount;

  // Calculate round-trip fees
  const buyFeeBps = BONDING_CURVE_CONFIG.platformFeeBps + (isLive
    ? BONDING_CURVE_CONFIG.creatorFeeLiveBps
    : BONDING_CURVE_CONFIG.creatorFeeOfflineBps);
  const sellFeeBps = buyFeeBps; // Same for both

  const buyFees = buyCost * (buyFeeBps / 10000);
  const sellFees = sellRevenue * (sellFeeBps / 10000);
  const totalFees = buyFees + sellFees;

  const grossProfit = sellRevenue - buyCost;
  const netProfit = grossProfit - totalFees;
  const roi = (netProfit / (buyCost + buyFees)) * 100;

  return {
    grossProfit,
    fees: totalFees,
    netProfit,
    roi,
  };
}

/**
 * Simulate bonding curve progression
 */
export function simulateCurveProgression(
  steps: number = 10
): Array<{
  tokensSold: number;
  price: number;
  marketCap: number;
  progress: number;
}> {
  const stepSize = BONDING_CURVE_CONFIG.curveSupply / steps;
  const results = [];

  for (let i = 0; i <= steps; i++) {
    const tokensSold = stepSize * i;
    const virtualTokenReserves = BONDING_CURVE_CONFIG.virtualTokenReserves - tokensSold;
    const price = calculatePrice(BONDING_CURVE_CONFIG.virtualSolReserves, virtualTokenReserves);
    const marketCap = calculateMarketCap(price);
    const progress = calculateProgress(tokensSold);

    results.push({
      tokensSold,
      price: price / 1e9, // Convert to SOL
      marketCap: marketCap / 1e9, // Convert to SOL
      progress,
    });
  }

  return results;
}

/**
 * Format SOL amount with proper decimals
 */
export function formatSol(lamports: number, decimals: number = 4): string {
  const sol = lamports / 1e9;
  return sol.toFixed(decimals);
}

/**
 * Format token amount with proper decimals
 */
export function formatTokenAmount(amount: number, decimals: number = 6): string {
  return (amount / Math.pow(10, decimals)).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format price with dynamic precision
 */
export function formatPrice(price: number): string {
  if (price >= 1) return price.toFixed(2);
  if (price >= 0.01) return price.toFixed(4);
  if (price >= 0.0001) return price.toFixed(6);
  return price.toExponential(2);
}

/**
 * Calculate slippage tolerance
 */
export function calculateSlippage(
  expectedPrice: number,
  actualPrice: number
): number {
  return Math.abs(((actualPrice - expectedPrice) / expectedPrice) * 100);
}
