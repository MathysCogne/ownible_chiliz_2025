'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@/contexts/wallet-context'
import { getUserTokens, type RwaToken } from '@/lib/api'
import { RwaCard } from '@/components/rwa-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CollectionPage() {
  const { isConnected, address, isCorrectNetwork } = useWallet()
  const [tokens, setTokens] = useState<RwaToken[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUserTokens() {
        if (isConnected && isCorrectNetwork && address) {
            setIsLoading(true)
            setError(null)
            try {
              const data = await getUserTokens(address)
              setTokens(data.tokens)
            } catch (err) {
              setError(err instanceof Error ? err.message : 'An error occurred.')
            } finally {
              setIsLoading(false)
            }
        } else {
            setTokens([]);
            setIsLoading(false);
        }
    }
    fetchUserTokens()
  }, [isConnected, isCorrectNetwork, address])

  const renderContent = () => {
    if (!isConnected) {
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
            <p className="text-neutral-400 mb-6">Connect your wallet to see your collection of digital assets.</p>
          </div>
        )
    }

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <RwaCard key={i} token={null} />)}
            </div>
        )
    }
    
    if (error) {
        return <div className="text-center py-20 text-red-400">{error}</div>
    }

    if (tokens.length === 0) {
      return (
        <div className="text-center py-20 border-2 border-dashed border-neutral-700 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Your Collection is Empty</h2>
          <p className="text-neutral-400 mb-6">Explore the marketplace to find your first digital asset.</p>
          <Button asChild>
            <Link href="/">Explore Marketplace</Link>
          </Button>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tokens.map((token) => (
          <RwaCard key={token.tokenId} token={token} />
        ))}
      </div>
    )
  }

  return (
    <>
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">My Collection</h1>
                <p className="mt-1 text-sm text-neutral-400">
                    Here are all the digital assets you own.
                </p>
            </div>
        </div>
        {renderContent()}
    </>
  )
}
