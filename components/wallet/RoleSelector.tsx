'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export type UserRole = 'streamer' | 'trader' | null;

interface RoleSelectorProps {
  onRoleSelect: (role: 'streamer' | 'trader') => void;
  currentRole?: UserRole;
}

export function RoleSelector({ onRoleSelect, currentRole }: RoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole || null);

  const handleSelect = (role: 'streamer' | 'trader') => {
    setSelectedRole(role);
    onRoleSelect(role);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Choose Your Path
        </h2>
        <p className="text-gray-400">
          Are you here to create or trade?
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Streamer Card */}
        <Card
          padding="none"
          hover
          className={`cursor-pointer transition-all ${
            selectedRole === 'streamer'
              ? 'ring-2 ring-purple-500 border-purple-500'
              : ''
          }`}
          onClick={() => handleSelect('streamer')}
        >
          <CardContent>
            <div className="p-6">
              <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                I'm a Streamer
              </h3>
              <p className="text-gray-400 mb-4">
                Launch your own token and earn fees while you stream
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Create your token in minutes
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Earn 1% on every trade
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Build your community
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Trader Card */}
        <Card
          padding="none"
          hover
          className={`cursor-pointer transition-all ${
            selectedRole === 'trader'
              ? 'ring-2 ring-pink-500 border-pink-500'
              : ''
          }`}
          onClick={() => handleSelect('trader')}
        >
          <CardContent>
            <div className="p-6">
              <div className="w-16 h-16 bg-pink-600/20 rounded-2xl flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-pink-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                I'm a Trader
              </h3>
              <p className="text-gray-400 mb-4">
                Discover and trade streamer tokens on bonding curves
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Trade with bonding curves
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Support your favorite streamers
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Real-time trading
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
