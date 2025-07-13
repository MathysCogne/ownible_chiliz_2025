'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SimpleTable } from '@/components/ui/simple-table';
import { columns } from './columns';
import { PortfolioAsset } from '@/lib/types';
import { IconChartPie } from '@tabler/icons-react';
import { formatChz, formatUsd, CHZ_TO_USD_RATE } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PortfolioAllocationChart, AllocationData } from '@/components/portfolio-allocation-chart';
import { Separator } from '@/components/ui/separator';

// A single, reusable component for the summary stats
const StatCard = ({ title, value, subValue, description }: { title: string, value: string, subValue?: string, description:string }) => (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 flex flex-col justify-between transition-all hover:border-neutral-700 hover:bg-neutral-900">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-neutral-400">{title}</h3>
        </div>
        <div>
            <div className="text-3xl font-bold text-white">{value}</div>
            {subValue && <div className="text-sm text-neutral-400">{subValue}</div>}
            <p className="text-xs text-neutral-500 mt-1">{description}</p>
        </div>
    </div>
);

const PortfolioProjection = ({ weightedYield, initialValue }: { weightedYield: number, initialValue: number }) => {
  const yieldDecimal = weightedYield / 100;

  const calculateProjection = (years: number) => {
    if (isNaN(yieldDecimal)) return initialValue;
    return initialValue * Math.pow(1 + yieldDecimal, years);
  };

  const projection1Y = calculateProjection(1);
  const gain1Y = projection1Y - initialValue;
  const projection3Y = calculateProjection(3);
  const gain3Y = projection3Y - initialValue;
  const projection5Y = calculateProjection(5);
  const gain5Y = projection5Y - initialValue;

  return (
    <Card className="h-full bg-neutral-900/50 border-neutral-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <IconChartPie size={20} />
          <span>Portfolio Projection</span>
        </CardTitle>
        <CardDescription>
          Future value simulation of your current portfolio based on its weighted average yield of {weightedYield.toFixed(2)}%.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-neutral-400">Current Value</p>
          <p className="text-2xl font-bold text-white">{formatUsd(initialValue)}</p>
        </div>
        
        <Separator className="bg-neutral-700" />
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-neutral-100">Projected Value After:</h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-lg bg-neutral-900 p-3 text-center">
              <p className="text-sm text-neutral-400">1 Year</p>
              <p className="mt-1 text-lg font-bold text-white">{formatUsd(projection1Y)}</p>
              <p className="mt-1 text-xs text-green-400">(+{formatUsd(gain1Y)})</p>
            </div>
            <div className="rounded-lg bg-neutral-900 p-3 text-center">
              <p className="text-sm text-neutral-400">3 Years</p>
              <p className="mt-1 text-lg font-bold text-white">{formatUsd(projection3Y)}</p>
              <p className="mt-1 text-xs text-green-400">(+{formatUsd(gain3Y)})</p>
            </div>
            <div className="rounded-lg bg-neutral-900 p-3 text-center">
              <p className="text-sm text-neutral-400">5 Years</p>
              <p className="mt-1 text-lg font-bold text-white">{formatUsd(projection5Y)}</p>
              <p className="mt-1 text-xs text-green-400">(+{formatUsd(gain5Y)})</p>
            </div>
          </div>
        </div>
        
        <p className="text-center text-xs text-neutral-500 pt-2">
          * This is a simulation for illustrative purposes only. Not financial advice.
        </p>
      </CardContent>
    </Card>
  );
};


