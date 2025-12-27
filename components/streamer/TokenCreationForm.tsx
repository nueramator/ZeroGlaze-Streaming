'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import type { CreateTokenRequest } from '@/lib/types/api';

type Platform = 'twitch' | 'youtube' | 'kick';

interface FormData {
  platform: Platform | null;
  username: string;
  tokenName: string;
  tokenSymbol: string;
  tokenUri: string;
  freezeCreatorAllocation: boolean;
}

const STEPS = [
  'Platform',
  'Username',
  'Token Details',
  'Freeze Option',
  'Review',
];

export function TokenCreationForm() {
  const { publicKey } = useWallet();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    platform: null,
    username: '',
    tokenName: '',
    tokenSymbol: '',
    tokenUri: '',
    freezeCreatorAllocation: false,
  });

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = async () => {
    // Validation for each step
    if (currentStep === 0 && !formData.platform) {
      toast.error('Please select a platform');
      return;
    }

    if (currentStep === 1 && !formData.username) {
      toast.error('Please enter your username');
      return;
    }

    // Verify username before proceeding
    if (currentStep === 1) {
      await verifyUsername();
      return;
    }

    if (currentStep === 2) {
      if (!formData.tokenName || !formData.tokenSymbol) {
        toast.error('Please fill in all token details');
        return;
      }
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const verifyUsername = async () => {
    if (!formData.platform || !formData.username) return;

    try {
      setIsVerifying(true);
      const response = await fetch('/api/streamer/verify-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: formData.platform,
          username: formData.username,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Username verified!');
        setCurrentStep(currentStep + 1);
      } else {
        toast.error(data.error || 'Username verification failed');
      }
    } catch (error) {
      toast.error('Failed to verify username');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      setIsLoading(true);

      const requestData: CreateTokenRequest = {
        tokenName: formData.tokenName,
        tokenSymbol: formData.tokenSymbol,
        tokenUri: formData.tokenUri || 'https://placeholder.com/token.json',
        creatorWallet: publicKey.toBase58(),
        creatorTwitter: '',
        creatorTwitch: formData.platform === 'twitch' ? formData.username : '',
        freezeCreatorAllocation: formData.freezeCreatorAllocation,
      };

      const response = await fetch('/api/streamer/create-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Token created successfully!');
        // Redirect to token page or dashboard
        window.location.href = `/token/${data.data.tokenMint}`;
      } else {
        toast.error(data.error || 'Failed to create token');
      }
    } catch (error) {
      console.error('Token creation error:', error);
      toast.error('Failed to create token');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    index <= currentStep
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`text-xs mt-2 ${
                    index <= currentStep ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {step}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 rounded ${
                    index < currentStep ? 'bg-purple-600' : 'bg-gray-800'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card padding="lg">
        <CardHeader>
          <CardTitle>{STEPS[currentStep]}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Step 1: Platform Selection */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <p className="text-gray-400 mb-6">
                Select the platform where you stream
              </p>
              <div className="grid gap-4">
                {(['twitch', 'youtube', 'kick'] as Platform[]).map(
                  (platform) => (
                    <button
                      key={platform}
                      onClick={() => updateFormData({ platform })}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.platform === platform
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {platform === 'twitch' && '🎮'}
                          {platform === 'youtube' && '📺'}
                          {platform === 'kick' && '⚡'}
                        </div>
                        <div>
                          <p className="font-semibold text-white capitalize">
                            {platform}
                          </p>
                          <p className="text-sm text-gray-400">
                            Stream on {platform}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Step 2: Username Input */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-gray-400 mb-6">
                Enter your {formData.platform} username
              </p>
              <Input
                label="Username"
                placeholder={`Your ${formData.platform} username`}
                value={formData.username}
                onChange={(e) => updateFormData({ username: e.target.value })}
                leftIcon={<span>@</span>}
              />
              <p className="text-sm text-gray-400">
                We'll verify that this account exists and you have access to it
              </p>
            </div>
          )}

          {/* Step 3: Token Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <Input
                label="Token Name"
                placeholder="e.g., YourName Coin"
                value={formData.tokenName}
                onChange={(e) => updateFormData({ tokenName: e.target.value })}
                helperText="The full name of your token"
              />
              <Input
                label="Token Symbol"
                placeholder="e.g., YNC"
                value={formData.tokenSymbol}
                onChange={(e) =>
                  updateFormData({
                    tokenSymbol: e.target.value.toUpperCase(),
                  })
                }
                maxLength={10}
                helperText="3-10 characters, uppercase recommended"
              />
              <Input
                label="Token Image URL (Optional)"
                placeholder="https://..."
                value={formData.tokenUri}
                onChange={(e) => updateFormData({ tokenUri: e.target.value })}
                helperText="URL to your token's image (PNG, JPG, or GIF)"
              />
            </div>
          )}

          {/* Step 4: Freeze Option */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <p className="text-gray-400">
                Choose how to handle your creator allocation
              </p>
              <div className="grid gap-4">
                <button
                  onClick={() =>
                    updateFormData({ freezeCreatorAllocation: true })
                  }
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    formData.freezeCreatorAllocation
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">🟢</span>
                    <div>
                      <h4 className="font-semibold text-white mb-1">
                        Green Flag (Recommended)
                      </h4>
                      <p className="text-sm text-gray-400">
                        Freeze your creator allocation. Shows your commitment
                        and builds trust with traders.
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() =>
                    updateFormData({ freezeCreatorAllocation: false })
                  }
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    !formData.freezeCreatorAllocation &&
                    formData.platform !== null
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">🔴</span>
                    <div>
                      <h4 className="font-semibold text-white mb-1">
                        Red Flag
                      </h4>
                      <p className="text-sm text-gray-400">
                        Keep your allocation unfrozen. You can sell at any time,
                        but may reduce trader confidence.
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Platform</span>
                  <span className="text-white font-medium capitalize">
                    {formData.platform}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Username</span>
                  <span className="text-white font-medium">
                    @{formData.username}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Token Name</span>
                  <span className="text-white font-medium">
                    {formData.tokenName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Token Symbol</span>
                  <span className="text-white font-medium">
                    ${formData.tokenSymbol}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Creator Allocation</span>
                  <Badge
                    variant={
                      formData.freezeCreatorAllocation ? 'success' : 'danger'
                    }
                  >
                    {formData.freezeCreatorAllocation ? 'Frozen' : 'Unfrozen'}
                  </Badge>
                </div>
              </div>

              <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">
                  What happens next?
                </h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Token will be created on Solana</li>
                  <li>• Bonding curve will be initialized</li>
                  <li>• Token becomes tradeable immediately</li>
                  <li>• You'll earn 1% on every trade</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {currentStep > 0 && (
              <Button onClick={handleBack} variant="secondary" fullWidth>
                Back
              </Button>
            )}
            {currentStep < STEPS.length - 1 ? (
              <Button
                onClick={handleNext}
                variant="primary"
                fullWidth
                isLoading={isVerifying}
              >
                {currentStep === 1 ? 'Verify & Continue' : 'Continue'}
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                variant="primary"
                fullWidth
                isLoading={isLoading}
              >
                Create Token
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
