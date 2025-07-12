'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@/contexts/wallet-context'
import { getContractInfo } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Plus, ShieldAlert } from 'lucide-react'
import { MintRwaDialog } from '@/components/mint-rwa-dialog'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminPage() {
  const { address, isConnected } = useWallet()
  const [isOwner, setIsOwner] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMintDialogOpen, setIsMintDialogOpen] = useState(false)

  useEffect(() => {
    async function checkOwner() {
        if(isConnected && address) {
            // Hardcoded address for development access
            if (address.toLowerCase() === "0x0519e602ab8a321a5fd90f4d44149fbf7c4cb296") {
                setIsOwner(true);
                setIsLoading(false);
                return;
            }
            try {
                const info = await getContractInfo();
                setIsOwner(address.toLowerCase() === info.owner.toLowerCase());
            } catch (error) {
                console.error("Failed to get contract info", error)
                setIsOwner(false)
            }
        } else {
            setIsOwner(false);
        }
        setIsLoading(false)
    }
    checkOwner();
  }, [isConnected, address])

  if (isLoading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-12 w-48" />
        </div>
    )
  }

  if (!isOwner) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-20">
            <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-neutral-400">You must be the contract owner to access this page.</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Admin Panel</h1>
            <p className="mt-1 text-sm text-neutral-400">
                Manage and create new RWAs for the marketplace.
            </p>
        </div>
      </div>

      <div className="p-8 border-2 border-dashed border-neutral-700 rounded-lg text-center">
            <h2 className="text-xl font-semibold mb-4">Create a New Asset</h2>
            <p className="text-neutral-400 mb-6">
                Tokenize a new Real-World Asset and make it available for sale on the marketplace.
            </p>
            <Button onClick={() => setIsMintDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Tokenize New Asset
            </Button>
      </div>
      
      <MintRwaDialog 
        open={isMintDialogOpen}
        onOpenChange={setIsMintDialogOpen}
        onMintSuccess={() => {
            // Optional: add a success message or redirection
            console.log("New RWA minted from admin panel!")
        }}
        defaultAddress={address}
      />
    </>
  )
} 