export type FragmentOwner = {
  address: string;
  balance: string;
  percentage: string;
};

export type Asset = {
  id: number;
  name: string;
  category: string;
  type?: string; // Type is used for filtering, let's see if category can be used
  valuation: string;
  totalFragments: string;
  remainingFragments: string;
  isNFT: boolean;
  isTransferable: boolean;
  owner: string; // Renamed from issuer
  metadataURI: string;
  imageURI: string;
  fragmentOwners: FragmentOwner[];
  totalOwners: number;
  distributionPercentage: string;

  // UI-specific properties that might not come from the API
  // These will need to be calculated or derived
  price: number;
  change?: number;
  volume24h?: number;
  ownedFragments?: number; // This can be calculated from fragmentOwners
  quantity?: number; // Used in portfolio view
};

// The portfolio view adds the 'quantity' field to the base Asset type
export type PortfolioAsset = Asset & {
  quantity: number;
}; 