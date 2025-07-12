'use client';

import { useMemo } from 'react';
import { Asset } from '@/lib/mock-data';
import { IconArrowDown, IconChartPie, IconCash, IconArrowsExchange, IconTrendingUp } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface MarketStatsProps {
  assets: Asset[];
  totalMarketCap: number;
  isAllCategory: boolean;
}

interface StatItemProps {
  label: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}

const StatItem = ({ label, children, icon }: StatItemProps) => (
  <div className="flex items-center gap-3">
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-neutral-400">
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-xs text-neutral-400">{label}</span>
      <span className="text-base font-semibold text-white">{children}</span>
    </div>
  </div>
);

export function MarketStats({ assets, totalMarketCap, isAllCategory }: MarketStatsProps) {
  const stats = useMemo(() => {
    if (assets.length === 0) {
      return { marketCap: 0, volume24h: 0, avgChange: 0, dominance: 0 };
    }

    const marketCap = assets.reduce((acc, asset) => acc + asset.price, 0);
    const volume24h = assets.reduce((acc, asset) => acc + asset.volume24h, 0);
    const totalChange = assets.reduce((acc, asset) => acc + asset.change, 0);

    return {
      marketCap,
      volume24h,
      avgChange: totalChange / assets.length,
      dominance: totalMarketCap > 0 ? (marketCap / totalMarketCap) * 100 : 0,
    };
  }, [assets, totalMarketCap]);

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  };
  
  const avgChangeColor = stats.avgChange >= 0 ? 'text-green-400' : 'text-red-400';
  const ChangeIcon = stats.avgChange >= 0 ? IconTrendingUp : IconArrowDown;

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
      <StatItem label="Market Cap" icon={<IconCash size={18} />}>
        {formatCurrency(stats.marketCap)}
      </StatItem>
      
      <StatItem label="Volume (24h)" icon={<IconArrowsExchange size={18} />}>
        {formatCurrency(stats.volume24h)}
      </StatItem>
      
      <StatItem label="Avg. Change" icon={<ChangeIcon size={18} className={avgChangeColor} />}>
        <span className={avgChangeColor}>{stats.avgChange.toFixed(2)}%</span>
      </StatItem>

      {!isAllCategory && (
        <StatItem label="Dominance" icon={<IconChartPie size={18} />}>
          {stats.dominance.toFixed(2)}%
        </StatItem>
      )}
    </div>
  );
} 