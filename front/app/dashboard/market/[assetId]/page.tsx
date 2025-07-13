'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import {
  IconUsers,
  IconChartBar,
  IconArrowsExchange,
  IconPigMoney,
  IconScale,
  IconInfoCircle,
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
import { IconPepper } from '@tabler/icons-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Slider } from "@/components/ui/slider";

type StatProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  tooltip: string;
  valueColor?: string;
};

const Stat = ({ icon, label, value, tooltip, valueColor = 'text-white' }: StatProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-4 rounded-lg bg-neutral-900/50 p-3 transition-colors hover:bg-neutral-900">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-neutral-400">
            {icon}
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-sm text-neutral-400">
              {label} <IconInfoCircle size={14} />
            </p>
            <p className={`text-lg font-semibold ${valueColor}`}>{value}</p>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const InvestmentSimulation = ({ projectedYield }: { projectedYield: string }) => {
  const [investmentAmount, setInvestmentAmount] = useState(100);

  const yieldDecimal = parseFloat(projectedYield) / 100;

  const calculateProjection = (years: number) => {
    if (isNaN(yieldDecimal) || !investmentAmount) return 0;
    return investmentAmount * Math.pow(1 + yieldDecimal, years);
  };

  const projection1Y = calculateProjection(1);
  const gain1Y = projection1Y - investmentAmount;
  const projection3Y = calculateProjection(3);
  const gain3Y = projection3Y - investmentAmount;
  const projection5Y = calculateProjection(5);
  const gain5Y = projection5Y - investmentAmount;

  return (
    <div>
      <h2 className="text-xl font-semibold text-white">Investment Simulation</h2>
      <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950/50 p-6">
        <div className="flex flex-col gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <label htmlFor="investment-amount" className="text-sm font-medium text-neutral-300">
                Investment Amount
              </label>
              <div className="relative w-32">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">$</span>
                <Input
                  id="investment-amount"
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(Number(e.target.value) || 0)}
                  className="w-full border-neutral-700 bg-neutral-900 pl-7 text-white"
                  placeholder="100"
                />
              </div>
            </div>
             <Slider
              value={[investmentAmount]}
              onValueChange={(value: number[]) => setInvestmentAmount(value[0])}
              max={10000}
              step={100}
              className="w-full"
            />
          </div>

          <Separator className="bg-neutral-800" />

          <div className="space-y-4">
            <h3 className="text-center text-lg font-medium text-neutral-100">Projected Value</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-neutral-900 p-4 text-center">
                <p className="text-sm text-neutral-400">After 1 Year</p>
                <p className="mt-1 text-2xl font-bold text-white">{formatUsd(projection1Y)}</p>
                <p className="mt-1 text-xs text-green-400">(+{formatUsd(gain1Y)})</p>
              </div>
              <div className="rounded-lg bg-neutral-900 p-4 text-center">
                <p className="text-sm text-neutral-400">After 3 Years</p>
                <p className="mt-1 text-2xl font-bold text-white">{formatUsd(projection3Y)}</p>
                <p className="mt-1 text-xs text-green-400">(+{formatUsd(gain3Y)})</p>
              </div>
              <div className="rounded-lg bg-neutral-900 p-4 text-center">
                <p className="text-sm text-neutral-400">After 5 Years</p>
                <p className="mt-1 text-2xl font-bold text-white">{formatUsd(projection5Y)}</p>
                <p className="mt-1 text-xs text-green-400">(+{formatUsd(gain5Y)})</p>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-neutral-500">
            * This is a simulation based on projected yield. Not financial advice.
          </p>
        </div>
      </div>
    </div>
  );
};


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

  const projectedYield = useMemo(() => {
    if (!asset?.id) return '0.00';
    // This is dummy data, regenerated only when asset ID changes.
    return (Math.random() * 5 + 2).toFixed(2);
  }, [asset?.id]);

  const assetValuation = useMemo(() => {
    if (!asset) return 0;
    return asset.price * Number(asset.totalFragments);
  }, [asset]);

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

        const price = (parseFloat(data.asset.valuation) / 10**18) / parseFloat(data.asset.totalFragments)
        
        setAsset({
          ...data.asset,
          price,
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
                  <p className="text-3xl font-bold text-white">{formatUsd(asset.price * CHZ_TO_USD_RATE)}</p>
                  <p className="flex items-center gap-1 text-sm text-neutral-400 -mt-1">
                    {formatChz(asset.price)} <IconPepper className="size-4 text-red-500" />
                  </p>
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
            
            <div>
              <h2 className="text-xl font-semibold text-white">About this RWA</h2>
              <p className="mt-2 text-neutral-300">
                {rwaDescription[asset.type as keyof typeof rwaDescription] || "This asset represents a real-world item tokenized on the blockchain."}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Stat 
                icon={<IconScale size={22} />} 
                label="Total Valuation" 
                value={formatUsd(assetValuation * CHZ_TO_USD_RATE)}
                tooltip="The total market value of this real-world asset, calculated as (Price per Fragment × Total Fragments)."
              />
               <Stat 
                icon={<IconPigMoney size={22} />} 
                label="Projected Yield" 
                value={`${projectedYield}%`}
                tooltip="Estimated annual return on investment based on historical data and market projections."
                valueColor="text-green-400"
              />
              <Stat 
                icon={<IconArrowsExchange size={22} />} 
                label="Volume (24h)" 
                value={formatUsd(asset.volume24h || 0)}
                tooltip="The total value of fragments traded for this asset in the last 24 hours."
              />
              <Stat 
                icon={<IconChartBar size={22} />} 
                label="24h Change" 
                value={`${asset.change ? asset.change.toFixed(1) : '0.0'}%`}
                tooltip="The percentage change in the fragment price over the last 24 hours."
                valueColor={asset.change && asset.change >= 0 ? 'text-green-400' : 'text-red-400'}
              />
              <Stat 
                icon={<IconUsers size={22} />} 
                label="Owners" 
                value={asset.totalOwners.toString()}
                tooltip="The total number of unique wallet addresses that own at least one fragment of this asset."
              />
            </div>

            <InvestmentSimulation projectedYield={projectedYield} />
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetPage; 