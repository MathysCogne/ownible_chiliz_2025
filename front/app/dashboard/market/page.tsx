"use client"

import { useState, useEffect, Suspense, useMemo } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { CollectibleCard } from "@/components/collectible-card"
import { MarketStats } from "@/components/market-stats"
import { AnimatePresence, motion } from "framer-motion"
import { 
  IconCategory, 
  IconBallFootball,
  IconDeviceGamepad2,
  IconMusic,
  IconHome
} from "@tabler/icons-react"
import { Asset } from "@/lib/types" // Import the new Asset type
import { Skeleton } from "@/components/ui/skeleton"
import { getAssetTypeFromCategory } from "@/lib/utils"

const assetTypes = [
  { name: "All", icon: IconCategory },
  { name: "Sport", icon: IconBallFootball },
  { name: "E-Sport", icon: IconDeviceGamepad2 },
  { name: "Music", icon: IconMusic },
  { name: "Real Estate", icon: IconHome },
];

function MarketView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") || "All"
  const [filter, setFilter] = useState(initialCategory)
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/assets/with-owners")
        if (!response.ok) {
          throw new Error("Failed to fetch assets")
        }
        const data = await response.json()
        
        // The API returns assets, but the UI needs some extra fields like price, change, volume24h
        // We will need to either add this to the API or calculate it here.
        // For now, let's use valuation as price and add dummy data for the rest.
        const processedAssets = data.assets.map((asset: Omit<Asset, 'price'>) => ({
          ...asset,
          price: (parseFloat(asset.valuation) / 10**18) / parseFloat(asset.totalFragments),
          type: getAssetTypeFromCategory(asset.category), // using category to derive type
          change: Math.random() * 10 - 5, // DUMMY DATA
          volume24h: Math.random() * 100000, // DUMMY DATA
          ownedFragments: Number(asset.totalFragments) - Number(asset.remainingFragments),
        }));
        
        setAssets(processedAssets)
        setError(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchAssets()
  }, [])

  useEffect(() => {
    setFilter(initialCategory)
  }, [initialCategory])

  const handleFilterChange = (value: string) => {
    if (value) {
      setFilter(value);
      const params = new URLSearchParams(searchParams);
      if (value === 'All') {
        params.delete('category');
      } else {
        params.set('category', value);
      }
      const queryString = params.toString();
      router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
    }
  };

  const filteredAssets =
    filter === "All"
      ? assets
      : assets.filter((asset) => asset.type === filter)

  const pageTitle = filter === 'All' ? 'Explore Market' : `Explore ${filter} Assets`;
  
  const categoryDescriptions: { [key: string]: string } = {
    All: "Explore a new era of investing. From music rights to sports memorabilia, every asset on our platform represents a verifiable, tokenized piece of the real world. Connect your wallet in seconds and start building your collection.",
    Sport: "Own a piece of sporting history. Invest in player shares, iconic memorabilia, or exclusive event access. Your passion, your asset. Join a community of fans and investors.",
    'E-Sport': "Enter the digital arena as an owner. Invest in player contracts, team revenues, and prize pools. Be more than a fan—be part of the booming e-sport economy with verifiable ownership.",
    Music: "Invest directly in the music you love. Purchase fractional ownership of song rights, earn from royalties, and share in the success of your favorite artists. True ownership, powered by the blockchain.",
    'Real Estate': "Access the property market, tokenized. Invest in fractional ownership of high-value real estate. A tangible stake in a stable market, made accessible through our secure, decentralized platform."
  };

  const pageDescription = categoryDescriptions[filter] || 'Find the next asset to add to your collection.';

  const totalMarketCap = useMemo(() => assets.reduce((acc, asset) => acc + asset.price, 0), [assets]);

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-2 p-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">{pageTitle}</h1>
        <p className="text-neutral-400">{pageDescription}</p>
      </div>

      <div className="border-y border-neutral-800 bg-neutral-950/30 px-8 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <motion.div
            key={filter}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-grow"
          >
            <MarketStats assets={filteredAssets} totalMarketCap={totalMarketCap} isAllCategory={filter === 'All'} />
          </motion.div>

          <div className="flex-shrink-0">
            <ToggleGroup
              type="single"
              value={filter}
              onValueChange={handleFilterChange}
              className="justify-start gap-2"
            >
              {assetTypes.map(({ name, icon: Icon }) => (
                <ToggleGroupItem
                  key={name}
                  value={name}
                  className="flex items-center gap-2 rounded-lg bg-neutral-900/80 px-4 py-2 text-sm font-bold text-neutral-300 border-2 border-neutral-800 transition-all duration-300 hover:border-red-500/80 hover:text-white data-[state=on]:bg-red-600 data-[state=on]:text-white data-[state=on]:border-red-500 data-[state=on]:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                  aria-label={`Filter by ${name}`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="hidden lg:inline">{name}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
      </div>
      
      <div className="p-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-[300px] w-full rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="mt-16 flex flex-col items-center justify-center gap-4 text-center text-red-500">
            <h3 className="text-xl font-bold">Error</h3>
            <p>{error}</p>
          </div>
        ) : filteredAssets.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            <AnimatePresence>
              {filteredAssets.map((asset) => (
                <motion.div
                  key={asset.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <CollectibleCard asset={asset} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-full border-4 border-neutral-700 bg-neutral-900 p-3">
                <IconCategory className="h-8 w-8 text-neutral-500" />
              </div>
              <h3 className="text-xl font-bold text-white">No Assets Found</h3>
              <p className="max-w-xs text-neutral-400">There are no assets currently available in the &quot;{filter}&quot; category. Try selecting another one.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MarketPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MarketView />
    </Suspense>
  )
} 