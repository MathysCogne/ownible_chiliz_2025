import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWriteContract, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { parseEther } from 'viem';

// Hook for reading contract data
export function useContractData() {
  return useQuery({
    queryKey: ['contract-data'],
    queryFn: async () => {
      const response = await fetch('/api/contract?action=getAllAssets');
      if (!response.ok) throw new Error('Failed to fetch assets');
      return response.json();
    },
    refetchInterval: 30000,
  });
}

// Hook for contract stats
export function useContractStats() {
  return useQuery({
    queryKey: ['contract-stats'],
    queryFn: async () => {
      const response = await fetch('/api/contract?action=getContractStats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    refetchInterval: 30000,
  });
}

// Hook for getting specific asset
export function useAsset(assetId: string | number) {
  return useQuery({
    queryKey: ['asset', assetId],
    queryFn: async () => {
      const response = await fetch(`/api/contract?action=getAsset&assetId=${assetId}`);
      if (!response.ok) throw new Error('Failed to fetch asset');
      return response.json();
    },
    enabled: !!assetId,
  });
}

// Hook for getting fragment info
export function useFragmentInfo(assetId: string | number) {
  return useQuery({
    queryKey: ['fragment-info', assetId],
    queryFn: async () => {
      const response = await fetch(`/api/contract?action=getFragmentInfo&assetId=${assetId}`);
      if (!response.ok) throw new Error('Failed to fetch fragment info');
      return response.json();
    },
    enabled: !!assetId,
  });
}

// Hook for getting fragment balance
export function useFragmentBalance(assetId: string | number, address: string) {
  return useQuery({
    queryKey: ['fragment-balance', assetId, address],
    queryFn: async () => {
      const response = await fetch(`/api/contract?action=getFragmentBalance&assetId=${assetId}&address=${address}`);
      if (!response.ok) throw new Error('Failed to fetch balance');
      return response.json();
    },
    enabled: !!assetId && !!address,
  });
}

// Hook for creating assets
export function useCreateAsset() {
  const queryClient = useQueryClient();
  const { writeContract } = useWriteContract();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      category: string;
      valuation: string;
      totalFragments: number;
      isNFT?: boolean;
      isTransferable?: boolean;
      metadataURI: string;     // Required now
      imageURI?: string;
    }) => {
      return writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'createAsset',
        args: [
          data.name,
          data.category,
          parseEther(data.valuation),
          BigInt(data.totalFragments),
          data.isNFT || false,
          data.isTransferable || true,
          data.metadataURI,        // Required for IPFS
          data.imageURI || ''
        ],
        gas: BigInt(800000),
        gasPrice: BigInt("2501000000000"),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-data'] });
      queryClient.invalidateQueries({ queryKey: ['contract-stats'] });
    },
  });
}

// Hook for purchasing fragments
export function usePurchaseFragments() {
  const queryClient = useQueryClient();
  const { writeContract } = useWriteContract();

  return useMutation({
    mutationFn: async (data: {
      assetId: number;
      fragmentAmount: number;
    }) => {
      const response = await fetch('/api/contract/purchase-fragments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to prepare transaction');
      }
      
      const txParams = await response.json();
      
      return writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'buyFragments',
        args: [BigInt(data.assetId), BigInt(data.fragmentAmount)],
        value: BigInt(txParams.value),
        gas: BigInt(txParams.gasLimit),
        gasPrice: BigInt(txParams.gasPrice),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-data'] });
      queryClient.invalidateQueries({ queryKey: ['fragment-balance'] });
      queryClient.invalidateQueries({ queryKey: ['fragment-info'] });
    },
  });
}

// Hook for purchasing full ownership
export function usePurchaseFullOwnership() {
  const queryClient = useQueryClient();
  const { writeContract } = useWriteContract();

  return useMutation({
    mutationFn: async (data: {
      assetId: number;
    }) => {
      const response = await fetch('/api/contract/purchase-full-ownership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to prepare transaction');
      }
      
      const txParams = await response.json();
      
      return writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'buyFullOwnership',
        args: [BigInt(data.assetId)],
        value: BigInt(txParams.value),
        gas: BigInt(txParams.gasLimit),
        gasPrice: BigInt(txParams.gasPrice),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-data'] });
      queryClient.invalidateQueries({ queryKey: ['fragment-balance'] });
      queryClient.invalidateQueries({ queryKey: ['contract-stats'] });
    },
  });
}

// Hook for checking if address is authorized issuer
export function useIsAuthorizedIssuer(address: string) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'authorizedIssuers',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });
}