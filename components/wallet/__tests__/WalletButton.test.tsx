/**
 * WalletButton Component Tests
 * Tests for wallet connection UI and interactions
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WalletButton } from '../WalletButton';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';

// Mock dependencies
jest.mock('@solana/wallet-adapter-react');
jest.mock('@solana/wallet-adapter-react-ui');

const mockUseWallet = useWallet as jest.MockedFunction<typeof useWallet>;
const mockUseWalletModal = useWalletModal as jest.MockedFunction<typeof useWalletModal>;

describe('WalletButton', () => {
  const mockSetVisible = jest.fn();
  const mockDisconnect = jest.fn();
  const testPublicKey = new PublicKey('HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH');

  beforeEach(() => {
    mockUseWalletModal.mockReturnValue({
      setVisible: mockSetVisible,
      visible: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Disconnected State', () => {
    beforeEach(() => {
      mockUseWallet.mockReturnValue({
        publicKey: null,
        connected: false,
        disconnect: mockDisconnect,
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
    });

    it('should render "Connect Wallet" button when disconnected', () => {
      render(<WalletButton />);
      expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
    });

    it('should show wallet icon when disconnected', () => {
      render(<WalletButton />);
      const button = screen.getByRole('button', { name: /connect wallet/i });
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should call setVisible(true) when clicked', () => {
      render(<WalletButton />);
      const button = screen.getByRole('button', { name: /connect wallet/i });
      fireEvent.click(button);
      expect(mockSetVisible).toHaveBeenCalledWith(true);
    });

    it('should have primary variant styling', () => {
      render(<WalletButton />);
      const button = screen.getByRole('button', { name: /connect wallet/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Connected State', () => {
    beforeEach(() => {
      mockUseWallet.mockReturnValue({
        publicKey: testPublicKey,
        connected: true,
        disconnect: mockDisconnect,
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
    });

    it('should show truncated wallet address when connected', () => {
      render(<WalletButton />);
      // Should show truncated version of the address
      expect(screen.getByText(/HN7c...YWrH/i)).toBeInTheDocument();
    });

    it('should show green connection indicator', () => {
      const { container } = render(<WalletButton />);
      const indicator = container.querySelector('.bg-green-500');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveClass('animate-pulse');
    });

    it('should show dropdown toggle icon', () => {
      const { container } = render(<WalletButton />);
      const chevron = container.querySelector('svg path[d*="19 9l-7"]');
      expect(chevron).toBeInTheDocument();
    });

    it('should open dropdown when clicked', () => {
      render(<WalletButton />);
      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByText('Connected Wallet')).toBeInTheDocument();
      expect(screen.getByText(testPublicKey.toBase58())).toBeInTheDocument();
    });

    it('should show full address in dropdown', () => {
      render(<WalletButton />);
      const button = screen.getByRole('button');
      fireEvent.click(button);

      const fullAddress = testPublicKey.toBase58();
      expect(screen.getByText(fullAddress)).toBeInTheDocument();
    });

    it('should show disconnect button in dropdown', () => {
      render(<WalletButton />);
      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByText('Disconnect')).toBeInTheDocument();
    });

    it('should rotate chevron when dropdown is open', () => {
      const { container } = render(<WalletButton />);
      const button = screen.getByRole('button');

      // Initially not rotated
      let chevron = container.querySelector('svg');
      expect(chevron?.parentElement).not.toHaveClass('rotate-180');

      // Click to open
      fireEvent.click(button);

      // Should be rotated
      chevron = container.querySelector('.rotate-180');
      expect(chevron).toBeInTheDocument();
    });
  });

  describe('Dropdown Behavior', () => {
    beforeEach(() => {
      mockUseWallet.mockReturnValue({
        publicKey: testPublicKey,
        connected: true,
        disconnect: mockDisconnect,
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
    });

    it('should close dropdown when clicking outside', () => {
      render(<WalletButton />);
      const button = screen.getByRole('button');

      // Open dropdown
      fireEvent.click(button);
      expect(screen.getByText('Connected Wallet')).toBeInTheDocument();

      // Click on backdrop
      const backdrop = document.querySelector('.fixed.inset-0');
      fireEvent.click(backdrop!);

      // Dropdown should be closed
      expect(screen.queryByText('Connected Wallet')).not.toBeInTheDocument();
    });

    it('should call disconnect when disconnect button is clicked', async () => {
      render(<WalletButton />);
      const button = screen.getByRole('button');

      // Open dropdown
      fireEvent.click(button);

      // Click disconnect
      const disconnectButton = screen.getByText('Disconnect');
      fireEvent.click(disconnectButton);

      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should close dropdown after disconnect', async () => {
      render(<WalletButton />);
      const button = screen.getByRole('button');

      // Open dropdown
      fireEvent.click(button);

      // Click disconnect
      const disconnectButton = screen.getByText('Disconnect');
      fireEvent.click(disconnectButton);

      // Dropdown should close
      await waitFor(() => {
        expect(screen.queryByText('Connected Wallet')).not.toBeInTheDocument();
      });
    });

    it('should show disconnect icon', () => {
      render(<WalletButton />);
      const button = screen.getByRole('button');
      fireEvent.click(button);

      const disconnectButton = screen.getByText('Disconnect').closest('button');
      const svg = disconnectButton?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should have proper z-index stacking', () => {
      const { container } = render(<WalletButton />);
      const button = screen.getByRole('button');
      fireEvent.click(button);

      const backdrop = container.querySelector('.z-10');
      const dropdown = container.querySelector('.z-20');

      expect(backdrop).toBeInTheDocument();
      expect(dropdown).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button role when disconnected', () => {
      mockUseWallet.mockReturnValue({
        publicKey: null,
        connected: false,
        disconnect: mockDisconnect,
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

      render(<WalletButton />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should have accessible button role when connected', () => {
      mockUseWallet.mockReturnValue({
        publicKey: testPublicKey,
        connected: true,
        disconnect: mockDisconnect,
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

      render(<WalletButton />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should use monospace font for address display', () => {
      mockUseWallet.mockReturnValue({
        publicKey: testPublicKey,
        connected: true,
        disconnect: mockDisconnect,
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

      const { container } = render(<WalletButton />);
      const monoText = container.querySelector('.font-mono');
      expect(monoText).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null publicKey gracefully', () => {
      mockUseWallet.mockReturnValue({
        publicKey: null,
        connected: true, // Edge case: connected but no public key
        disconnect: mockDisconnect,
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

      render(<WalletButton />);
      // Should still render without crashing
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle rapid toggle clicks', () => {
      mockUseWallet.mockReturnValue({
        publicKey: testPublicKey,
        connected: true,
        disconnect: mockDisconnect,
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

      render(<WalletButton />);
      const button = screen.getByRole('button');

      // Rapid clicks
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      // Should handle gracefully (dropdown should be in final state)
      expect(screen.queryByText('Connected Wallet')).not.toBeInTheDocument();
    });
  });
});
