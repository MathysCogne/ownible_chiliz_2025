import { portfolioAssets } from '@/lib/mock-data';
import { CollectibleCard } from '@/components/collectible-card';
import { Badge } from '@/components/ui/badge';

export default function PortfolioPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-white">Your Collection</h1>
        <p className="text-neutral-400">Your personal trophy room.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {portfolioAssets.map((asset) => (
          <div key={asset.id} className="relative">
            <CollectibleCard asset={asset} />
            <Badge
              className="absolute -right-2 -top-2 rounded-full px-2 py-0.5 text-xs font-bold bg-neutral-700 text-neutral-200 border-2 border-neutral-950"
            >
              x{asset.quantity}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
} 