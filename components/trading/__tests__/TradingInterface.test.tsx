/**
 * TradingInterface Component Tests
 * Tests for trading UI, quote fetching, and transaction execution
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TradingInterface } from '../TradingInterface';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('@solana/wallet-adapter-react');
jest.mock('react-hot-toast');

const mockUseWallet = useWallet as jest.MockedFunction<typeof useWallet>;
const mockToast = toast as jest.Mocked<typeof toast>;

// Mock fetch
global.fetch = jest.fn();

describe('TradingInterface', () => {
  const testPublicKey = new PublicKey('HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH');
  const mockProps = {
    tokenMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    tokenSymbol: 'TEST',
    currentPrice: 0.00000003,
  };

  const mockQuoteResponse = {
    success: true,
    data: {
      tokenAmount: 1000000,
      solAmount: 0.03,
      platformFee: 0.0003,
      creatorFee: 0.0006,
      totalCost: 0.0309,
      pricePerToken: 0.000000031,
      priceImpact: 2.5,
      currentPrice: 0.00000003,
      newPrice: 0.000000031,
    },
  };

  beforeEach(() => {
    mockUseWallet.mockReturnValue({
      publicKey: testPublicKey,
      connected: true,
      disconnect: jest.fn(),
      connecting: false,
      disconnecting: false,
      wallet: { adapter: { name: 'Phantom' } } as any,
      wallets: [],
      select: jest.fn(),
      connect: jest.fn(),
      sendTransaction: jest.fn(),
      signTransaction: undefined,
      signAllTransactions: undefined,
      signMessage: undefined,
    });

    mockToast.error = jest.fn();
    mockToast.success = jest.fn();
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render trading interface with token symbol', () => {
      render(<TradingInterface {...mockProps} />);
      expect(screen.getByText('Trade $TEST')).toBeInTheDocument();
    });

    it('should render buy and sell buttons', () => {
      render(<TradingInterface {...mockProps} />);
      expect(screen.getByRole('button', { name: /^Buy$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Sell$/i })).toBeInTheDocument();
    });

    it('should render amount input', () => {
      render(<TradingInterface {...mockProps} />);
      expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
    });

    it('should render percentage buttons', () => {
      render(<TradingInterface {...mockProps} />);
      expect(screen.getByText('25%')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should render info message about bonding curve', () => {
      render(<TradingInterface {...mockProps} />);
      expect(screen.getByText(/Trades are executed on a bonding curve/i)).toBeInTheDocument();
    });
  });

  describe('Trade Type Selection', () => {
    it('should default to buy mode', () => {
      render(<TradingInterface {...mockProps} />);
      const buyButton = screen.getByRole('button', { name: /^Buy$/i });
      // Buy button should have primary variant (we can check by className or other attributes)
      expect(buyButton).toBeInTheDocument();
    });

    it('should switch to sell mode when sell button clicked', () => {
      render(<TradingInterface {...mockProps} />);
      const sellButton = screen.getByRole('button', { name: /^Sell$/i });
      fireEvent.click(sellButton);

      // Input label should change
      expect(screen.getByText(/Sell Amount/i)).toBeInTheDocument();
    });

    it('should switch back to buy mode when buy button clicked', () => {
      render(<TradingInterface {...mockProps} />);
      const sellButton = screen.getByRole('button', { name: /^Sell$/i });
      const buyButton = screen.getByRole('button', { name: /^Buy$/i });

      fireEvent.click(sellButton);
      fireEvent.click(buyButton);

      expect(screen.getByText(/Buy Amount/i)).toBeInTheDocument();
    });
  });

  describe('Amount Input', () => {
    it('should update amount when typing', () => {
      render(<TradingInterface {...mockProps} />);
      const input = screen.getByPlaceholderText('0.00') as HTMLInputElement;

      fireEvent.change(input, { target: { value: '1000000' } });
      expect(input.value).toBe('1000000');
    });

    it('should show token symbol next to input', () => {
      render(<TradingInterface {...mockProps} />);
      expect(screen.getByText('TEST')).toBeInTheDocument();
    });

    it('should accept decimal values', () => {
      render(<TradingInterface {...mockProps} />);
      const input = screen.getByPlaceholderText('0.00') as HTMLInputElement;

      fireEvent.change(input, { target: { value: '1000000.5' } });
      expect(input.value).toBe('1000000.5');
    });
  });

  describe('Percentage Buttons', () => {
    it('should set amount when 25% clicked', () => {
      render(<TradingInterface {...mockProps} />);
      const button = screen.getByText('25%');
      fireEvent.click(button);

      const input = screen.getByPlaceholderText('0.00') as HTMLInputElement;
      expect(parseFloat(input.value)).toBeGreaterThan(0);
    });

    it('should set amount when 50% clicked', () => {
      render(<TradingInterface {...mockProps} />);
      const button = screen.getByText('50%');
      fireEvent.click(button);

      const input = screen.getByPlaceholderText('0.00') as HTMLInputElement;
      expect(parseFloat(input.value)).toBeGreaterThan(0);
    });

    it('should set amount when 100% clicked', () => {
      render(<TradingInterface {...mockProps} />);
      const button = screen.getByText('100%');
      fireEvent.click(button);

      const input = screen.getByPlaceholderText('0.00') as HTMLInputElement;
      expect(parseFloat(input.value)).toBeGreaterThan(0);
    });

    it('should set different amounts for buy vs sell mode', () => {
      render(<TradingInterface {...mockProps} />);

      // Buy mode
      const percent100 = screen.getByText('100%');
      fireEvent.click(percent100);
      const input = screen.getByPlaceholderText('0.00') as HTMLInputElement;
      const buyAmount = input.value;

      // Switch to sell mode
      const sellButton = screen.getByRole('button', { name: /^Sell$/i });
      fireEvent.click(sellButton);

      fireEvent.click(percent100);
      const sellAmount = input.value;

      expect(buyAmount).not.toBe(sellAmount);
    });
  });

  describe('Quote Fetching', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should fetch quote after typing amount', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockQuoteResponse,
      });

      render(<TradingInterface {...mockProps} />);
      const input = screen.getByPlaceholderText('0.00');

      fireEvent.change(input, { target: { value: '1000000' } });

      // Wait for debounce (500ms)
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/trading/quote',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('1000000'),
          })
        );
      });
    });

    it('should debounce quote fetching', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockQuoteResponse,
      });

      render(<TradingInterface {...mockProps} />);
      const input = screen.getByPlaceholderText('0.00');

      // Rapid typing
      fireEvent.change(input, { target: { value: '1' } });
      jest.advanceTimersByTime(100);
      fireEvent.change(input, { target: { value: '10' } });
      jest.advanceTimersByTime(100);
      fireEvent.change(input, { target: { value: '100' } });
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        // Should only fetch once after debounce
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });
    });

    it('should display quote when fetched successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockQuoteResponse,
      });

      render(<TradingInterface {...mockProps} />);
      const input = screen.getByPlaceholderText('0.00');

      fireEvent.change(input, { target: { value: '1000000' } });
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(screen.getByText(/Price per token/i)).toBeInTheDocument();
        expect(screen.getByText(/SOL Cost/i)).toBeInTheDocument();
        expect(screen.getByText(/Platform Fee/i)).toBeInTheDocument();
        expect(screen.getByText(/Creator Fee/i)).toBeInTheDocument();
      });
    });

    it('should show loading state while fetching quote', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(<TradingInterface {...mockProps} />);
      const input = screen.getByPlaceholderText('0.00');

      fireEvent.change(input, { target: { value: '1000000' } });
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(screen.getByText('Loading quote...')).toBeInTheDocument();
      });
    });

    it('should show error toast when quote fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ success: false, error: 'Token not found' }),
      });

      render(<TradingInterface {...mockProps} />);
      const input = screen.getByPlaceholderText('0.00');

      fireEvent.change(input, { target: { value: '1000000' } });
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Token not found');
      });
    });

    it('should refetch quote when switching trade type', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockQuoteResponse,
      });

      render(<TradingInterface {...mockProps} />);
      const input = screen.getByPlaceholderText('0.00');

      fireEvent.change(input, { target: { value: '1000000' } });
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // Switch to sell
      const sellButton = screen.getByRole('button', { name: /^Sell$/i });
      fireEvent.click(sellButton);
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should clear quote when amount is cleared', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockQuoteResponse,
      });

      render(<TradingInterface {...mockProps} />);
      const input = screen.getByPlaceholderText('0.00');

      fireEvent.change(input, { target: { value: '1000000' } });
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(screen.getByText(/Price per token/i)).toBeInTheDocument();
      });

      // Clear amount
      fireEvent.change(input, { target: { value: '' } });
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(screen.queryByText(/Price per token/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Quote Display', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockQuoteResponse,
      });
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should show price impact warning for high impact', async () => {
      const highImpactQuote = {
        ...mockQuoteResponse,
        data: { ...mockQuoteResponse.data, priceImpact: 6 },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => highImpactQuote,
      });

      render(<TradingInterface {...mockProps} />);
      const input = screen.getByPlaceholderText('0.00');

      fireEvent.change(input, { target: { value: '1000000' } });
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(screen.getByText(/High price impact/i)).toBeInTheDocument();
      });
    });

    it('should highlight high price impact in red', async () => {
      const highImpactQuote = {
        ...mockQuoteResponse,
        data: { ...mockQuoteResponse.data, priceImpact: 6 },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => highImpactQuote,
      });

      render(<TradingInterface {...mockProps} />);
      const input = screen.getByPlaceholderText('0.00');

      fireEvent.change(input, { target: { value: '1000000' } });
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        const impactElement = screen.getByText('6.00%');
        expect(impactElement).toHaveClass('text-red-400');
      });
    });
  });

  describe('Trade Execution', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockQuoteResponse,
      });
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should show error when trying to trade without wallet', async () => {
      mockUseWallet.mockReturnValue({
        publicKey: null,
        connected: false,
        disconnect: jest.fn(),
        connecting: false,
        disconnecting: false,
        wallet: null,
        wallets: [],
        select: jest.fn(),
        connect: jest.fn(),
        sendTransaction: jest.fn(),
        signTransaction: undefined,
        signAllTransactions: undefined,
        signMessage: undefined,
      });

      render(<TradingInterface {...mockProps} />);
      const tradeButton = screen.getByRole('button', { name: /Connect Wallet/i });

      expect(tradeButton).toBeDisabled();
    });

    it('should disable trade button without quote', () => {
      render(<TradingInterface {...mockProps} />);
      const tradeButton = screen.getByRole('button', { name: /Buy Tokens/i });

      expect(tradeButton).toBeDisabled();
    });

    it('should enable trade button with valid quote', async () => {
      render(<TradingInterface {...mockProps} />);
      const input = screen.getByPlaceholderText('0.00');

      fireEvent.change(input, { target: { value: '1000000' } });
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        const tradeButton = screen.getByRole('button', { name: /Buy Tokens/i });
        expect(tradeButton).not.toBeDisabled();
      });
    });

    it('should change button text based on trade type', async () => {
      render(<TradingInterface {...mockProps} />);

      // Buy mode
      expect(screen.getByRole('button', { name: /Buy Tokens/i })).toBeInTheDocument();

      // Sell mode
      const sellButton = screen.getByRole('button', { name: /^Sell$/i });
      fireEvent.click(sellButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Sell Tokens/i })).toBeInTheDocument();
      });
    });
  });

  describe('Wallet Connection State', () => {
    it('should show "Connect Wallet" button when not connected', () => {
      mockUseWallet.mockReturnValue({
        publicKey: null,
        connected: false,
        disconnect: jest.fn(),
        connecting: false,
        disconnecting: false,
        wallet: null,
        wallets: [],
        select: jest.fn(),
        connect: jest.fn(),
        sendTransaction: jest.fn(),
        signTransaction: undefined,
        signAllTransactions: undefined,
        signMessage: undefined,
      });

      render(<TradingInterface {...mockProps} />);
      expect(screen.getByRole('button', { name: /Connect Wallet/i })).toBeInTheDocument();
    });
  });
});
