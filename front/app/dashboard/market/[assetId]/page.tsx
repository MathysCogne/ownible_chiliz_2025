'use client';

import { assets } from '@/lib/mock-data';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import {
  IconUsers,
  IconChartBar,
  IconArrowsExchange,
  IconCash,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';

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
  const assetId = params.assetId as string;
  const asset = assets.find((a) => a.id.toString() === assetId);

  if (!asset) {
    notFound();
  }

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  };
  
  const rwaDescription = {
    'Sport': `Owning a fragment of ${asset.name} means you're investing in a real-world sporting asset. This could be a share of a player's future earnings, a piece of exclusive memorabilia, or access to unique events. Your investment's value is directly tied to the asset's real-world performance and demand.`,
    'E-Sport': `By acquiring a piece of ${asset.name}, you are purchasing a share of a tangible asset in the e-sport ecosystem. This translates to a fraction of a player's contract, team revenue, or even prize pool winnings. It's a direct stake in the digital arena's growing economy.`,
    'Music': `Each fragment of ${asset.name} represents a fractional ownership of music rights. This could be royalties from streams, sales, or public performances. As the music's popularity grows, so does the potential return on your real-world asset investment.`,
    'Real Estate': `You are purchasing a verifiable, fractional stake in the ${asset.name} property. This gives you a claim on a portion of the property's value, potential rental income, or appreciation. It's a modern way to access the tangible and historically stable real estate market.`,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            <div className="relative h-80 w-full overflow-hidden rounded-xl border border-neutral-800">
              <Image
                src="/mock_asset.png"
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
                  <p className="text-3xl font-bold text-white">${asset.price.toFixed(2)}</p>
                </div>
                <p className="text-sm font-medium text-green-400">Available: {asset.totalFragments - asset.ownedFragments}</p>
              </div>
              <Button size="lg" className="mt-6 w-full bg-red-600 font-bold text-white hover:bg-red-700">
                Purchase
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
              <Stat icon={<IconCash size={22} />} label="Market Cap" value={formatCurrency(asset.price * asset.totalFragments)} />
              <Stat icon={<IconArrowsExchange size={22} />} label="Volume (24h)" value={formatCurrency(asset.volume24h)} />
              <Stat icon={<IconChartBar size={22} />} label="24h Change" value={`${asset.change.toFixed(1)}%`} />
              <Stat icon={<IconUsers size={22} />} label="Owners" value={asset.ownedFragments.toString()} />
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