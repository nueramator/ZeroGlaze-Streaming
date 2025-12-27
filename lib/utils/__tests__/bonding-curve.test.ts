/**
 * Bonding Curve Logic Tests
 * Critical test suite for all bonding curve calculations
 * This ensures financial accuracy and prevents costly bugs
 */

import {
  BONDING_CURVE_CONFIG,
  calculatePrice,
  calculateBuyCost,
  calculateSellOutput,
  calculateMarketCap,
  calculateProgress,
  shouldGraduate,
  calculateExpectedReturns,
  simulateCurveProgression,
  calculateSlippage,
} from '../bonding-curve';

describe('Bonding Curve Constants', () => {
  it('should have correct configuration values', () => {
    expect(BONDING_CURVE_CONFIG.totalSupply).toBe(1_000_000_000);
    expect(BONDING_CURVE_CONFIG.curveSupply).toBe(800_000_000);
    expect(BONDING_CURVE_CONFIG.creatorSupply).toBe(200_000_000);
    expect(BONDING_CURVE_CONFIG.virtualSolReserves).toBe(30 * 1e9);
    expect(BONDING_CURVE_CONFIG.virtualTokenReserves).toBe(1_073_000_000);
    expect(BONDING_CURVE_CONFIG.platformFeeBps).toBe(100);
    expect(BONDING_CURVE_CONFIG.creatorFeeLiveBps).toBe(200);
    expect(BONDING_CURVE_CONFIG.creatorFeeOfflineBps).toBe(20);
    expect(BONDING_CURVE_CONFIG.graduationThresholdSol).toBe(85 * 1e9);
  });

  it('should maintain supply invariant', () => {
    const totalExpected = BONDING_CURVE_CONFIG.curveSupply + BONDING_CURVE_CONFIG.creatorSupply;
    expect(totalExpected).toBe(BONDING_CURVE_CONFIG.totalSupply);
  });
});

describe('calculatePrice', () => {
  it('should calculate initial price correctly', () => {
    const price = calculatePrice(
      BONDING_CURVE_CONFIG.virtualSolReserves,
      BONDING_CURVE_CONFIG.virtualTokenReserves
    );
    // Expected: 30 SOL / 1,073,000,000 tokens = 0.00000002796 SOL/token (in lamports)
    expect(price).toBeCloseTo(0.00000002796, 11);
  });

  it('should return 0 for zero token reserves', () => {
    const price = calculatePrice(30 * 1e9, 0);
    expect(price).toBe(0);
  });

  it('should increase price as reserves decrease', () => {
    const price1 = calculatePrice(30 * 1e9, 1_073_000_000);
    const price2 = calculatePrice(30 * 1e9, 500_000_000);
    expect(price2).toBeGreaterThan(price1);
  });

  it('should handle very small reserves', () => {
    const price = calculatePrice(1e9, 1000);
    expect(price).toBe(1_000_000);
  });
});

