'use client'

import { useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import { FaTwitch, FaYoutube, FaCoins, FaLock, FaCheckCircle } from 'react-icons/fa'

interface TokenCreationWizardProps {
  onComplete: () => void
}

type Step = 'platform' | 'verify' | 'details' | 'options' | 'confirm'

interface TokenFormData {
  platform: 'twitch' | 'youtube' | null
  streamerId: string
  tokenName: string
  tokenSymbol: string
  tokenImage: string
  initialSupply: number
  freezeAuthority: boolean
}

export function TokenCreationWizard({ onComplete }: TokenCreationWizardProps) {
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const [currentStep, setCurrentStep] = useState<Step>('platform')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<TokenFormData>({
    platform: null,
    streamerId: '',
    tokenName: '',
    tokenSymbol: '',
    tokenImage: '',
    initialSupply: 1000000,
    freezeAuthority: false,
  })

  const steps: Step[] = ['platform', 'verify', 'details', 'options', 'confirm']
  const currentStepIndex = steps.indexOf(currentStep)

  const handlePlatformSelect = (platform: 'twitch' | 'youtube') => {
    setFormData({ ...formData, platform })
    setCurrentStep('verify')
  }

  const handleVerify = async () => {
    setLoading(true)
    setError(null)

    try {
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 2000))

      // In production, this would call the verify-stream API
      // For MVP, we'll skip actual verification
      setFormData({
        ...formData,
        streamerId: formData.platform === 'twitch' ? 'streamer123' : 'UC123',
      })
      setCurrentStep('details')
    } catch (err) {
      setError('Failed to verify stream. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateToken = async () => {
    if (!publicKey) return

    setLoading(true)
    setError(null)

    try {
      // Create the token through our API
      const response = await fetch('/api/streamer/create-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creator: publicKey.toString(),
          platform: formData.platform,
          streamerId: formData.streamerId,
          tokenName: formData.tokenName,
          tokenSymbol: formData.tokenSymbol,
          freezeAuthority: formData.freezeAuthority,
          initialSupply: formData.initialSupply,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create token')
      }

      const data = await response.json()

      // For MVP, we'll simulate the transaction
      // In production, this would build and send the actual Solana transaction
      console.log('Token creation initiated:', data)

      // Simulate transaction confirmation
      await new Promise(resolve => setTimeout(resolve, 2000))

      onComplete()
    } catch (err) {
      console.error('Token creation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create token')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        {/* Progress Steps */}
        <ul className="steps steps-horizontal w-full mb-8">
          {steps.map((step, index) => (
            <li
              key={step}
              className={`step ${index <= currentStepIndex ? 'step-primary' : ''}`}
            >
              {step.charAt(0).toUpperCase() + step.slice(1)}
            </li>
          ))}
        </ul>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error shadow-lg mb-4">
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Step: Platform Selection */}
        {currentStep === 'platform' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Select Your Platform</h2>
            <p className="text-gray-600 mb-6">Choose where you stream</p>

            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => handlePlatformSelect('twitch')}
                className="card bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-2 border-transparent hover:border-purple-500 transition-all cursor-pointer"
              >
                <div className="card-body items-center text-center">
                  <FaTwitch className="text-6xl text-purple-600 mb-4" />
                  <h3 className="card-title">Twitch</h3>
                  <p className="text-sm text-gray-600">Connect your Twitch account</p>
                </div>
              </button>

              <button
                onClick={() => handlePlatformSelect('youtube')}
                className="card bg-gradient-to-br from-red-500/10 to-red-500/5 border-2 border-transparent hover:border-red-500 transition-all cursor-pointer"
              >
                <div className="card-body items-center text-center">
                  <FaYoutube className="text-6xl text-red-600 mb-4" />
                  <h3 className="card-title">YouTube</h3>
                  <p className="text-sm text-gray-600">Connect your YouTube channel</p>
                  <div className="badge badge-warning">Coming Soon</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step: Verify Stream */}
        {currentStep === 'verify' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Verify Your Stream</h2>
            <p className="text-gray-600 mb-6">
              We'll verify that you own this {formData.platform} account
            </p>

            <div className="form-control w-full mb-6">
              <label className="label">
                <span className="label-text">
                  {formData.platform === 'twitch' ? 'Twitch Username' : 'YouTube Channel ID'}
                </span>
              </label>
              <input
                type="text"
                placeholder={formData.platform === 'twitch' ? 'your_username' : 'UC...'}
                className="input input-bordered w-full"
                value={formData.streamerId}
                onChange={(e) => setFormData({ ...formData, streamerId: e.target.value })}
              />
              <label className="label">
                <span className="label-text-alt">
                  This must match your streaming account
                </span>
              </label>
            </div>

            <div className="card-actions justify-between">
              <button
                onClick={() => setCurrentStep('platform')}
                className="btn btn-ghost"
              >
                Back
              </button>
              <button
                onClick={handleVerify}
                className="btn btn-primary"
                disabled={!formData.streamerId || loading}
              >
                {loading ? <span className="loading loading-spinner"></span> : 'Verify Account'}
              </button>
            </div>
          </div>
        )}

        {/* Step: Token Details */}
        {currentStep === 'details' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Token Details</h2>
            <p className="text-gray-600 mb-6">Customize your token</p>

            <div className="space-y-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Token Name</span>
                </label>
                <input
                  type="text"
                  placeholder="My Awesome Token"
                  className="input input-bordered w-full"
                  value={formData.tokenName}
                  onChange={(e) => setFormData({ ...formData, tokenName: e.target.value })}
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Token Symbol</span>
                </label>
                <input
                  type="text"
                  placeholder="MAT"
                  className="input input-bordered w-full"
                  maxLength={10}
                  value={formData.tokenSymbol}
                  onChange={(e) => setFormData({ ...formData, tokenSymbol: e.target.value.toUpperCase() })}
                />
                <label className="label">
                  <span className="label-text-alt">3-10 characters, uppercase</span>
                </label>
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Token Image URL (optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="input input-bordered w-full"
                  value={formData.tokenImage}
                  onChange={(e) => setFormData({ ...formData, tokenImage: e.target.value })}
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Initial Supply</span>
                </label>
                <input
                  type="number"
                  placeholder="1000000"
                  className="input input-bordered w-full"
                  value={formData.initialSupply}
                  onChange={(e) => setFormData({ ...formData, initialSupply: Number(e.target.value) })}
                />
                <label className="label">
                  <span className="label-text-alt">Recommended: 1,000,000 tokens</span>
                </label>
              </div>
            </div>

            <div className="card-actions justify-between mt-6">
              <button
                onClick={() => setCurrentStep('verify')}
                className="btn btn-ghost"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep('options')}
                className="btn btn-primary"
                disabled={!formData.tokenName || !formData.tokenSymbol}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step: Options */}
        {currentStep === 'options' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Token Options</h2>
            <p className="text-gray-600 mb-6">Configure advanced settings</p>

            <div className="space-y-4">
              <div className="card bg-base-200">
                <div className="card-body">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary mt-1"
                      checked={formData.freezeAuthority}
                      onChange={(e) => setFormData({ ...formData, freezeAuthority: e.target.checked })}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FaLock className="text-primary" />
                        <h3 className="font-bold">Freeze Authority</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Enable freeze authority to prevent transfers of your token.
                        This can help build trust by preventing rug pulls.
                      </p>
                      <div className="alert alert-warning mt-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current flex-shrink-0 w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="text-sm">Recommended: Keep disabled for maximum liquidity</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current flex-shrink-0 w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <h3 className="font-bold">Bonding Curve</h3>
                  <div className="text-sm">
                    Your token will use a linear bonding curve. Price increases as more tokens are bought.
                  </div>
                </div>
              </div>
            </div>

            <div className="card-actions justify-between mt-6">
              <button
                onClick={() => setCurrentStep('details')}
                className="btn btn-ghost"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep('confirm')}
                className="btn btn-primary"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step: Confirm */}
        {currentStep === 'confirm' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Review & Create</h2>
            <p className="text-gray-600 mb-6">
              Please review your token details before creating
            </p>

            <div className="card bg-base-200 mb-6">
              <div className="card-body">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform:</span>
                    <span className="font-semibold capitalize">{formData.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Streamer ID:</span>
                    <span className="font-semibold">{formData.streamerId}</span>
                  </div>
                  <div className="divider my-2"></div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Token Name:</span>
                    <span className="font-semibold">{formData.tokenName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Token Symbol:</span>
                    <span className="font-semibold">{formData.tokenSymbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Initial Supply:</span>
                    <span className="font-semibold">{formData.initialSupply.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Freeze Authority:</span>
                    <span className="font-semibold">{formData.freezeAuthority ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="alert alert-warning mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current flex-shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>
                Token creation requires approximately 0.05 SOL for transaction fees and rent.
              </span>
            </div>

            <div className="card-actions justify-between">
              <button
                onClick={() => setCurrentStep('options')}
                className="btn btn-ghost"
                disabled={loading}
              >
                Back
              </button>
              <button
                onClick={handleCreateToken}
                className="btn btn-gradient gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <FaCoins />
                    Create Token
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
