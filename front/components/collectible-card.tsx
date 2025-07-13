import Image from 'next/image';
import { cn, formatIpfsUrl, formatChz, formatUsd, CHZ_TO_USD_RATE } from '@/lib/utils';
import { Asset } from '@/lib/types';
import { 
  IconTrendingDown, 
  IconTrendingUp, 
  IconChevronRight,
  IconMusic,
  IconHome,
  IconDeviceGamepad2,
  IconBallFootball,
} from '@tabler/icons-react';
import Link from 'next/link';

interface CollectibleCardProps {
  asset: Asset;
}

const getAssetIcon = (type: Asset["type"]) => {
  switch (type) {
    case "Sport":
      return IconBallFootball
    case "E-Sport":
      return IconDeviceGamepad2
    case "Music":
      return IconMusic
    case "Real Estate":
      return IconHome
    default:
      return IconBallFootball
  }
}

export function CollectibleCard({ asset }: CollectibleCardProps) {
  const isPositiveChange = asset.change && asset.change >= 0;
  const ChangeIcon = isPositiveChange ? IconTrendingUp : IconTrendingDown;
  const priceChangeColor = isPositiveChange ? 'text-green-400' : 'text-red-400';
  const AssetIcon = getAssetIcon(asset.type);
  // const remainingFragments = Number(asset.totalFragments) - (asset.ownedFragments || 0);
  const ownershipPercentage = asset.ownedFragments ? (asset.ownedFragments / Number(asset.totalFragments)) * 100 : 0;

  return (
    <Link href={`/dashboard/market/${asset.id}`} className="block h-full">
      <div className="group relative flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 transition-colors duration-300 hover:border-neutral-700">
        
        <div className="absolute inset-0 z-0">
          <Image
            src={formatIpfsUrl(asset.imageURI)}
            alt={asset.name}
            fill
            className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/70 transition-colors duration-300 group-hover:bg-black/60" />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="space-y-4 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-800/80 backdrop-blur-sm">
                  <AssetIcon className="h-6 w-6 text-neutral-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-50">{asset.name}</h3>
                  <p className="text-sm text-neutral-400">{asset.category}</p>
                </div>
              </div>
              <div className={cn('flex items-center gap-1 text-sm font-semibold', priceChangeColor)}>
                <ChangeIcon size={16} />
                <span>{asset.change ? asset.change.toFixed(1) : 'N/A'}%</span>
              </div>
            </div>
            
            <div>
              <span className="text-xs text-neutral-500">Price per Fragment</span>
              <p className="text-2xl font-bold text-white">{formatChz(asset.price)} CHZ</p>
              <p className="text-sm text-neutral-400">{formatUsd(asset.price * CHZ_TO_USD_RATE)}</p>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-neutral-400">Fragments Owned</span>
                <span className="font-medium text-neutral-200">{asset.ownedFragments || 0} / {asset.totalFragments}</span>
              </div>
              <div className="w-full bg-neutral-700/50 rounded-full h-1.5">
                <div
                  className="bg-red-500 h-1.5 rounded-full"
                  style={{ width: `${ownershipPercentage}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="border-t border-neutral-800 bg-black/30 p-2 backdrop-blur-sm transition-colors duration-300 group-hover:bg-neutral-800/30">
            <div className="w-full text-sm font-bold text-white flex items-center justify-between">
              <span>View Asset</span>
              <IconChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 