'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAccount, useConnect, useDisconnect, useBalance, useChainId } from 'wagmi'
import { CHILIZ_NETWORK } from '@/lib/wallet-config'

interface WalletContextType {
  // Connection state
  isConnected: boolean
  isConnecting: boolean
  address?: string
  balance?: string
  mounted: boolean
  
  // Connection methods
  connect: (connectorId?: string) => void
  disconnect: () => void
  
  // Network info
  network: typeof CHILIZ_NETWORK
  isCorrectNetwork: boolean
  
  // Error handling
  error?: string
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

interface WalletProviderProps {
  children: React.ReactNode
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const { address, isConnected } = useAccount()
  const { connect: wagmiConnect, connectors, isPending } = useConnect()
  const { disconnect: wagmiDisconnect } = useDisconnect()
  const chainId = useChainId()
  
  // Balance hook with explicit chain configuration
  const { data: balance, isError: balanceError, refetch: refetchBalance } = useBalance({
    address,
    chainId: CHILIZ_NETWORK.chainId,
    query: {
      enabled: !!address && isConnected,
      retry: 3,
      retryDelay: 1000,
    }
  })
  
  const [error, setError] = useState<string>()
  const [manualBalance, setManualBalance] = useState<string>()
  const [mounted, setMounted] = useState(false)

  // Check if we're on the correct network
  const isCorrectNetwork = mounted ? chainId === CHILIZ_NETWORK.chainId : false

  // Set mounted state after hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Effect to refetch balance when network changes
  useEffect(() => {
    if (mounted && isConnected && isCorrectNetwork) {
      refetchBalance()
    }
  }, [mounted, isConnected, isCorrectNetwork, refetchBalance])

  // Effect to handle balance errors and fallback
  useEffect(() => {
    if (mounted && balanceError && isConnected && address) {
      console.warn('Balance fetch failed, this is normal on testnets')
      setManualBalance('0.0') // Fallback for testnet
    } else if (balance) {
      setManualBalance(undefined)
    }
  }, [mounted, balanceError, balance, isConnected, address])

  const connect = (connectorId?: string) => {
    setError(undefined)
    try {
      const connector = connectorId 
        ? connectors.find(c => c.id === connectorId) || connectors[0]
        : connectors[0]
      
      if (!connector) {
        setError('No wallet connector available')
        return
      }
      
      wagmiConnect({ connector })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed')
    }
  }

  const disconnect = () => {
    setError(undefined)
    setManualBalance(undefined)
    wagmiDisconnect()
  }

  // Use manual balance if main balance failed, otherwise use the fetched balance
  const displayBalance = manualBalance || balance?.formatted

  const value: WalletContextType = {
    isConnected: mounted ? isConnected : false,
    isConnecting: mounted ? isPending : false,
    address: mounted ? address : undefined,
    balance: mounted ? displayBalance : undefined,
    mounted,
    connect,
    disconnect,
    network: CHILIZ_NETWORK,
    isCorrectNetwork,
    error,
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
} 