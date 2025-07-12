import { http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { defineChain } from 'viem';

export const spicyTestnet = defineChain({
  id: 88882,
  name: 'Chiliz Spicy Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'CHZ',
    symbol: 'CHZ',
  },
  rpcUrls: {
    default: {
      http: ['https://spicy-rpc.chiliz.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Chiliz Spicy Explorer',
      url: 'https://testnet.chiliscan.com',
    },
  },
  testnet: true,
});

export const config = createConfig({
  chains: [spicyTestnet],
  connectors: [injected()],
  transports: {
    [spicyTestnet.id]: http(),
  },
}); 