/**
 * Integration Tests - Token Trading Flow
 * End-to-end tests for complete token creation and trading workflows
 */

import {
  calculateBuyCost,
  calculateSellOutput,
  BONDING_CURVE_CONFIG,
} from '@/lib/utils/bonding-curve';

describe('Token Trading Flow Integration Tests', () => {
  describe('Complete Buy-Hold-Sell Scenario', () => {
    it('should simulate a complete trading lifecycle', () => {
      // Initial state
      let virtualSol = BONDING_CURVE_CONFIG.virtualSolReserves;
      let virtualTokens = BONDING_CURVE_CONFIG.virtualTokenReserves;
      let tokensSold = 0;

      // User 1 buys 10M tokens
      const buy1 = calculateBuyCost(virtualSol, virtualTokens, 10_000_000, false);
      virtualSol += buy1.solRequired;
      virtualTokens -= 10_000_000;
      tokensSold += 10_000_000;

      expect(buy1.solRequired).toBeGreaterThan(0);
      expect(buy1.totalCost).toBe(buy1.solRequired + buy1.platformFee + buy1.creatorFee);

      // User 2 buys 20M tokens (price should be higher)
      const buy2 = calculateBuyCost(virtualSol, virtualTokens, 20_000_000, false);
      virtualSol += buy2.solRequired;
      virtualTokens -= 20_000_000;
      tokensSold += 20_000_000;

      // Second buy should have higher average price
      const avgPrice1 = buy1.solRequired / 10_000_000;
      const avgPrice2 = buy2.solRequired / 20_000_000;
      expect(avgPrice2).toBeGreaterThan(avgPrice1);

      // User 1 sells their 10M tokens
      const sell1 = calculateSellOutput(virtualSol, virtualTokens, 10_000_000, false);
      virtualSol -= sell1.solToReturn;
      virtualTokens += 10_000_000;
      tokensSold -= 10_000_000;

      // User should get less back than they paid (fees + slippage)
      expect(sell1.netOutput).toBeLessThan(buy1.totalCost);

      // Calculate User 1's loss
      const loss = buy1.totalCost - sell1.netOutput;
      const fees = buy1.platformFee + buy1.creatorFee + sell1.platformFee + sell1.creatorFee;

      // Loss should be approximately equal to fees paid
      expect(loss).toBeGreaterThan(fees * 0.9);
      expect(loss).toBeLessThan(fees * 1.1);
    });

    it('should handle multiple sequential buys with price progression', () => {
      let virtualSol = BONDING_CURVE_CONFIG.virtualSolReserves;
      let virtualTokens = BONDING_CURVE_CONFIG.virtualTokenReserves;

      const buys = [];
      const buyAmount = 5_000_000;

      // Simulate 10 sequential buys
      for (let i = 0; i < 10; i++) {
        const buy = calculateBuyCost(virtualSol, virtualTokens, buyAmount, false);
        buys.push(buy);

        virtualSol += buy.solRequired;
        virtualTokens -= buyAmount;
      }

      // Each buy should have higher cost than previous
      for (let i = 1; i < buys.length; i++) {
        expect(buys[i].solRequired).toBeGreaterThan(buys[i - 1].solRequired);
      }

      // Price should be significantly higher at the end
      const firstPrice = buys[0].solRequired / buyAmount;
      const lastPrice = buys[9].solRequired / buyAmount;
      expect(lastPrice).toBeGreaterThan(firstPrice * 1.5);
    });
  });

  describe('Creator Fee Scenarios', () => {
    it('should earn more fees when live vs offline', () => {
      const virtualSol = BONDING_CURVE_CONFIG.virtualSolReserves;
      const virtualTokens = BONDING_CURVE_CONFIG.virtualTokenReserves;
      const amount = 10_000_000;

      // Buy when offline
      const buyOffline = calculateBuyCost(virtualSol, virtualTokens, amount, false);

      // Buy same amount when live
      const buyLive = calculateBuyCost(virtualSol, virtualTokens, amount, true);

      // Live should generate 10x more creator fees (2% vs 0.2%)
      expect(buyLive.creatorFee).toBeGreaterThan(buyOffline.creatorFee * 9);
      expect(buyLive.creatorFee).toBeLessThan(buyOffline.creatorFee * 11);

      // Platform fees should be the same
      expect(buyLive.platformFee).toBe(buyOffline.platformFee);
    });

    it('should accumulate creator fees correctly over multiple trades', () => {
      let virtualSol = BONDING_CURVE_CONFIG.virtualSolReserves;
      let virtualTokens = BONDING_CURVE_CONFIG.virtualTokenReserves;
      let totalCreatorFees = 0;

      // Simulate 5 buys while live
      for (let i = 0; i < 5; i++) {
        const buy = calculateBuyCost(virtualSol, virtualTokens, 5_000_000, true);
        totalCreatorFees += buy.creatorFee;

        virtualSol += buy.solRequired;
        virtualTokens -= 5_000_000;
      }

      // Creator should have earned significant fees
      expect(totalCreatorFees).toBeGreaterThan(0);

      // Fees should be approximately 2% of total SOL spent
      const totalSolSpent = virtualSol - BONDING_CURVE_CONFIG.virtualSolReserves;
      const expectedFees = totalSolSpent * 0.02;
      expect(totalCreatorFees).toBeCloseTo(expectedFees, -3); // Within 1000 lamports
    });
  });

  describe('Graduation Scenarios', () => {
    it('should track progress towards graduation', () => {
      const curveSupply = BONDING_CURVE_CONFIG.curveSupply;
      let tokensSold = 0;

      // Buy 10% of curve supply
      tokensSold += curveSupply * 0.1;
      const progress10 = (tokensSold / curveSupply) * 100;
      expect(progress10).toBeCloseTo(10, 1);

      // Buy 40% more
      tokensSold += curveSupply * 0.4;
      const progress50 = (tokensSold / curveSupply) * 100;
      expect(progress50).toBeCloseTo(50, 1);

      // Buy remaining to 100%
      tokensSold = curveSupply;
      const progress100 = (tokensSold / curveSupply) * 100;
      expect(progress100).toBe(100);
    });

    it('should prevent buying beyond curve supply', () => {
      const virtualSol = BONDING_CURVE_CONFIG.virtualSolReserves;
      const virtualTokens = BONDING_CURVE_CONFIG.virtualTokenReserves;

      // Try to buy all tokens
      expect(() => {
        calculateBuyCost(virtualSol, virtualTokens, virtualTokens, false);
      }).toThrow('Insufficient token supply');

      // Try to buy more than available
      expect(() => {
        calculateBuyCost(virtualSol, virtualTokens, virtualTokens + 1, false);
      }).toThrow('Insufficient token supply');
    });
  });

  describe('Market Making Scenarios', () => {
    it('should handle alternating buy and sell orders', () => {
      let virtualSol = BONDING_CURVE_CONFIG.virtualSolReserves;
      let virtualTokens = BONDING_CURVE_CONFIG.virtualTokenReserves;

      // Buy
      const buy1 = calculateBuyCost(virtualSol, virtualTokens, 5_000_000, false);
      virtualSol += buy1.solRequired;
      virtualTokens -= 5_000_000;

      // Sell half
      const sell1 = calculateSellOutput(virtualSol, virtualTokens, 2_500_000, false);
      virtualSol -= sell1.solToReturn;
      virtualTokens += 2_500_000;

      // Buy again
      const buy2 = calculateBuyCost(virtualSol, virtualTokens, 5_000_000, false);
      virtualSol += buy2.solRequired;
      virtualTokens -= 5_000_000;

      // Sell remaining from first buy
      const sell2 = calculateSellOutput(virtualSol, virtualTokens, 2_500_000, false);

      // All operations should complete successfully
      expect(buy1.totalCost).toBeGreaterThan(0);
      expect(sell1.netOutput).toBeGreaterThan(0);
      expect(buy2.totalCost).toBeGreaterThan(0);
      expect(sell2.netOutput).toBeGreaterThan(0);
    });

    it('should maintain liquidity at different curve positions', () => {
      const checkLiquidity = (tokensSold: number) => {
        const virtualSol = BONDING_CURVE_CONFIG.virtualSolReserves;
        const virtualTokens = BONDING_CURVE_CONFIG.virtualTokenReserves - tokensSold;

        const smallBuy = calculateBuyCost(virtualSol, virtualTokens, 100_000, false);
        expect(smallBuy.priceImpact).toBeLessThan(1); // Should have <1% impact

        return smallBuy;
      };

      // Check at 0% sold
      const early = checkLiquidity(0);

      // Check at 25% sold
      const mid = checkLiquidity(BONDING_CURVE_CONFIG.curveSupply * 0.25);

      // Check at 75% sold
      const late = checkLiquidity(BONDING_CURVE_CONFIG.curveSupply * 0.75);

      // All should have low slippage, but later positions cost more
      expect(mid.solRequired).toBeGreaterThan(early.solRequired);
      expect(late.solRequired).toBeGreaterThan(mid.solRequired);
    });
  });

  describe('Edge Case Scenarios', () => {
    it('should handle minimum viable trades', () => {
      const virtualSol = BONDING_CURVE_CONFIG.virtualSolReserves;
      const virtualTokens = BONDING_CURVE_CONFIG.virtualTokenReserves;

      // Buy 1 token
      const buy = calculateBuyCost(virtualSol, virtualTokens, 1, false);
      expect(buy.solRequired).toBeGreaterThan(0);
      expect(buy.totalCost).toBeGreaterThan(buy.solRequired);

      // Sell 1 token
      const sell = calculateSellOutput(virtualSol, virtualTokens, 1, false);
      expect(sell.netOutput).toBeGreaterThan(0);
      expect(sell.netOutput).toBeLessThan(sell.solToReturn);
    });

    it('should handle maximum reasonable trades', () => {
      const virtualSol = BONDING_CURVE_CONFIG.virtualSolReserves;
      const virtualTokens = BONDING_CURVE_CONFIG.virtualTokenReserves;
      const maxSafe = Math.floor(virtualTokens * 0.9); // 90% of supply

      const buy = calculateBuyCost(virtualSol, virtualTokens, maxSafe, false);
      expect(buy.solRequired).toBeGreaterThan(0);
      expect(buy.priceImpact).toBeGreaterThan(10); // Should have high impact
    });

    it('should handle rapid sequential small trades', () => {
      let virtualSol = BONDING_CURVE_CONFIG.virtualSolReserves;
      let virtualTokens = BONDING_CURVE_CONFIG.virtualTokenReserves;
      let totalCost = 0;

      // 100 small buys
      for (let i = 0; i < 100; i++) {
        const buy = calculateBuyCost(virtualSol, virtualTokens, 10_000, false);
        totalCost += buy.totalCost;
        virtualSol += buy.solRequired;
        virtualTokens -= 10_000;
      }

      // Should match bulk buy approximately
      const bulkBuy = calculateBuyCost(
        BONDING_CURVE_CONFIG.virtualSolReserves,
        BONDING_CURVE_CONFIG.virtualTokenReserves,
        1_000_000,
        false
      );

      // Costs should be similar (within 1% due to rounding)
      expect(totalCost).toBeGreaterThan(bulkBuy.totalCost * 0.99);
      expect(totalCost).toBeLessThan(bulkBuy.totalCost * 1.01);
    });
  });

  describe('Fee Distribution Scenarios', () => {
    it('should correctly split fees between platform and creator', () => {
      const virtualSol = BONDING_CURVE_CONFIG.virtualSolReserves;
      const virtualTokens = BONDING_CURVE_CONFIG.virtualTokenReserves;

      const buy = calculateBuyCost(virtualSol, virtualTokens, 10_000_000, true);

      // Platform gets 1%
      const expectedPlatformFee = Math.floor(buy.solRequired * 0.01);
      expect(buy.platformFee).toBe(expectedPlatformFee);

      // Creator gets 2% when live
      const expectedCreatorFee = Math.floor(buy.solRequired * 0.02);
      expect(buy.creatorFee).toBe(expectedCreatorFee);

      // Total fees should be 3%
      const totalFees = buy.platformFee + buy.creatorFee;
      const expectedTotalFees = Math.floor(buy.solRequired * 0.03);
      expect(totalFees).toBeCloseTo(expectedTotalFees, 0);
    });

    it('should accumulate platform fees across multiple trades', () => {
      let virtualSol = BONDING_CURVE_CONFIG.virtualSolReserves;
      let virtualTokens = BONDING_CURVE_CONFIG.virtualTokenReserves;
      let totalPlatformFees = 0;
      let totalCreatorFees = 0;

      // Simulate 10 trades
      for (let i = 0; i < 10; i++) {
        const buy = calculateBuyCost(virtualSol, virtualTokens, 5_000_000, true);
        totalPlatformFees += buy.platformFee;
        totalCreatorFees += buy.creatorFee;

        virtualSol += buy.solRequired;
        virtualTokens -= 5_000_000;
      }

      // Creator should earn more fees (2% vs 1%)
      expect(totalCreatorFees).toBeGreaterThan(totalPlatformFees * 1.9);
      expect(totalCreatorFees).toBeLessThan(totalPlatformFees * 2.1);
    });
  });

  describe('Realistic Trading Patterns', () => {
    it('should simulate early investor selling at profit', () => {
      let virtualSol = BONDING_CURVE_CONFIG.virtualSolReserves;
      let virtualTokens = BONDING_CURVE_CONFIG.virtualTokenReserves;

      // Early investor buys 10M tokens
      const earlyBuy = calculateBuyCost(virtualSol, virtualTokens, 10_000_000, false);
      virtualSol += earlyBuy.solRequired;
      virtualTokens -= 10_000_000;

      // Other traders buy 100M tokens total (driving price up)
      for (let i = 0; i < 10; i++) {
        const buy = calculateBuyCost(virtualSol, virtualTokens, 10_000_000, false);
        virtualSol += buy.solRequired;
        virtualTokens -= 10_000_000;
      }

      // Early investor sells
      const earlySell = calculateSellOutput(virtualSol, virtualTokens, 10_000_000, false);

      // Should have profit after fees
      const profit = earlySell.netOutput - earlyBuy.totalCost;
      expect(profit).toBeGreaterThan(0);
    });

    it('should simulate whale dumping scenario', () => {
      let virtualSol = BONDING_CURVE_CONFIG.virtualSolReserves;
      let virtualTokens = BONDING_CURVE_CONFIG.virtualTokenReserves;

      // Whale buys 100M tokens
      const whaleBuy = calculateBuyCost(virtualSol, virtualTokens, 100_000_000, false);
      virtualSol += whaleBuy.solRequired;
      virtualTokens -= 100_000_000;

      const priceAfterBuy = virtualSol / virtualTokens;

      // Whale dumps 50M tokens
      const whaleSell = calculateSellOutput(virtualSol, virtualTokens, 50_000_000, false);
      virtualSol -= whaleSell.solToReturn;
      virtualTokens += 50_000_000;

      const priceAfterSell = virtualSol / virtualTokens;

      // Price should drop significantly
      expect(priceAfterSell).toBeLessThan(priceAfterBuy);
      const priceDropPercent = ((priceAfterBuy - priceAfterSell) / priceAfterBuy) * 100;
      expect(priceDropPercent).toBeGreaterThan(5); // At least 5% drop
    });
  });
});
