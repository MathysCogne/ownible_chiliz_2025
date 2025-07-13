'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import {
  IconUsers,
  IconChartBar,
  IconArrowsExchange,
  IconCash,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Asset } from '@/lib/types';
import { useAccount } from 'wagmi';
import { useWriteContract } from 'wagmi';
import { toast } from 'sonner';
import { getAssetTypeFromCategory, formatIpfsUrl, formatChz, formatUsd, CHZ_TO_USD_RATE } from '@/lib/utils';
import { CONTRACT_ABI } from '@/lib/contract';

type StatProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

const Stat = ({ icon, label, value }: StatProps) => (
  <div className="flex items-center gap-4 rounded-lg bg-neutral-900/50 p-3">
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-neutral-400">
      {icon}
    </div>
    <div>
      <p className="text-sm text-neutral-400">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  </div>
);

const AssetPage = () => {
  const params = useParams();
  const [assetId, setAssetId] = useState<string | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fragmentAmount, setFragmentAmount] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  useEffect(() => {
    if (typeof params?.assetId === 'string') {
      setAssetId(params.assetId);
    }
  }, [params]);

  useEffect(() => {
    if (!assetId) return;

    const fetchAsset = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/assets/${assetId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch asset details');
        }
        const data = await response.json();

        setAsset({
          ...data.asset,
          price: (parseFloat(data.asset.valuation) / 10**18) / parseFloat(data.asset.totalFragments),
          type: getAssetTypeFromCategory(data.asset.category),
          change: Math.random() * 10 - 5, // DUMMY DATA
          volume24h: Math.random() * 100000, // DUMMY DATA
        });
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchAsset();
  }, [assetId]);

  const handlePurchase = async () => {
    if (!address) {
      toast.error('Please connect your wallet first.');
      return;
    }
    if (fragmentAmount <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    setIsPurchasing(true);
    toast.info('Preparing transaction...');

    try {
      const response = await fetch('/api/contract/purchase-fragments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, fragmentAmount }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to prepare transaction.');
      }

      const txParams = await response.json();

      const tx = await writeContractAsync({
        address: txParams.contractAddress,
        abi: CONTRACT_ABI,
        functionName: txParams.functionName,
        args: [BigInt(txParams.args[0]), BigInt(txParams.args[1])],
        value: BigInt(txParams.value),
      });
      
      toast.success('Transaction submitted!', {
        description: 'Your purchase is being processed.',
        action: {
          label: 'View Tx',
          onClick: () => window.open(`https://testnet.chiliscan.com/tx/${tx}`, '_blank'),
        },
      });

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      toast.error('Purchase Failed', { description: errorMessage });
    } finally {
      setIsPurchasing(false);
    }
  };

  if (loading || !assetId) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Skeleton className="h-80 w-full rounded-xl" />
            <Skeleton className="mt-6 h-40 w-full rounded-xl" />
          </div>
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-12 w-3/4" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!asset) {
    return notFound();
  }
  
  const rwaDescription = {
    'Sport': `This is more than a collectible; it's a verifiable stake in ${asset.name}. As an owner, your investment is tied to real-world performance and value. Join a community of dedicated fans and invest in the moments that define the game.`,
    'E-Sport': `Acquiring a piece of ${asset.name} makes you a direct stakeholder in the e-sport economy. Whether it's a share of player contracts or team revenue, you own a piece of the action. Experience premium, decentralized ownership.`,
    'Music': `Each fragment of ${asset.name} gives you true ownership of music rights. Earn from royalties on streams and sales, and become part of the artist's journey. This is your chance to invest in the soundtrack of your life on a secure, decentralized platform.`,
    'Real Estate': `This asset represents a fractional share of the ${asset.name} property. Access the real estate market with ease and confidence, knowing your ownership is secured on the blockchain. Build your digital property portfolio in just a few clicks.`,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            <div className="relative h-80 w-full overflow-hidden rounded-xl border border-neutral-800">
              <Image
                src={formatIpfsUrl(asset.imageURI)}
                alt={asset.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-6">
               <h2 className="text-lg font-semibold text-white">Buy Fragments</h2>
               <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Price per Fragment</p>
                  <p className="text-3xl font-bold text-white">{formatChz(asset.price)} CHZ</p>
                  <p className="text-sm text-neutral-400 -mt-1">{formatUsd(asset.price * CHZ_TO_USD_RATE)}</p>
                </div>
                <p className="text-sm font-medium text-green-400">Available: {asset.remainingFragments}</p>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Input 
                  type="number"
                  value={fragmentAmount}
                  onChange={(e) => setFragmentAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 bg-neutral-900 border-neutral-700 text-white"
                  min="1"
                  max={asset.remainingFragments}
                />
                <div className="text-right">
                  <p className="text-neutral-300 font-semibold">{formatChz(asset.price * fragmentAmount)} CHZ</p>
                  <p className="text-xs text-neutral-500">{formatUsd(asset.price * fragmentAmount * CHZ_TO_USD_RATE)}</p>
                </div>
              </div>
              <Button 
                size="lg" 
                className="mt-6 w-full bg-red-600 font-bold text-white hover:bg-red-700"
                onClick={handlePurchase}
                disabled={isPurchasing || !address}
              >
                {isPurchasing ? 'Processing Investment...' : 'Invest Now'}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
          <div className="space-y-8">
            <div>
              <p className="font-semibold uppercase tracking-wider text-red-500">{asset.type}</p>
              <h1 className="mt-1 text-4xl font-bold tracking-tight text-white">{asset.name}</h1>
              <p className="mt-2 text-lg text-neutral-400">{asset.category}</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Stat icon={<IconCash size={22} />} label="Market Cap" value={`${formatChz(asset.price * Number(asset.totalFragments))} CHZ`} />
              <Stat icon={<IconArrowsExchange size={22} />} label="Volume (24h)" value={formatUsd(asset.volume24h || 0)} />
              <Stat icon={<IconChartBar size={22} />} label="24h Change" value={`${asset.change ? asset.change.toFixed(1) : '0.0'}%`} />
              <Stat icon={<IconUsers size={22} />} label="Owners" value={asset.totalOwners.toString()} />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white">What is this RWA?</h2>
              <p className="mt-2 text-neutral-300">
                {rwaDescription[asset.type as keyof typeof rwaDescription] || "This asset represents a real-world item tokenized on the blockchain."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetPage; 