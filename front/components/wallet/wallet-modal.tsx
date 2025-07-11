'use client'

import { useConnect } from 'wagmi'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { useWallet } from '@/contexts/wallet-context'

interface WalletModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const WalletModal = ({ open, onOpenChange }: WalletModalProps) => {
  const { connectors, connect, isPending } = useConnect()
  const { error, network } = useWallet()

  const handleConnect = () => {
    const injectedConnector = connectors.find(connector => connector.id === 'injected')
    if (injectedConnector) {
      connect({ connector: injectedConnector })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Connect to Chiliz Spicy Testnet
            <Badge variant="outline">{network.name}</Badge>
          </DialogTitle>
          <DialogDescription>
            Connect your MetaMask wallet to the Chiliz Spicy Testnet. Make sure you have test CHZ tokens.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-auto p-0"
                onClick={handleConnect}
                disabled={isPending}
              >
                <div className="text-2xl">
                  🦊
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">
                    MetaMask
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Connect using MetaMask browser extension
                  </div>
                </div>
                {isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground text-center pt-2">
          Make sure MetaMask is installed and you're on the Chiliz Spicy Testnet
        </div>
      </DialogContent>
    </Dialog>
  )
} 