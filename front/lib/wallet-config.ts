import { createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { defineChain } from 'viem'

// Chiliz Spicy Testnet configuration
export const chilizSpicyTestnet = defineChain({
  id: 88882,
  name: 'Chiliz Spicy Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'CHZ',
    symbol: 'CHZ',
  },
  rpcUrls: {
    default: {
      http: ['https://spicy-rpc.chiliz.com']
    }
  },
  blockExplorers: {
    default: {
      name: 'Chiliz Spicy Explorer',
      url: 'https://testnet.chiliscan.com'
    }
  },
  testnet: true
})

export const config = createConfig({
  chains: [chilizSpicyTestnet],
  connectors: [
    injected(), // MetaMask only
  ],
  transports: {
    [chilizSpicyTestnet.id]: http('https://spicy-rpc.chiliz.com')
  }
})

// Chiliz Spicy Testnet configuration
export const CHILIZ_NETWORK = {
  chainId: chilizSpicyTestnet.id,
  name: chilizSpicyTestnet.name,
  symbol: chilizSpicyTestnet.nativeCurrency.symbol,
  rpcUrl: chilizSpicyTestnet.rpcUrls.default.http[0],
  blockExplorer: chilizSpicyTestnet.blockExplorers?.default.url
} 