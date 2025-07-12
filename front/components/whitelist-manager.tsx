'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
// This function needs to be created in lib/api
import { addToWhitelist } from '@/lib/api' 

interface WhitelistManagerProps {
  tokenId: string
}

export function WhitelistManager({ tokenId }: WhitelistManagerProps) {
  const [addresses, setAddresses] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAdd = async () => {
    if (!addresses) {
      toast.error('Please enter at least one address.')
      return
    }
    setIsLoading(true)
    try {
        // Split by comma, newline, or space and filter out empty strings
      const users = addresses.split(/[\s,]+/).filter(addr => addr.startsWith('0x') && addr.length === 42)
      if (users.length === 0) {
          toast.error("No valid addresses found.")
          return
      }

      await addToWhitelist(tokenId, users)
      toast.success(`${users.length} address(es) added to the whitelist.`)
      setAddresses('')
    } catch (err) {
      toast.error("Error while adding to whitelist", {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="whitelist-addresses">Addresses to add</Label>
        <p className="text-xs text-neutral-400 mb-2">Separate addresses with a comma, space, or new line.</p>
        <textarea
          id="whitelist-addresses"
          value={addresses}
          onChange={(e) => setAddresses(e.target.value)}
          placeholder="0x..., 0x..."
          className="w-full bg-neutral-800 border-neutral-700 rounded-md p-2 text-sm"
          rows={3}
        />
      </div>
      <Button onClick={handleAdd} disabled={isLoading} className="w-full">
        {isLoading ? 'Adding...' : 'Add to Whitelist'}
      </Button>
    </div>
  )
} 