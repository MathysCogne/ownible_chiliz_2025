"use client"

import { useState, useEffect, Suspense, useMemo } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { assets } from "@/lib/mock-data"
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
    All: "Explore a curated selection of Real World Assets (RWA). From iconic sports memorabilia to fractional ownership of music rights, each asset represents a verifiable, tokenized piece of the real world.",
    Sport: "Invest in the world of sports. These assets represent tangible value, from shares in player earnings to exclusive event access, all backed by real-world performance.",
    'E-Sport': "Dive into the digital arena with tangible assets. Own a piece of the action, from player contracts to team revenues, and be part of the booming e-sport economy.",
    Music: "Own the sound. These assets grant you fractional ownership of music rights, allowing you to earn from royalties and share in the success of your favorite artists.",
    'Real Estate': "Access the property market like never before. These assets represent fractional ownership of real-world properties, offering a tangible stake in valuable real estate."
  };

  const pageDescription = categoryDescriptions[filter] || 'Find the next asset to add to your collection.';

  const totalMarketCap = useMemo(() => assets.reduce((acc, asset) => acc + asset.price, 0), []);

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
        {filteredAssets.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredAssets.map((asset) => (
              <CollectibleCard key={asset.id} asset={asset} />
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-full border-4 border-neutral-700 bg-neutral-900 p-3">
                <IconCategory className="h-8 w-8 text-neutral-500" />
              </div>
              <h3 className="text-xl font-bold text-white">No Assets Found</h3>
              <p className="max-w-xs text-neutral-400">There are no assets currently available in the "{filter}" category. Try selecting another one.</p>
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