// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Solana wallet adapter
jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: jest.fn(() => ({
    publicKey: null,
    connected: false,
    connecting: false,
    disconnect: jest.fn(),
    select: jest.fn(),
    wallet: null,
    wallets: [],
  })),
  useConnection: jest.fn(() => ({
    connection: {
      getLatestBlockhash: jest.fn(),
      confirmTransaction: jest.fn(),
      getAccountInfo: jest.fn(),
    },
  })),
}))

// Mock environment variables
process.env.NEXT_PUBLIC_SOLANA_RPC_URL = 'https://api.devnet.solana.com'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
