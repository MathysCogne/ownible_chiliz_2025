"use client"

import { useState } from "react"
import { assets } from "@/lib/mock-data"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { CollectibleCard } from "@/components/collectible-card"

const assetTypes = ["All", "E-Sport", "Music", "Merch", "Real Estate"]

export default function MarketPage() {
  const [filter, setFilter] = useState("All")

  const filteredAssets =
    filter === "All"
      ? assets
      : assets.filter((asset) => asset.type === filter)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-white">Explore Market</h1>
        <p className="text-neutral-400">
          Find the next asset to add to your collection.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <ToggleGroup
          type="single"
          defaultValue="All"
          onValueChange={(value) => value && setFilter(value)}
          className="justify-start gap-2"
        >
          {assetTypes.map((type) => (
            <ToggleGroupItem
              key={type}
              value={type}
              className="rounded-md bg-neutral-900 px-3 py-1 text-sm text-neutral-400 border border-neutral-800 hover:text-white data-[state=on]:bg-neutral-800 data-[state=on]:text-white"
            >
              {type}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filteredAssets.map((asset) => (
          <CollectibleCard key={asset.id} asset={asset} />
        ))}
      </div>
    </div>
  );
} 