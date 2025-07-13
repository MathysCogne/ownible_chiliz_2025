import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const CHZ_TO_USD_RATE = 0.03973;

export const formatChz = (value: number) => {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const formatUsd = (value: number) => {
    const options: Intl.NumberFormatOptions = {
        style: 'currency',
        currency: 'USD',
    };

    if (Math.abs(value) > 0 && Math.abs(value) < 1.0) {
        options.minimumFractionDigits = 4;
        options.maximumFractionDigits = 4;
    } else {
        options.minimumFractionDigits = 2;
        options.maximumFractionDigits = 2;
    }
    
    return value.toLocaleString('en-US', options);
}

export const getAssetTypeFromCategory = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('sport') || cat.includes('player') || cat.includes('merchandise')) {
    return 'E-Sport'; // Assumption, can be Sport too
  }
  if (cat.includes('music') || cat.includes('album')) {
    return 'Music';
  }
  if (cat.includes('real estate') || cat.includes('event')) {
    return 'Real Estate';
  }
  return 'Sport'; // Fallback
};

export const formatIpfsUrl = (ipfsUri?: string) => {
  if (!ipfsUri || !ipfsUri.startsWith('ipfs://')) {
    return '/mock_asset.png'; // Return a default placeholder
  }
  const hash = ipfsUri.replace('ipfs://', '');
  // Using a public gateway. A dedicated gateway would be better for production.
  return `https://ipfs.io/ipfs/${hash}`;
};
