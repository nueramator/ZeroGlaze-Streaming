/**
 * Solana RPC Connection Management
 * Handles connection pooling, retries, and error handling
 */

import { Connection, ConnectionConfig, Commitment } from '@solana/web3.js';

const DEFAULT_COMMITMENT: Commitment = 'confirmed';
const CONNECTION_POOL_SIZE = 3;

interface ConnectionPoolItem {
  connection: Connection;
  inUse: boolean;
  lastUsed: number;
}

class SolanaConnectionManager {
  private pool: ConnectionPoolItem[] = [];
  private endpoint: string;
  private config: ConnectionConfig;

  constructor(endpoint?: string, config?: ConnectionConfig) {
    this.endpoint = endpoint || process.env.SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com';
    this.config = config || {
      commitment: DEFAULT_COMMITMENT,
      confirmTransactionInitialTimeout: 60000,
    };

    // Initialize connection pool
    this.initializePool();
  }

  private initializePool(): void {
    for (let i = 0; i < CONNECTION_POOL_SIZE; i++) {
      this.pool.push({
        connection: new Connection(this.endpoint, this.config),
        inUse: false,
        lastUsed: 0,
      });
    }
  }

  /**
   * Get an available connection from the pool
   */
  getConnection(): Connection {
    // Try to find an unused connection
    let poolItem = this.pool.find(item => !item.inUse);

    // If all connections are in use, use the least recently used one
    if (!poolItem) {
      poolItem = this.pool.reduce((prev, current) =>
        prev.lastUsed < current.lastUsed ? prev : current
      );
    }

    poolItem.inUse = true;
    poolItem.lastUsed = Date.now();

    return poolItem.connection;
  }

  /**
   * Release a connection back to the pool
   */
  releaseConnection(connection: Connection): void {
    const poolItem = this.pool.find(item => item.connection === connection);
    if (poolItem) {
      poolItem.inUse = false;
    }
  }

  /**
   * Get a new dedicated connection (not from pool)
   */
  createConnection(): Connection {
    return new Connection(this.endpoint, this.config);
  }

  /**
   * Test connection health
   */
  async testConnection(): Promise<boolean> {
    try {
      const connection = this.getConnection();
      const version = await connection.getVersion();
      this.releaseConnection(connection);
      return !!version;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  /**
   * Get current slot
   */
  async getCurrentSlot(): Promise<number> {
    const connection = this.getConnection();
    try {
      return await connection.getSlot();
    } finally {
      this.releaseConnection(connection);
    }
  }
}

// Singleton instance
let connectionManager: SolanaConnectionManager | null = null;

/**
 * Get the connection manager instance
 */
export function getConnectionManager(): SolanaConnectionManager {
  if (!connectionManager) {
    connectionManager = new SolanaConnectionManager();
  }
  return connectionManager;
}

/**
 * Get a Solana connection
 */
export function getConnection(): Connection {
  return getConnectionManager().getConnection();
}

/**
 * Release a connection
 */
export function releaseConnection(connection: Connection): void {
  getConnectionManager().releaseConnection(connection);
}

/**
 * Create a new connection (not from pool)
 */
export function createConnection(): Connection {
  return getConnectionManager().createConnection();
}

/**
 * Utility: Retry logic for RPC calls
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${i + 1} failed:`, error);

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * WebSocket connection for real-time updates
 */
export class SolanaWebSocketManager {
  private endpoint: string;
  private subscriptions: Map<number, () => void> = new Map();

  constructor(endpoint?: string) {
    // Convert HTTP endpoint to WebSocket
    const httpEndpoint = endpoint || process.env.SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com';
    this.endpoint = httpEndpoint.replace('https://', 'wss://').replace('http://', 'ws://');
  }

  /**
   * Subscribe to account changes
   */
  subscribeToAccount(
    connection: Connection,
    publicKey: string,
    callback: (accountInfo: any) => void
  ): number {
    const subscriptionId = connection.onAccountChange(
      new (require('@solana/web3.js').PublicKey)(publicKey),
      callback,
      DEFAULT_COMMITMENT
    );

    this.subscriptions.set(subscriptionId, () => {
      connection.removeAccountChangeListener(subscriptionId);
    });

    return subscriptionId;
  }

  /**
   * Unsubscribe from account changes
   */
  unsubscribe(subscriptionId: number): void {
    const unsubscribe = this.subscriptions.get(subscriptionId);
    if (unsubscribe) {
      unsubscribe();
      this.subscriptions.delete(subscriptionId);
    }
  }

  /**
   * Unsubscribe from all
   */
  unsubscribeAll(): void {
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions.clear();
  }
}

// WebSocket manager singleton
let wsManager: SolanaWebSocketManager | null = null;

export function getWebSocketManager(): SolanaWebSocketManager {
  if (!wsManager) {
    wsManager = new SolanaWebSocketManager();
  }
  return wsManager;
}
