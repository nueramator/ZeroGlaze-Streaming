import { Connection, clusterApiUrl } from '@solana/web3.js';

// Solana connection configuration
const network = (process.env.NEXT_PUBLIC_SOLANA_NETWORK as 'devnet' | 'testnet' | 'mainnet-beta') || 'devnet';
const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network);

export const connection = new Connection(rpcUrl, 'confirmed');

// Program IDs (to be filled after deployment)
export const TOKEN_LAUNCHPAD_PROGRAM_ID = process.env.NEXT_PUBLIC_TOKEN_LAUNCHPAD_PROGRAM_ID || '';
export const TRADING_PROGRAM_ID = process.env.NEXT_PUBLIC_TRADING_PROGRAM_ID || '';
export const FEE_DISTRIBUTION_PROGRAM_ID = process.env.NEXT_PUBLIC_FEE_DISTRIBUTION_PROGRAM_ID || '';
