/**
 * Validation Utilities
 * Input validation and sanitization helpers
 */

import { PublicKey } from '@solana/web3.js';

/**
 * Validate Solana wallet address
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate token name
 */
export function validateTokenName(name: string): {
  valid: boolean;
  error?: string;
} {
  if (!name || name.length === 0) {
    return { valid: false, error: 'Token name is required' };
  }
  if (name.length > 32) {
    return { valid: false, error: 'Token name must be 32 characters or less' };
  }
  if (!/^[a-zA-Z0-9\s-_]+$/.test(name)) {
    return { valid: false, error: 'Token name contains invalid characters' };
  }
  return { valid: true };
}

/**
 * Validate token symbol
 */
export function validateTokenSymbol(symbol: string): {
  valid: boolean;
  error?: string;
} {
  if (!symbol || symbol.length === 0) {
    return { valid: false, error: 'Token symbol is required' };
  }
  if (symbol.length > 10) {
    return { valid: false, error: 'Token symbol must be 10 characters or less' };
  }
  if (!/^[A-Z0-9]+$/.test(symbol)) {
    return { valid: false, error: 'Token symbol must be uppercase letters and numbers only' };
  }
  return { valid: true };
}

/**
 * Validate token URI
 */
export function validateTokenUri(uri: string): {
  valid: boolean;
  error?: string;
} {
  if (!uri || uri.length === 0) {
    return { valid: false, error: 'Token URI is required' };
  }
  if (uri.length > 200) {
    return { valid: false, error: 'Token URI must be 200 characters or less' };
  }
  try {
    new URL(uri);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Token URI must be a valid URL' };
  }
}

/**
 * Validate Twitter username
 */
export function validateTwitterUsername(username: string): {
  valid: boolean;
  error?: string;
} {
  if (!username) {
    return { valid: true }; // Optional field
  }
  if (username.length > 15) {
    return { valid: false, error: 'Twitter username must be 15 characters or less' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: 'Twitter username contains invalid characters' };
  }
  return { valid: true };
}

/**
 * Validate Twitch username
 */
export function validateTwitchUsername(username: string): {
  valid: boolean;
  error?: string;
} {
  if (!username) {
    return { valid: true }; // Optional field
  }
  if (username.length < 4 || username.length > 25) {
    return { valid: false, error: 'Twitch username must be 4-25 characters' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: 'Twitch username contains invalid characters' };
  }
  return { valid: true };
}

/**
 * Validate trade amount
 */
export function validateTradeAmount(
  amount: number,
  maxAmount: number
): {
  valid: boolean;
  error?: string;
} {
  if (amount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  if (amount > maxAmount) {
    return { valid: false, error: `Amount exceeds maximum of ${maxAmount}` };
  }
  if (!Number.isInteger(amount)) {
    return { valid: false, error: 'Amount must be a whole number' };
  }
  return { valid: true };
}

/**
 * Validate SOL amount
 */
export function validateSolAmount(
  amount: number,
  minAmount: number = 0.001,
  maxAmount: number = 1000
): {
  valid: boolean;
  error?: string;
} {
  if (amount < minAmount) {
    return { valid: false, error: `Amount must be at least ${minAmount} SOL` };
  }
  if (amount > maxAmount) {
    return { valid: false, error: `Amount exceeds maximum of ${maxAmount} SOL` };
  }
  return { valid: true };
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>\"']/g, '') // Remove potential XSS characters
    .slice(0, 1000); // Limit length
}

/**
 * Validate slippage tolerance (0-100%)
 */
export function validateSlippage(slippage: number): {
  valid: boolean;
  error?: string;
} {
  if (slippage < 0 || slippage > 100) {
    return { valid: false, error: 'Slippage must be between 0% and 100%' };
  }
  if (slippage > 50) {
    return { valid: false, error: 'Slippage tolerance too high (max 50%)' };
  }
  return { valid: true };
}

/**
 * Rate limiting check (simple in-memory implementation)
 */
const rateLimitMap = new Map<string, number[]>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Get existing requests
  let requests = rateLimitMap.get(identifier) || [];

  // Filter out old requests
  requests = requests.filter(timestamp => timestamp > windowStart);

  // Check if limit exceeded
  const allowed = requests.length < maxRequests;
  const remaining = Math.max(0, maxRequests - requests.length - 1);

  if (allowed) {
    requests.push(now);
    rateLimitMap.set(identifier, requests);
  }

  const resetAt = requests.length > 0 ? requests[0] + windowMs : now + windowMs;

  return { allowed, remaining, resetAt };
}

/**
 * Clean up old rate limit entries (call periodically)
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  const windowMs = 60000;

  for (const [identifier, requests] of rateLimitMap.entries()) {
    const validRequests = requests.filter(timestamp => timestamp > now - windowMs);
    if (validRequests.length === 0) {
      rateLimitMap.delete(identifier);
    } else {
      rateLimitMap.set(identifier, validRequests);
    }
  }
}
