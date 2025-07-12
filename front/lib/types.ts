export type Asset = {
  id: number;
  name: string;
  category: string;
  valuation: string;
  totalFragments: string;
  remainingFragments: string;
  isNFT: boolean;
  isTransferable: boolean;
  issuer: string;
  fragmentInfo: {
    totalSupply: string;
    availableSupply: string;
    pricePerUnit: string;
    isActive: boolean;
  };
  // UI-specific properties that might not come from the API
  price?: number; 
  change?: number;
  volume24h?: number;
  ownedFragments?: number;
}; 