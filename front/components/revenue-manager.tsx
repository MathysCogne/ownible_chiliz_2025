'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
// This function needs to be created in lib/api
import { depositRevenue } from '@/lib/api' 

interface RevenueManagerProps {
  tokenId: string
}

export function RevenueManager({ tokenId }: RevenueManagerProps) {
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount.')
      return
    }
    setIsLoading(true)
    try {
      await depositRevenue(tokenId, amount)
      toast.success(`${amount} CHZ deposited successfully.`)
      setAmount('')
    } catch (err) {
      toast.error("Error during deposit", {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="deposit-amount">Amount to deposit (in CHZ)</Label>
        <Input
          id="deposit-amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g.: 1000"
          className="mt-1"
        />
      </div>
      <Button onClick={handleDeposit} disabled={isLoading} className="w-full">
        {isLoading ? 'Depositing...' : 'Deposit Revenue'}
      </Button>
    </div>
  )
} 