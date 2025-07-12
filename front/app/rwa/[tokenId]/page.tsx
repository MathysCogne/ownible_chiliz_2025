'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useWallet } from '@/contexts/wallet-context'
import { getRwaById, getContractInfo, type RwaToken } from '@/lib/api' 
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WhitelistManager } from '@/components/whitelist-manager'
import { RevenueManager } from '@/components/revenue-manager'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useWriteContract } from 'wagmi'
import { rwaContractAddress, rwaContractAbi } from '@/lib/contract'
import { parseEther } from 'ethers'
import { toast } from 'sonner'

export default function RwaDetailPage() {
  const params = useParams()
  const { address, isConnected } = useWallet()
  const tokenId = params.tokenId as string

  const [rwa, setRwa] = useState<RwaToken | null>(null)
  const [contractOwner, setContractOwner] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [buyAmount, setBuyAmount] = useState('1')
  
  const { writeContract, isPending: isBuyLoading, error: buyError, data: hash } = useWriteContract()

  const isOwner = isConnected && address && contractOwner && address.toLowerCase() === contractOwner.toLowerCase()
  const isForSale = rwa && parseFloat(rwa.price) > 0

  const fetchRwa = async () => {
    if (tokenId) {
        setIsLoading(true)
        try {
            const rwaData = await getRwaById(tokenId)
            setRwa(rwaData)
            const info = await getContractInfo();
            setContractOwner(info.owner);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch RWA details')
        } finally {
            setIsLoading(false)
        }
    }
  }

  useEffect(() => {
    fetchRwa()
  }, [tokenId])

  useEffect(() => {
      if(hash) {
          toast.success("Purchase successful!", {
              description: "Your transaction has been submitted.",
              action: {
                  label: "View Transaction",
                  onClick: () => window.open(`https://spicy-explorer.chiliz.com/tx/${hash}`, '_blank')
              }
          })
          fetchRwa(); // Refresh data after purchase
      }
  }, [hash])

  useEffect(() => {
    if(buyError) {
        toast.error("Purchase Failed", {
            description: buyError.message || "An unknown error occurred during the transaction."
        })
    }
  }, [buyError])


  const handleBuy = async () => {
      if (!rwa || !rwa.price) {
        toast.error("Asset price is not available.");
        return;
      }
      try {
        // Use BigInt for calculation to avoid floating point errors
        const pricePerTokenWei = parseEther(rwa.price);
        const amountToBuy = BigInt(buyAmount);
        const totalValueWei = pricePerTokenWei * amountToBuy;

        writeContract({
            address: rwaContractAddress as `0x${string}`,
            abi: rwaContractAbi,
            functionName: 'buyRwa',
            args: [BigInt(tokenId), amountToBuy],
            value: totalValueWei,
        })
      } catch (e) {
          toast.error("Transaction Error", {
              description: e instanceof Error ? e.message : "An unexpected error occurred."
          })
      }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-1/4 mb-4" />
        <Skeleton className="h-8 w-1/2 mb-8" />
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <Skeleton className="w-full h-96" />
            </div>
            <div>
                <Card><CardHeader><Skeleton className="h-8 w-full mb-4" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
            </div>
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>
  }

  if (!rwa) {
    return <div className="container mx-auto px-4 py-8">RWA not found.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">{rwa.rwaType} #{rwa.tokenId}</h1>
        {/* We would fetch and display the metadata name here */}
        <p className="text-lg text-neutral-400">Digital Asset Details</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
            {/* Placeholder for Image */}
            <Card className="bg-neutral-900 border-neutral-800">
                <CardContent className="p-4">
                     <div className="aspect-square w-full bg-neutral-800 flex items-center justify-center rounded-md">
                        <span className="text-neutral-500">Asset Image</span>
                    </div>
                </CardContent>
            </Card>

            {isOwner && rwa.complianceRequired && (
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader><CardTitle>Admin: Whitelist Management</CardTitle></CardHeader>
                    <CardContent>
                        <WhitelistManager tokenId={tokenId} />
                    </CardContent>
                </Card>
            )}
        </div>

        <div className="space-y-6">
            {!isOwner && isForSale && (
                 <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader><CardTitle>Buy Asset</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-2xl font-bold">{rwa.price} CHZ</p>
                            <p className="text-xs text-neutral-400">per share</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Input 
                                type="number"
                                value={buyAmount}
                                onChange={(e) => setBuyAmount(e.target.value)}
                                min="1"
                                className="w-20"
                            />
                            <Button onClick={handleBuy} disabled={isBuyLoading} className="flex-1">
                                {isBuyLoading ? "Buying..." : "Buy Now"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader><CardTitle>Key Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between"><span>Type:</span> <span>{rwa.rwaType}</span></div>
                    <div className="flex justify-between"><span>Share:</span> <span>{rwa.percent}%</span></div>
                    <div className="flex justify-between"><span>My Balance:</span> <span>{rwa.balance}</span></div>
                    <div className="flex justify-between items-center">
                        <span>Compliance:</span> 
                        <Badge variant={rwa.complianceRequired ? 'destructive' : 'secondary'}>
                            {rwa.complianceRequired ? 'Whitelist Active' : 'Open'}
                        </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Status:</span>
                        {parseInt(rwa.lockupEndDate) * 1000 > Date.now() ? (
                             <Badge variant="destructive">Locked</Badge>
                        ) : (
                            <Badge variant="secondary">Tradable</Badge>
                        )}
                    </div>
                     {parseInt(rwa.lockupEndDate) > 0 && 
                        <div className="text-center pt-2 text-xs text-neutral-500">
                           Lock-up ends on {new Date(parseInt(rwa.lockupEndDate) * 1000).toLocaleDateString()}
                        </div>
                     }
                </CardContent>
            </Card>

             {isOwner && (
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader><CardTitle>Admin: Deposit Revenue</CardTitle></CardHeader>
                    <CardContent>
                        <RevenueManager tokenId={tokenId} />
                    </CardContent>
                </Card>
             )}
        </div>
      </div>
    </div>
  )
} 