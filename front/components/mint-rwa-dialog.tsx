'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { mintRwaToken } from '@/lib/api'
import { toast } from 'sonner'
import { MintRwaTokenPayload } from '@/lib/api'

interface MintRwaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onMintSuccess: () => void
  defaultAddress?: string
}

export function MintRwaDialog({ open, onOpenChange, onMintSuccess, defaultAddress }: MintRwaDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Les états du formulaire
  const [rwaType, setRwaType] = useState('')
  const [amount, setAmount] = useState('1')
  const [percent, setPercent] = useState('100')
  const [price, setPrice] = useState('0')
  const [metadataURI, setMetadataURI] = useState('')
  // --- Advanced Options ---
  const [legalDocURI, setLegalDocURI] = useState('')
  const [lockupEndDate, setLockupEndDate] = useState('')
  const [complianceRequired, setComplianceRequired] = useState(false)


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!defaultAddress) {
        toast.error("Wallet address is not available.")
        return
    }

    if (!rwaType || !amount || !percent || !metadataURI) {
        toast.error('Please fill all the required fields.')
        return
    }

    setIsLoading(true)
    setError(null)
    try {
      const payload: MintRwaTokenPayload = { // Using the imported type
        to: defaultAddress,
        amount: parseInt(amount, 10),
        percent: parseInt(percent, 10),
        rwaType,
        metadataURI,
        price,
        legalDocURI,
        // Convert date to unix timestamp. If no date, set to 0.
        lockupEndDate: lockupEndDate ? Math.floor(new Date(lockupEndDate).getTime() / 1000) : 0,
        complianceRequired,
      }
      
      const result = await mintRwaToken(payload)
      
      toast.success('RWA created successfully!', {
        description: `Transaction: ${result.transactionHash.substring(0,10)}...`,
        action: {
          label: 'View',
          onClick: () => window.open(`https://spicy-explorer.chiliz.com/tx/${result.transactionHash}`, '_blank'),
        },
      })

      onMintSuccess()
      onOpenChange(false) // Close the dialog

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.'
      setError(errorMessage)
      toast.error('Error during creation', {
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-neutral-900 border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-white">Tokenize a new asset</DialogTitle>
          <DialogDescription>
            Fill in the information below to create a new digital asset (RWA).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rwa-type" className="text-right text-neutral-300">
                Type
                </Label>
                <Input
                id="rwa-type"
                value={rwaType}
                onChange={(e) => setRwaType(e.target.value)}
                placeholder="e.g.: Music Right, Merch..."
                className="col-span-3"
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right text-neutral-300">
                Quantity
                </Label>
                <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="col-span-3"
                min="1"
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="percent" className="text-right text-neutral-300">
                Percentage
                </Label>
                <Input
                id="percent"
                type="number"
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
                placeholder="e.g.: 10"
                className="col-span-3"
                min="0"
                max="100"
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right text-neutral-300">
                Price (CHZ)
                </Label>
                <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g.: 50"
                className="col-span-3"
                min="0"
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="metadata-uri" className="text-right text-neutral-300">
                Metadata URI
                </Label>
                <Input
                id="metadata-uri"
                value={metadataURI}
                onChange={(e) => setMetadataURI(e.target.value)}
                placeholder="ipfs://..."
                className="col-span-3"
                />
            </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="advanced-options">
                    <AccordionTrigger>Advanced Options</AccordionTrigger>
                    <AccordionContent>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="legal-doc-uri" className="text-right text-neutral-300">
                            Legal Doc URI
                            </Label>
                            <Input
                            id="legal-doc-uri"
                            value={legalDocURI}
                            onChange={(e) => setLegalDocURI(e.target.value)}
                            placeholder="https://.../legal.pdf"
                            className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="lockup-date" className="text-right text-neutral-300">
                            Lock-up End
                            </Label>
                            <Input
                            id="lockup-date"
                            type="date"
                            value={lockupEndDate}
                            onChange={(e) => setLockupEndDate(e.target.value)}
                            className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                             <Label htmlFor="compliance" className="text-right text-neutral-300">
                                Compliance
                            </Label>
                            <div className="col-span-3 flex items-center space-x-2">
                                <Checkbox id="compliance" checked={complianceRequired} onCheckedChange={(checked) => setComplianceRequired(!!checked)} />
                                <label
                                    htmlFor="compliance"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Enable whitelist for this RWA
                                </label>
                            </div>
                        </div>
                    </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <DialogFooter className="pt-4">
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? 'Creating...' : 'Create RWA'}
            </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 