'use client';

import Link from 'next/link';
import { WalletButton } from '@/components/wallet/WalletButton';
import { useState } from 'react';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-gray-950/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Z</span>
            </div>
            <span className="text-xl font-bold text-white hidden sm:inline">
              Zeroglaze
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/tokens"
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Explore
            </Link>
            <Link
              href="/create"
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Create Token
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Dashboard
            </Link>
            <a
              href="https://docs.zeroglaze.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Docs
            </a>
          </nav>

          {/* Wallet Button */}
          <div className="flex items-center gap-3">
            <WalletButton />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-800">
            <div className="flex flex-col gap-4">
              <Link
                href="/tokens"
                className="text-gray-300 hover:text-white transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Explore
              </Link>
              <Link
                href="/create"
                className="text-gray-300 hover:text-white transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Create Token
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-300 hover:text-white transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <a
                href="https://docs.zeroglaze.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors font-medium"
              >
                Docs
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
