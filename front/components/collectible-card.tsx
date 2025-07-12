import Image from 'next/image';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Asset } from '@/lib/mock-data';
import { IconArrowRight, IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';

interface CollectibleCardProps {
  asset: Asset;
}

export function CollectibleCard({ asset }: CollectibleCardProps) {
  const Icon = asset.change >= 0 ? IconTrendingUp : IconTrendingDown;
  const priceChangeColor = asset.change >= 0 ? 'text-green-500' : 'text-red-500';

  return (
    <Card
      className='group flex h-full flex-col overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 transition-all duration-300 hover:border-neutral-700'
    >
      <div className="relative h-40 w-full">
        <Image
          src={`https://source.unsplash.com/random/400x300?${asset.type}&sig=${asset.id}`}
          alt={asset.name}
          fill
          className="object-cover"
        />
      </div>
      <CardHeader className="flex-grow p-3">
        <CardTitle className="text-sm font-semibold text-neutral-200">{asset.name}</CardTitle>
        <CardDescription className="text-xs text-neutral-400">{asset.category}</CardDescription>
      </CardHeader>
      <CardFooter className="flex flex-col items-start gap-2 p-3">
        <div className="flex w-full items-center justify-between text-xs">
          <div className="flex flex-col">
            <span className="text-neutral-400">Price</span>
            <span className="font-bold text-white">${asset.price.toFixed(2)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-neutral-400">24h Change</span>
            <div className={cn('flex items-center gap-1 font-semibold', priceChangeColor)}>
              <Icon className="h-3 w-3" />
              <span>{asset.change.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
} 