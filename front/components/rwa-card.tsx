'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { type RwaToken } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { Image as ImageIcon, PieChart, Wallet, Lock, ShieldCheck } from 'lucide-react'

interface Metadata {
  name: string
  description: string
  image: string
}

interface RwaCardProps {
  token: RwaToken | null
}

export function RwaCard({ token }: RwaCardProps) {
  const [metadata, setMetadata] = useState<Metadata | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchMetadata() {
      if (!token || !token.metadataURI) {
        setIsLoading(false)
        return
      }
      setIsLoading(true);
      try {
        // Ajout d'un proxy pour contourner les problèmes de CORS en local si nécessaire.
        // Pour la production, il faudra une solution plus robuste.
        const proxyUrl = '/api/proxy?url='
        const response = await fetch(proxyUrl + encodeURIComponent(token.metadataURI))
        if (!response.ok) {
          throw new Error('Failed to fetch metadata')
        }
        const data: Metadata = await response.json()
        setMetadata(data)
      } catch (error) {
        console.error('Error fetching metadata for token', token.tokenId, error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMetadata()
  }, [token])

  if (!token) {
    return (
        <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="p-0"><Skeleton className="w-full aspect-square" /></CardHeader>
            <CardContent className="p-4"><Skeleton className="w-3/4 h-6 mb-2" /><Skeleton className="w-1/2 h-4" /></CardContent>
            <CardFooter className="p-4 bg-black/20"><Skeleton className="w-full h-5" /></CardFooter>
        </Card>
    )
  }

  const displayName = metadata?.name || `${token.rwaType} #${token.tokenId}`

  return (
    <Link href={`/rwa/${token.tokenId}`} className="block">
        <Card className="bg-neutral-900 border-neutral-800 hover:border-chiliz-red transition-all duration-300 ease-in-out group overflow-hidden">
            <CardHeader className="p-0">
                <div className="aspect-square w-full overflow-hidden">
                {isLoading ? (
                    <Skeleton className="w-full h-full" />
                ) : metadata?.image ? (
            <img
              src={metadata.image}
              alt={displayName}
              className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-neutral-600" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg font-bold truncate group-hover:text-chiliz-red">{displayName}</CardTitle>
        <p className="text-sm text-neutral-400 mt-1 h-10 overflow-hidden">
            {isLoading ? <Skeleton className="w-3/4 h-4 mt-1" /> : metadata?.description || 'No description available.'}
        </p>
      </CardContent>
      <CardFooter className="p-4 bg-black/20 flex justify-between text-xs">
          <div className="flex items-center gap-2 text-neutral-300">
            <PieChart className="w-4 h-4 text-chiliz-red" />
            <span>{token.percent}%</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-300">
            {parseInt(token.lockupEndDate) * 1000 > Date.now() && (
                <Lock className="w-4 h-4 text-yellow-400" />
            )}
            {token.complianceRequired && (
                <ShieldCheck className="w-4 h-4 text-blue-400" />
            )}
             <Wallet className="w-4 h-4 text-chiliz-red" />
             <span>x{token.balance}</span>
          </div>
      </CardFooter>
        </Card>
    </Link>
  )
} 