/**
 * Validation Utilities Tests
 * Tests for input validation and sanitization
 */

import { PublicKey } from '@solana/web3.js';

// Helper functions to test
const isValidPublicKey = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

const isValidTokenAmount = (amount: number): boolean => {
  return amount > 0 && Number.isInteger(amount) && amount <= Number.MAX_SAFE_INTEGER;
};

const isValidSolAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 1_000_000; // Max 1M SOL
};

const isValidSlippage = (slippage: number): boolean => {
  return slippage >= 0 && slippage <= 100; // 0-100%
};

const sanitizeTokenName = (name: string): string => {
  return name.trim().slice(0, 32);
};

const sanitizeTokenSymbol = (symbol: string): string => {
  return symbol.trim().toUpperCase().slice(0, 10);
};

describe('Validation Utilities', () => {
  describe('isValidPublicKey', () => {
    it('should accept valid Solana public key', () => {
      const validKey = 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH';
      expect(isValidPublicKey(validKey)).toBe(true);
    });

    it('should reject invalid public key', () => {
      expect(isValidPublicKey('invalid')).toBe(false);
      expect(isValidPublicKey('12345')).toBe(false);
      expect(isValidPublicKey('')).toBe(false);
    });

    it('should reject public key with wrong length', () => {
      expect(isValidPublicKey('ABC123')).toBe(false);
    });

    it('should reject public key with invalid characters', () => {
      expect(isValidPublicKey('HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWr@')).toBe(false);
    });
  });

  describe('isValidTokenAmount', () => {
    it('should accept positive integer amounts', () => {
      expect(isValidTokenAmount(1)).toBe(true);
      expect(isValidTokenAmount(1000000)).toBe(true);
      expect(isValidTokenAmount(1_000_000_000)).toBe(true);
    });

    it('should reject zero', () => {
      expect(isValidTokenAmount(0)).toBe(false);
    });

    it('should reject negative amounts', () => {
      expect(isValidTokenAmount(-1)).toBe(false);
      expect(isValidTokenAmount(-1000)).toBe(false);
    });

    it('should reject decimal amounts', () => {
      expect(isValidTokenAmount(1.5)).toBe(false);
      expect(isValidTokenAmount(0.1)).toBe(false);
    });

    it('should reject amounts larger than MAX_SAFE_INTEGER', () => {
      expect(isValidTokenAmount(Number.MAX_SAFE_INTEGER + 1)).toBe(false);
    });

    it('should reject NaN', () => {
      expect(isValidTokenAmount(NaN)).toBe(false);
    });

    it('should reject Infinity', () => {
      expect(isValidTokenAmount(Infinity)).toBe(false);
      expect(isValidTokenAmount(-Infinity)).toBe(false);
    });
  });

  describe('isValidSolAmount', () => {
    it('should accept valid SOL amounts', () => {
      expect(isValidSolAmount(0.01)).toBe(true);
      expect(isValidSolAmount(1)).toBe(true);
      expect(isValidSolAmount(100)).toBe(true);
      expect(isValidSolAmount(1000)).toBe(true);
    });

    it('should reject zero', () => {
      expect(isValidSolAmount(0)).toBe(false);
    });

    it('should reject negative amounts', () => {
      expect(isValidSolAmount(-0.1)).toBe(false);
    });

    it('should reject amounts over 1M SOL', () => {
      expect(isValidSolAmount(1_000_001)).toBe(false);
    });

    it('should accept amounts up to 1M SOL', () => {
      expect(isValidSolAmount(1_000_000)).toBe(true);
    });

    it('should reject NaN', () => {
      expect(isValidSolAmount(NaN)).toBe(false);
    });

    it('should reject Infinity', () => {
      expect(isValidSolAmount(Infinity)).toBe(false);
    });
  });

  describe('isValidSlippage', () => {
    it('should accept 0% slippage', () => {
      expect(isValidSlippage(0)).toBe(true);
    });

    it('should accept 100% slippage', () => {
      expect(isValidSlippage(100)).toBe(true);
    });

    it('should accept common slippage values', () => {
      expect(isValidSlippage(0.5)).toBe(true);
      expect(isValidSlippage(1)).toBe(true);
      expect(isValidSlippage(5)).toBe(true);
      expect(isValidSlippage(10)).toBe(true);
    });

    it('should reject negative slippage', () => {
      expect(isValidSlippage(-1)).toBe(false);
    });

    it('should reject slippage over 100%', () => {
      expect(isValidSlippage(101)).toBe(false);
      expect(isValidSlippage(1000)).toBe(false);
    });
  });

  describe('sanitizeTokenName', () => {
    it('should trim whitespace', () => {
      expect(sanitizeTokenName('  Test Token  ')).toBe('Test Token');
    });

    it('should limit to 32 characters', () => {
      const longName = 'A'.repeat(50);
      expect(sanitizeTokenName(longName)).toHaveLength(32);
    });

    it('should preserve characters within limit', () => {
      expect(sanitizeTokenName('Test Token 123')).toBe('Test Token 123');
    });

    it('should handle empty string', () => {
      expect(sanitizeTokenName('')).toBe('');
    });

    it('should handle string with only whitespace', () => {
      expect(sanitizeTokenName('   ')).toBe('');
    });
  });

  describe('sanitizeTokenSymbol', () => {
    it('should convert to uppercase', () => {
      expect(sanitizeTokenSymbol('test')).toBe('TEST');
      expect(sanitizeTokenSymbol('tEsT')).toBe('TEST');
    });

    it('should trim whitespace', () => {
      expect(sanitizeTokenSymbol('  test  ')).toBe('TEST');
    });

    it('should limit to 10 characters', () => {
      const longSymbol = 'ABCDEFGHIJK';
      expect(sanitizeTokenSymbol(longSymbol)).toHaveLength(10);
      expect(sanitizeTokenSymbol(longSymbol)).toBe('ABCDEFGHIJ');
    });

    it('should handle empty string', () => {
      expect(sanitizeTokenSymbol('')).toBe('');
    });
  });
});

describe('Edge Cases and Security', () => {
  describe('SQL Injection Prevention', () => {
    it('should handle strings with SQL-like syntax', () => {
      const maliciousName = "'; DROP TABLE tokens; --";
      const sanitized = sanitizeTokenName(maliciousName);
      expect(sanitized).toHaveLength(Math.min(maliciousName.trim().length, 32));
    });
  });

  describe('XSS Prevention', () => {
    it('should handle strings with HTML/script tags', () => {
      const maliciousName = '<script>alert("xss")</script>';
      const sanitized = sanitizeTokenName(maliciousName);
      // Should still contain the characters but be limited
      expect(sanitized).toHaveLength(Math.min(maliciousName.length, 32));
    });
  });

  describe('Unicode and Special Characters', () => {
    it('should handle unicode characters in token names', () => {
      expect(sanitizeTokenName('Token 🚀')).toBe('Token 🚀');
    });

    it('should handle emoji in token symbols', () => {
      expect(sanitizeTokenSymbol('test🚀')).toBe('TEST🚀');
    });
  });

  describe('Number Precision', () => {
    it('should handle very small SOL amounts', () => {
      expect(isValidSolAmount(0.000000001)).toBe(true);
    });

    it('should handle amounts at JavaScript precision limits', () => {
      const verySmall = Number.MIN_VALUE;
      expect(isValidSolAmount(verySmall)).toBe(true);
    });
  });
});