describe('calculateBuyCost', () => {
  const virtualSol = BONDING_CURVE_CONFIG.virtualSolReserves;
  const virtualTokens = BONDING_CURVE_CONFIG.virtualTokenReserves;

  describe('Basic Buy Calculations', () => {
    it('should calculate cost for buying 1M tokens when live', () => {
      const result = calculateBuyCost(virtualSol, virtualTokens, 1_000_000, true);

      expect(result.solRequired).toBeGreaterThan(0);
      expect(result.platformFee).toBe(Math.floor(result.solRequired * 0.01));
      expect(result.creatorFee).toBe(Math.floor(result.solRequired * 0.02)); // 2% when live
      expect(result.totalCost).toBe(result.solRequired + result.platformFee + result.creatorFee);
      expect(result.priceImpact).toBeGreaterThan(0);
      expect(result.newPrice).toBeGreaterThan(result.solRequired / 1_000_000);
    });

    it('should calculate cost for buying 1M tokens when offline', () => {
      const result = calculateBuyCost(virtualSol, virtualTokens, 1_000_000, false);

      expect(result.creatorFee).toBe(Math.floor(result.solRequired * 0.002)); // 0.2% when offline
      expect(result.totalCost).toBe(result.solRequired + result.platformFee + result.creatorFee);
    });

    it('should have higher fees when creator is live', () => {
      const resultLive = calculateBuyCost(virtualSol, virtualTokens, 1_000_000, true);
      const resultOffline = calculateBuyCost(virtualSol, virtualTokens, 1_000_000, false);

      expect(resultLive.creatorFee).toBeGreaterThan(resultOffline.creatorFee);
      expect(resultLive.totalCost).toBeGreaterThan(resultOffline.totalCost);
    });
  });

  describe('Price Impact', () => {
    it('should have minimal price impact for small buys', () => {
      const result = calculateBuyCost(virtualSol, virtualTokens, 1000, true);
      expect(result.priceImpact).toBeLessThan(0.01); // Less than 0.01%
    });

    it('should have significant price impact for large buys', () => {
      const result = calculateBuyCost(virtualSol, virtualTokens, 100_000_000, true);
      expect(result.priceImpact).toBeGreaterThan(1); // More than 1%
    });

    it('should increase price impact proportionally with buy size', () => {
      const small = calculateBuyCost(virtualSol, virtualTokens, 1_000_000, true);
      const medium = calculateBuyCost(virtualSol, virtualTokens, 10_000_000, true);
      const large = calculateBuyCost(virtualSol, virtualTokens, 100_000_000, true);

      expect(medium.priceImpact).toBeGreaterThan(small.priceImpact);
      expect(large.priceImpact).toBeGreaterThan(medium.priceImpact);
    });
  });

  describe('Fee Calculations', () => {
    it('should calculate platform fee at 1%', () => {
      const result = calculateBuyCost(virtualSol, virtualTokens, 10_000_000, true);
      const expectedPlatformFee = Math.floor(result.solRequired * 0.01);
      expect(result.platformFee).toBe(expectedPlatformFee);
    });

    it('should calculate creator fee at 2% when live', () => {
      const result = calculateBuyCost(virtualSol, virtualTokens, 10_000_000, true);
      const expectedCreatorFee = Math.floor(result.solRequired * 0.02);
      expect(result.creatorFee).toBe(expectedCreatorFee);
    });

    it('should calculate creator fee at 0.2% when offline', () => {
      const result = calculateBuyCost(virtualSol, virtualTokens, 10_000_000, false);
      const expectedCreatorFee = Math.floor(result.solRequired * 0.002);
      expect(result.creatorFee).toBe(expectedCreatorFee);
    });

    it('should have total fees equal to platform + creator fees', () => {
      const result = calculateBuyCost(virtualSol, virtualTokens, 10_000_000, true);
      const totalFees = result.platformFee + result.creatorFee;
      expect(result.totalCost).toBe(result.solRequired + totalFees);
    });
  });

  describe('Constant Product Formula (x * y = k)', () => {
    it('should maintain constant k after buy', () => {
      const k = virtualSol * virtualTokens;
      const tokenAmount = 10_000_000;
      const result = calculateBuyCost(virtualSol, virtualTokens, tokenAmount, true);

      const newVirtualTokens = virtualTokens - tokenAmount;
      const newVirtualSol = virtualSol + result.solRequired;
      const newK = newVirtualSol * newVirtualTokens;

      // K should remain approximately constant (allowing for rounding)
      expect(Math.abs(newK - k) / k).toBeLessThan(0.0001); // Within 0.01%
    });
  });

  describe('Edge Cases', () => {
    it('should throw error when trying to buy more tokens than available', () => {
      expect(() => {
        calculateBuyCost(virtualSol, virtualTokens, virtualTokens + 1, true);
      }).toThrow('Insufficient token supply');
    });

    it('should throw error when trying to buy all remaining tokens', () => {
      expect(() => {
        calculateBuyCost(virtualSol, virtualTokens, virtualTokens, true);
      }).toThrow('Insufficient token supply');
    });

    it('should handle buying exactly one token less than supply', () => {
      const result = calculateBuyCost(virtualSol, virtualTokens, virtualTokens - 1, true);
      expect(result.solRequired).toBeGreaterThan(0);
      expect(result.totalCost).toBeGreaterThan(result.solRequired);
    });

    it('should handle minimum buy (1 token)', () => {
      const result = calculateBuyCost(virtualSol, virtualTokens, 1, true);
      expect(result.solRequired).toBeGreaterThan(0);
      expect(result.platformFee).toBeGreaterThanOrEqual(0);
      expect(result.creatorFee).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Progressive Buys', () => {
    it('should have increasing cost per token for sequential buys', () => {
      const buy1 = calculateBuyCost(virtualSol, virtualTokens, 10_000_000, true);
      const tokensAfterBuy1 = virtualTokens - 10_000_000;
      const solAfterBuy1 = virtualSol + buy1.solRequired;

      const buy2 = calculateBuyCost(solAfterBuy1, tokensAfterBuy1, 10_000_000, true);

      const costPerToken1 = buy1.solRequired / 10_000_000;
      const costPerToken2 = buy2.solRequired / 10_000_000;

      expect(costPerToken2).toBeGreaterThan(costPerToken1);
    });
  });
});

describe('calculateSellOutput', () => {
  const virtualSol = BONDING_CURVE_CONFIG.virtualSolReserves;
  const virtualTokens = BONDING_CURVE_CONFIG.virtualTokenReserves;

  describe('Basic Sell Calculations', () => {
    it('should calculate output for selling 1M tokens when live', () => {
      const result = calculateSellOutput(virtualSol, virtualTokens, 1_000_000, true);

      expect(result.solToReturn).toBeGreaterThan(0);
      expect(result.platformFee).toBe(Math.floor(result.solToReturn * 0.01));
      expect(result.creatorFee).toBe(Math.floor(result.solToReturn * 0.02));
      expect(result.netOutput).toBe(result.solToReturn - result.platformFee - result.creatorFee);
      expect(result.priceImpact).toBeGreaterThan(0);
    });

    it('should calculate output for selling 1M tokens when offline', () => {
      const result = calculateSellOutput(virtualSol, virtualTokens, 1_000_000, false);

      expect(result.creatorFee).toBe(Math.floor(result.solToReturn * 0.002));
      expect(result.netOutput).toBe(result.solToReturn - result.platformFee - result.creatorFee);
    });
  });

  describe('Sell vs Buy Symmetry', () => {
    it('should have lower net output than buy cost for same amount (due to fees)', () => {
      const buyResult = calculateBuyCost(virtualSol, virtualTokens, 10_000_000, true);
      const sellResult = calculateSellOutput(virtualSol, virtualTokens, 10_000_000, true);

      // Selling should give you less than buying costs due to price impact and fees
      expect(sellResult.netOutput).toBeLessThan(buyResult.totalCost);
    });

    it('should have lower sell price than buy price (bid-ask spread)', () => {
      const buyResult = calculateBuyCost(virtualSol, virtualTokens, 10_000_000, true);
      const sellResult = calculateSellOutput(virtualSol, virtualTokens, 10_000_000, true);

      const buyPricePerToken = buyResult.totalCost / 10_000_000;
      const sellPricePerToken = sellResult.netOutput / 10_000_000;

      expect(sellPricePerToken).toBeLessThan(buyPricePerToken);
    });
  });

  describe('Round-trip Trading (Buy then Sell)', () => {
    it('should result in a net loss due to fees and price impact', () => {
      // Buy tokens
      const buyResult = calculateBuyCost(virtualSol, virtualTokens, 10_000_000, true);
      const newSolReserves = virtualSol + buyResult.solRequired;
      const newTokenReserves = virtualTokens - 10_000_000;

      // Sell tokens back immediately
      const sellResult = calculateSellOutput(newSolReserves, newTokenReserves, 10_000_000, true);

      // Net loss should be total fees paid
      const netLoss = buyResult.totalCost - sellResult.netOutput;
      const expectedFees = buyResult.platformFee + buyResult.creatorFee +
                          sellResult.platformFee + sellResult.creatorFee;

      expect(netLoss).toBeGreaterThan(expectedFees * 0.9); // Allow for rounding
    });
  });

  describe('Price Impact', () => {
    it('should have minimal price impact for small sells', () => {
      const result = calculateSellOutput(virtualSol, virtualTokens, 1000, true);
      expect(result.priceImpact).toBeLessThan(0.01);
    });

    it('should have significant price impact for large sells', () => {
      const result = calculateSellOutput(virtualSol, virtualTokens, 100_000_000, true);
      expect(result.priceImpact).toBeGreaterThan(1);
    });
  });

  describe('Constant Product Formula', () => {
    it('should maintain constant k after sell', () => {
      const k = virtualSol * virtualTokens;
      const tokenAmount = 10_000_000;
      const result = calculateSellOutput(virtualSol, virtualTokens, tokenAmount, true);

      const newVirtualTokens = virtualTokens + tokenAmount;
      const newVirtualSol = virtualSol - result.solToReturn;
      const newK = newVirtualSol * newVirtualTokens;

      expect(Math.abs(newK - k) / k).toBeLessThan(0.0001);
    });
  });

  describe('Edge Cases', () => {
    it('should handle selling minimum amount (1 token)', () => {
      const result = calculateSellOutput(virtualSol, virtualTokens, 1, true);
      expect(result.solToReturn).toBeGreaterThan(0);
    });

    it('should handle selling large amounts', () => {
      const result = calculateSellOutput(virtualSol, virtualTokens, 500_000_000, true);
      expect(result.solToReturn).toBeGreaterThan(0);
      expect(result.netOutput).toBeGreaterThan(0);
    });

    it('should not allow selling more than reasonable amounts', () => {
      // This should work but with diminishing returns
      const result = calculateSellOutput(virtualSol, virtualTokens, 1_000_000_000, true);
      expect(result.solToReturn).toBeLessThan(virtualSol); // Can't get more SOL than in reserves
    });
  });
});

describe('calculateMarketCap', () => {
  it('should calculate market cap correctly at initial price', () => {
    const initialPrice = calculatePrice(
      BONDING_CURVE_CONFIG.virtualSolReserves,
      BONDING_CURVE_CONFIG.virtualTokenReserves
    );
    const marketCap = calculateMarketCap(initialPrice);

    // Market cap = price * total supply
    const expected = initialPrice * BONDING_CURVE_CONFIG.totalSupply;
    expect(marketCap).toBe(expected);
  });

  it('should increase market cap as price increases', () => {
    const price1 = 0.00000002796;
    const price2 = 0.00000005;

    const marketCap1 = calculateMarketCap(price1);
    const marketCap2 = calculateMarketCap(price2);

    expect(marketCap2).toBeGreaterThan(marketCap1);
  });

  it('should handle zero price', () => {
    const marketCap = calculateMarketCap(0);
    expect(marketCap).toBe(0);
  });
});

describe('calculateProgress', () => {
  it('should return 0% at the start', () => {
    const progress = calculateProgress(0);
    expect(progress).toBe(0);
  });

  it('should return 50% at half curve supply', () => {
    const progress = calculateProgress(BONDING_CURVE_CONFIG.curveSupply / 2);
    expect(progress).toBe(50);
  });

  it('should return 100% at full curve supply', () => {
    const progress = calculateProgress(BONDING_CURVE_CONFIG.curveSupply);
    expect(progress).toBe(100);
  });

  it('should cap at 100% even if oversold', () => {
    const progress = calculateProgress(BONDING_CURVE_CONFIG.curveSupply * 2);
    expect(progress).toBe(100);
  });

  it('should return correct progress for 25%', () => {
    const progress = calculateProgress(BONDING_CURVE_CONFIG.curveSupply * 0.25);
    expect(progress).toBe(25);
  });
});

describe('shouldGraduate', () => {
  it('should return false below threshold', () => {
    const shouldGrad = shouldGraduate(84 * 1e9);
    expect(shouldGrad).toBe(false);
  });

  it('should return true at threshold', () => {
    const shouldGrad = shouldGraduate(85 * 1e9);
    expect(shouldGrad).toBe(true);
  });

  it('should return true above threshold', () => {
    const shouldGrad = shouldGraduate(100 * 1e9);
    expect(shouldGrad).toBe(true);
  });

  it('should return false at zero', () => {
    const shouldGrad = shouldGraduate(0);
    expect(shouldGrad).toBe(false);
  });
});

describe('calculateExpectedReturns', () => {
  it('should calculate positive returns for price increase', () => {
    const entryPrice = 0.00000003;
    const exitPrice = 0.00000006;
    const tokenAmount = 1_000_000;

    const returns = calculateExpectedReturns(entryPrice, exitPrice, tokenAmount, true);

    expect(returns.grossProfit).toBeGreaterThan(0);
    expect(returns.fees).toBeGreaterThan(0);
    expect(returns.netProfit).toBe(returns.grossProfit - returns.fees);
    expect(returns.roi).toBeGreaterThan(0);
  });

  it('should calculate negative returns for price decrease', () => {
    const entryPrice = 0.00000006;
    const exitPrice = 0.00000003;
    const tokenAmount = 1_000_000;

    const returns = calculateExpectedReturns(entryPrice, exitPrice, tokenAmount, true);

    expect(returns.grossProfit).toBeLessThan(0);
    expect(returns.netProfit).toBeLessThan(returns.grossProfit);
    expect(returns.roi).toBeLessThan(0);
  });

  it('should have lower fees when offline', () => {
    const entryPrice = 0.00000003;
    const exitPrice = 0.00000006;
    const tokenAmount = 1_000_000;

    const liveReturns = calculateExpectedReturns(entryPrice, exitPrice, tokenAmount, true);
    const offlineReturns = calculateExpectedReturns(entryPrice, exitPrice, tokenAmount, false);

    expect(offlineReturns.fees).toBeLessThan(liveReturns.fees);
    expect(offlineReturns.netProfit).toBeGreaterThan(liveReturns.netProfit);
  });

  it('should calculate ROI correctly', () => {
    const entryPrice = 0.00000002;
    const exitPrice = 0.00000004; // 2x price
    const tokenAmount = 1_000_000;

    const returns = calculateExpectedReturns(entryPrice, exitPrice, tokenAmount, false);

    // ROI should be positive but less than 100% due to fees
    expect(returns.roi).toBeGreaterThan(0);
    expect(returns.roi).toBeLessThan(100);
  });
});

describe('simulateCurveProgression', () => {
  it('should generate correct number of steps', () => {
    const steps = 10;
    const progression = simulateCurveProgression(steps);
    expect(progression).toHaveLength(steps + 1); // +1 for step 0
  });

  it('should show increasing price throughout progression', () => {
    const progression = simulateCurveProgression(10);

    for (let i = 1; i < progression.length; i++) {
      expect(progression[i].price).toBeGreaterThan(progression[i - 1].price);
    }
  });

  it('should show increasing market cap throughout progression', () => {
    const progression = simulateCurveProgression(10);

    for (let i = 1; i < progression.length; i++) {
      expect(progression[i].marketCap).toBeGreaterThan(progression[i - 1].marketCap);
    }
  });

  it('should end at 100% progress', () => {
    const progression = simulateCurveProgression(10);
    const lastStep = progression[progression.length - 1];
    expect(lastStep.progress).toBe(100);
  });

  it('should start at 0 tokens sold', () => {
    const progression = simulateCurveProgression(10);
    expect(progression[0].tokensSold).toBe(0);
  });

  it('should end at curve supply tokens sold', () => {
    const progression = simulateCurveProgression(10);
    const lastStep = progression[progression.length - 1];
    expect(lastStep.tokensSold).toBe(BONDING_CURVE_CONFIG.curveSupply);
  });
});

describe('calculateSlippage', () => {
  it('should calculate zero slippage for identical prices', () => {
    const slippage = calculateSlippage(0.00000003, 0.00000003);
    expect(slippage).toBe(0);
  });

  it('should calculate positive slippage for price increase', () => {
    const slippage = calculateSlippage(0.00000003, 0.000000033);
    expect(slippage).toBeGreaterThan(0);
    expect(slippage).toBeCloseTo(10, 0); // ~10% increase
  });

  it('should calculate positive slippage for price decrease (absolute value)', () => {
    const slippage = calculateSlippage(0.00000003, 0.000000027);
    expect(slippage).toBeGreaterThan(0);
    expect(slippage).toBeCloseTo(10, 0); // ~10% decrease
  });

  it('should handle large slippage', () => {
    const slippage = calculateSlippage(0.00000003, 0.00000006);
    expect(slippage).toBeCloseTo(100, 0); // 100% slippage
  });
});

describe('Real-world Scenarios', () => {
  describe('Early stage trading', () => {
    it('should allow small trades with minimal slippage', () => {
      const virtualSol = BONDING_CURVE_CONFIG.virtualSolReserves;
      const virtualTokens = BONDING_CURVE_CONFIG.virtualTokenReserves;

      const buy = calculateBuyCost(virtualSol, virtualTokens, 100_000, true);
      expect(buy.priceImpact).toBeLessThan(0.1); // Less than 0.1%
    });
  });

  describe('Mid-stage trading', () => {
    it('should have moderate slippage for medium trades', () => {
      const virtualSol = BONDING_CURVE_CONFIG.virtualSolReserves;
      const tokensSold = BONDING_CURVE_CONFIG.curveSupply / 2;
      const virtualTokens = BONDING_CURVE_CONFIG.virtualTokenReserves - tokensSold;

      const buy = calculateBuyCost(virtualSol, virtualTokens, 10_000_000, true);
      expect(buy.priceImpact).toBeGreaterThan(0);
      expect(buy.priceImpact).toBeLessThan(10);
    });
  });

  describe('Near graduation', () => {
    it('should have high slippage for large trades near end', () => {
      const virtualSol = BONDING_CURVE_CONFIG.virtualSolReserves;
      const tokensSold = BONDING_CURVE_CONFIG.curveSupply * 0.9;
      const virtualTokens = BONDING_CURVE_CONFIG.virtualTokenReserves - tokensSold;

      const buy = calculateBuyCost(virtualSol, virtualTokens, 10_000_000, true);
      expect(buy.priceImpact).toBeGreaterThan(1); // More than 1%
    });
  });

  describe('Creator fee impact', () => {
    it('should show significant fee difference between live and offline', () => {
      const virtualSol = BONDING_CURVE_CONFIG.virtualSolReserves;
      const virtualTokens = BONDING_CURVE_CONFIG.virtualTokenReserves;
      const amount = 50_000_000;

      const buyLive = calculateBuyCost(virtualSol, virtualTokens, amount, true);
      const buyOffline = calculateBuyCost(virtualSol, virtualTokens, amount, false);

      const feeDifference = buyLive.creatorFee - buyOffline.creatorFee;
      expect(feeDifference).toBeGreaterThan(0);

      // Live should have ~10x more creator fees (2% vs 0.2%)
      expect(buyLive.creatorFee).toBeGreaterThan(buyOffline.creatorFee * 9);
    });
  });
});
