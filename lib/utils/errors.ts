/**
 * Error Handling Utilities
 * Standardized error types and handlers
 */

export enum ErrorCode {
  // Validation errors (400)
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_WALLET = 'INVALID_WALLET',
  INVALID_TOKEN = 'INVALID_TOKEN',
  INVALID_AMOUNT = 'INVALID_AMOUNT',

  // Authentication errors (401)
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',

  // Resource errors (404)
  TOKEN_NOT_FOUND = 'TOKEN_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',

  // Conflict errors (409)
  TOKEN_ALREADY_EXISTS = 'TOKEN_ALREADY_EXISTS',
  DUPLICATE_TRANSACTION = 'DUPLICATE_TRANSACTION',

  // Business logic errors (422)
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  INSUFFICIENT_LIQUIDITY = 'INSUFFICIENT_LIQUIDITY',
  SLIPPAGE_EXCEEDED = 'SLIPPAGE_EXCEEDED',
  TOKEN_GRADUATED = 'TOKEN_GRADUATED',
  TRADE_TOO_SMALL = 'TRADE_TOO_SMALL',
  TRADE_TOO_LARGE = 'TRADE_TOO_LARGE',

  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Server errors (500)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  BLOCKCHAIN_ERROR = 'BLOCKCHAIN_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
}

export class ZeroglazeError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(code: ErrorCode, message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'ZeroglazeError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

/**
 * Validation error
 */
export class ValidationError extends ZeroglazeError {
  constructor(message: string, details?: any) {
    super(ErrorCode.INVALID_INPUT, message, 400, details);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends ZeroglazeError {
  constructor(message: string = 'Authentication required') {
    super(ErrorCode.UNAUTHORIZED, message, 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Not found error
 */
export class NotFoundError extends ZeroglazeError {
  constructor(resource: string = 'Resource') {
    super(ErrorCode.TOKEN_NOT_FOUND, `${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict error
 */
export class ConflictError extends ZeroglazeError {
  constructor(message: string) {
    super(ErrorCode.TOKEN_ALREADY_EXISTS, message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * Business logic error
 */
export class BusinessLogicError extends ZeroglazeError {
  constructor(code: ErrorCode, message: string, details?: any) {
    super(code, message, 422, details);
    this.name = 'BusinessLogicError';
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends ZeroglazeError {
  constructor(resetAt: number) {
    super(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      'Too many requests. Please try again later.',
      429,
      { resetAt }
    );
    this.name = 'RateLimitError';
  }
}

/**
 * Internal server error
 */
export class InternalError extends ZeroglazeError {
  constructor(message: string = 'Internal server error', details?: any) {
    super(ErrorCode.INTERNAL_ERROR, message, 500, details);
    this.name = 'InternalError';
  }
}

/**
 * Handle blockchain errors
 */
export function handleBlockchainError(error: any): ZeroglazeError {
  console.error('Blockchain error:', error);

  // Parse Solana error codes
  if (error.message?.includes('insufficient funds')) {
    return new BusinessLogicError(
      ErrorCode.INSUFFICIENT_BALANCE,
      'Insufficient SOL balance for transaction'
    );
  }

  if (error.message?.includes('slippage')) {
    return new BusinessLogicError(
      ErrorCode.SLIPPAGE_EXCEEDED,
      'Price moved beyond slippage tolerance'
    );
  }

  if (error.message?.includes('custom program error: 0x1770')) {
    return new BusinessLogicError(
      ErrorCode.INSUFFICIENT_LIQUIDITY,
      'Insufficient liquidity in bonding curve'
    );
  }

  return new ZeroglazeError(
    ErrorCode.BLOCKCHAIN_ERROR,
    'Transaction failed on blockchain',
    500,
    { originalError: error.message }
  );
}

/**
 * Handle database errors
 */
export function handleDatabaseError(error: any): ZeroglazeError {
  console.error('Database error:', error);

  if (error.code === '23505') {
    return new ConflictError('Resource already exists');
  }

  if (error.code === '23503') {
    return new ValidationError('Referenced resource does not exist');
  }

  return new ZeroglazeError(
    ErrorCode.DATABASE_ERROR,
    'Database operation failed',
    500,
    { originalError: error.message }
  );
}

/**
 * Handle external API errors
 */
export function handleExternalApiError(error: any, service: string): ZeroglazeError {
  console.error(`External API error (${service}):`, error);

  return new ZeroglazeError(
    ErrorCode.EXTERNAL_API_ERROR,
    `Failed to communicate with ${service}`,
    503,
    { service, originalError: error.message }
  );
}

/**
 * Error logger
 */
export function logError(error: Error | ZeroglazeError, context?: any): void {
  const timestamp = new Date().toISOString();

  const logEntry = {
    timestamp,
    name: error.name,
    message: error.message,
    stack: error.stack,
    context,
  };

  if (error instanceof ZeroglazeError) {
    Object.assign(logEntry, {
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    });
  }

  // In production, send to logging service (Sentry, DataDog, etc.)
  console.error('[ERROR]', JSON.stringify(logEntry, null, 2));
}

/**
 * Async error wrapper
 */
export function asyncHandler<T>(
  fn: (...args: any[]) => Promise<T>
): (...args: any[]) => Promise<T> {
  return async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof ZeroglazeError) {
        throw error;
      }
      logError(error as Error, { args });
      throw new InternalError('An unexpected error occurred');
    }
  };
}
