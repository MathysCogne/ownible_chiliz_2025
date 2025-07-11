'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, AlertTriangle, Copy, ExternalLink, LogOut } from 'lucide-react'
import { useWallet } from '@/contexts/wallet-context'
import { WalletModal } from './wallet-modal'
import { useSwitchChain } from 'wagmi'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer'
import { toast } from 'sonner'

export const WalletButton = () => {
  const { 
    isConnected, 
    isConnecting, 
    address, 
    balance, 
    network, 
    isCorrectNetwork,
    disconnect
  } = useWallet()
  
  const [showModal, setShowModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { switchChain } = useSwitchChain()

  // Prevent hydration mismatch by only rendering after client mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      toast.success('Address copied to clipboard')
    }
  }

  const openExplorer = () => {
    if (address && network.blockExplorer) {
      window.open(`${network.blockExplorer}/address/${address}`, '_blank')
    }
  }

  const handleSwitchNetwork = () => {
    if (switchChain) {
      switchChain({ chainId: network.chainId })
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setDrawerOpen(false)
    toast.success('Wallet disconnected')
  }

  // Show loading state until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <Button disabled variant="outline" className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </Button>
    )
  }

  // Loading state
  if (isConnecting) {
    return (
      <Button disabled variant="outline" className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Connecting...
      </Button>
    )
  }

  // Connected but wrong network
  if (isConnected && !isCorrectNetwork) {
    return (
      <Button onClick={handleSwitchNetwork} variant="destructive" className="gap-2">
        <AlertTriangle className="h-4 w-4" />
        Switch Network
      </Button>
    )
  }

  // Connected state - clean display with drawer
  if (isConnected && address && isCorrectNetwork) {
    return (
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerTrigger asChild>
          <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="text-right">
              <div className="text-sm font-medium">{formatAddress(address)}</div>
              <div className="text-lg font-bold">
                {balance ? `${parseFloat(balance).toFixed(4)} CHZ` : 'Loading...'}
              </div>
            </div>
          </div>
        </DrawerTrigger>
        
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Wallet Details</DrawerTitle>
          </DrawerHeader>
          
          <div className="p-6 space-y-4">
            {/* Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Address</label>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm bg-muted p-2 rounded flex-1">
                  {address}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAddress}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            </div>

            {/* Balance */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Balance</label>
              <div className="text-2xl font-bold">
                {balance ? `${parseFloat(balance).toFixed(4)} CHZ` : 'Loading...'}
              </div>
              <p className="text-xs text-muted-foreground">Chiliz Spicy Testnet</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              {network.blockExplorer && (
                <Button
                  variant="outline"
                  onClick={openExplorer}
                  className="gap-2 flex-1"
                >
                  <ExternalLink className="h-4 w-4" />
                  View on Explorer
                </Button>
              )}
              
              <Button
                variant="destructive"
                onClick={handleDisconnect}
                className="gap-2 flex-1"
              >
                <LogOut className="h-4 w-4" />
                Disconnect
              </Button>
            </div>

            {/* Faucet Link */}
            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                Need test tokens?{' '}
                <a 
                  href="https://spicy-faucet.chiliz.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Get CHZ from Spicy Faucet
                </a>
              </p>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  // Disconnected state
  return (
    <>
      <Button onClick={() => setShowModal(true)} className="gap-2">
        Connect Wallet
      </Button>
      
      <WalletModal 
        open={showModal} 
        onOpenChange={setShowModal} 
      />
    </>
  )
} 