export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address) {
      setLoading(false);
      return;
    }

    const fetchPortfolio = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/portfolio/${address}`);
        if (!response.ok) throw new Error('Failed to fetch portfolio');
        const data = await response.json();

        const processedAssets = (data.assets as (Omit<PortfolioAsset, 'price' | 'quantity'> & { quantity: string })[]).map((asset): PortfolioAsset => ({
          ...asset,
          price: (parseFloat(asset.valuation) / 10**18) / parseFloat(asset.totalFragments),
          quantity: parseInt(asset.quantity, 10),
        }));

        setAssets(processedAssets);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [address, isConnected]);
  
  const { portfolioSummary, allocationData, assetsWithYield } = useMemo(() => {
    // Add a stable, dummy projected yield to each asset
    const assetsWithYield: PortfolioAsset[] = assets.map(asset => ({
      ...asset,
      // In a real app, this would come from the API. We make it stable based on ID.
      projectedYield: parseFloat(((parseInt(asset.id.toString().slice(-2)) % 5) + 2 + Math.random()).toFixed(2))
    }));
    
    const totalValue = assetsWithYield.reduce((acc, asset) => {
      return acc + (asset.price || 0) * (asset.quantity || 0);
    }, 0);
    
    const totalWeightedYield = assetsWithYield.reduce((acc, asset) => {
      const assetValue = (asset.price || 0) * (asset.quantity || 0);
      return acc + ((asset.projectedYield || 0) * assetValue);
    }, 0);

    const weightedAverageYield = totalValue > 0 ? totalWeightedYield / totalValue : 0;

    // Placeholder for return calculation - can be replaced by real data later
    const totalReturn = totalValue * (weightedAverageYield / 100); 
    const totalReturnPercentage = weightedAverageYield;

    // Allocation Calculation
    const allocation: { [key: string]: number } = assetsWithYield.reduce((acc, asset) => {
      const category = asset.category || 'Other';
      const value = (asset.price || 0) * (asset.quantity || 0);
      acc[category] = (acc[category] || 0) + value;
      return acc;
    }, {} as { [key: string]: number });

    // Using a more robust, hardcoded color palette that matches the theme
    const colorPalette = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#8b5cf6'];
    const allocationData: AllocationData[] = Object.entries(allocation).map(([category, value], index) => ({
      category,
      value,
      fill: colorPalette[index % colorPalette.length],
    }));

    return {
      portfolioSummary: {
        totalValue,
        totalAssets: assetsWithYield.length,
        totalReturn,
        totalReturnPercentage,
        weightedAverageYield,
      },
      allocationData,
      assetsWithYield,
    };
  }, [assets]);
  
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 text-center h-64">
        <h2 className="text-2xl font-bold text-white">Connect Your Wallet</h2>
        <p className="text-neutral-400">Please connect your wallet to view your portfolio and investment details.</p>
      </div>
    );
  }

  if (loading) {
    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-[130px] rounded-xl" />
                <Skeleton className="h-[130px] rounded-xl" />
                <Skeleton className="h-[130px] rounded-xl" />
            </div>
            <Skeleton className="h-[300px] rounded-xl" />
        </div>
    );
  }

  if (error) return <div className="text-center text-red-500">Error: {error}</div>;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">My RWA Portfolio</h1>
        <p className="text-neutral-400">Where your passions become investments. Each asset you own is securely recorded on the blockchain.</p>
      </div>
      
      {/* Portfolio Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
            title="Total Portfolio Value"
            value={`${formatChz(portfolioSummary.totalValue)} CHZ`}
            subValue={formatUsd(portfolioSummary.totalValue * CHZ_TO_USD_RATE)}
            description="The current estimated value of all your assets."
        />
        <StatCard 
            title="Total Assets"
            value={portfolioSummary.totalAssets.toString()}
            description="The number of unique assets in your portfolio."
        />
        <StatCard 
            title="Projected Annual Return"
            value={`+${formatChz(portfolioSummary.totalReturn)} CHZ`}
            subValue={`(+${formatUsd(portfolioSummary.totalReturn * CHZ_TO_USD_RATE)})`}
            description={`Est. return over 12 months based on a ${portfolioSummary.weightedAverageYield.toFixed(2)}% weighted yield.`}
        />
      </div>

      <div className="w-full">
          {assets.length > 0 ? (
              <SimpleTable columns={columns} data={assetsWithYield} />
          ) : (
              <div className="flex flex-col items-center justify-center gap-4 text-center h-full min-h-[400px] rounded-lg border-2 border-dashed border-neutral-800">
                  <h2 className="text-2xl font-bold text-white">Your Portfolio is Ready</h2>
                  <p className="text-neutral-400 max-w-md">You haven&apos;t invested in any assets yet. Browse our marketplace to find assets that match your passion and start building your collection.</p>
                  <Button asChild>
                      <Link href="/dashboard/market">Start Investing</Link>
                  </Button>
              </div>
          )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-1">
            <Card className="h-full bg-neutral-900/50 border-neutral-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <IconChartPie size={20} />
                        <span>Asset Allocation</span>
                    </CardTitle>
                    <CardDescription>
                        Your portfolio distribution across different asset categories.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center pb-6 h-[300px]">
                    {assets.length > 0 ? (
                        <PortfolioAllocationChart data={allocationData} />
                    ) : (
                        <div className="text-center text-neutral-500 text-sm py-12">No data to display.</div>
                    )}
                </CardContent>
            </Card>
        </div>
         <div className="lg:col-span-1">
          {assets.length > 0 && (
            <PortfolioProjection 
              weightedYield={portfolioSummary.weightedAverageYield}
              initialValue={portfolioSummary.totalValue * CHZ_TO_USD_RATE}
            />
          )}
        </div>
      </div>
    </div>
  );
} 