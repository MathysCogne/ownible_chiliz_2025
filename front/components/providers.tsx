'use client'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/lib/wallet-config'
import { WalletProvider } from '@/contexts/wallet-context'
import { WalletButton } from '@/components/wallet'
import { Toaster } from '@/components/ui/sonner'
import { useState } from 'react'

interface ProvidersProps {
  children: React.ReactNode
}

export const Providers = ({ children }: ProvidersProps) => {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <WalletProvider>
          {/* Wallet button seul en haut à droite */}
          <div className="fixed top-6 right-6 z-50">
            <WalletButton />
          </div>
          
          {/* Page content */}
          {children}
          
          {/* Notifications seulement */}
          <Toaster />
        </WalletProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
} 