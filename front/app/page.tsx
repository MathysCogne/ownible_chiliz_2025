'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@/contexts/wallet-context'
import { getContractInfo, type RwaToken } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { RwaCard } from '@/components/rwa-card'
import { MintRwaDialog } from '@/components/mint-rwa-dialog'

async function getMarketplaceTokens(): Promise<RwaToken[]> {
    const response = await fetch('http://localhost:3001/rwa/marketplace');
    if (!response.ok) {
        throw new Error('Failed to fetch marketplace tokens');
    }
    return response.json();
}

export default function MarketplacePage() {
  const { address, isConnected } = useWallet()
  const [tokens, setTokens] = useState<RwaToken[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMintDialogOpen, setIsMintDialogOpen] = useState(false)
  const [isOwner, setIsOwner] = useState(false)

  const fetchTokens = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getMarketplaceTokens()
      setTokens(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTokens()
  }, [])

  useEffect(() => {
    async function checkOwner() {
        if(isConnected && address) {
            const info = await getContractInfo();
            setIsOwner(address.toLowerCase() === info.owner.toLowerCase());
        } else {
            setIsOwner(false);
        }
    }
    checkOwner();
  }, [isConnected, address])

  const handleMintSuccess = () => {
    fetchTokens()
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <RwaCard key={i} token={null} />)}
        </div>
      )
    }
    
    if (error) {
        return <div className="text-center py-20 text-red-400">{error}</div>
    }

    if (tokens.length === 0) {
      return (
        <div className="text-center py-20 border-2 border-dashed border-neutral-700 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">The Marketplace is Empty</h2>
          <p className="text-neutral-400 mb-6">
            {isOwner ? "Tokenize the first asset to get started." : "Check back later for new assets."}
          </p>
          {isOwner && (
            <Button onClick={() => setIsMintDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Tokenize Asset
            </Button>
          )}
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
            <h1 className="text-3xl font-bold tracking-tight text-white">Marketplace</h1>
            <p className="mt-1 text-sm text-neutral-400">
                Browse and acquire new digital assets.
            </p>
        </div>
        {isOwner && (
            <Button onClick={() => setIsMintDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Tokenize New Asset
            </Button>
        )}
      </div>
      
      {renderContent()}

      <MintRwaDialog 
        open={isMintDialogOpen}
        onOpenChange={setIsMintDialogOpen}
        onMintSuccess={handleMintSuccess}
        defaultAddress={address}
      />
    </>
  )
}
