import Image from "next/image"
import Link from "next/link"
import { useMemo } from "react"
import {
  IconBallFootball,
  IconDeviceGamepad2,
  IconHome,
  IconInfoCircle,
  IconMusic,
  IconPigMoney,
  IconScale,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react"
import { IconPepper } from "@tabler/icons-react"
import { Asset } from "@/lib/types"
import { CHZ_TO_USD_RATE, cn, formatChz, formatIpfsUrl, formatUsd } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CollectibleCardProps {
  asset: Asset
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
  const isPositiveChange = asset.change && asset.change >= 0
  const ChangeIcon = isPositiveChange ? IconTrendingUp : IconTrendingDown
  const priceChangeColor = isPositiveChange ? "text-green-400" : "text-red-400"
  const AssetIcon = getAssetIcon(asset.type)

  // DUMMY DATA for new fields
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const projectedYield = useMemo(() => (Math.random() * 5 + 2).toFixed(2), [asset.id]) // e.g., 2.00% to 7.00%
  const assetValuation = parseFloat(asset.valuation) / 10 ** 18

  const ownedFragments = asset.ownedFragments || 0
  const totalFragments = Number(asset.totalFragments)
  const ownershipPercentage = totalFragments > 0 ? (ownedFragments / totalFragments) * 100 : 0

  return (
    <TooltipProvider>
      <Link href={`/dashboard/market/${asset.id}`} className="block h-full">
        <div className="group relative flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-xl border-2 border-neutral-800 bg-neutral-900/80 transition-all duration-300 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10">
          <div className="absolute inset-0 z-0">
            <Image
              src={formatIpfsUrl(asset.imageURI)}
              alt={asset.name}
              fill
              className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/80 to-black/20 transition-colors duration-300" />
          </div>

          <div className="relative z-10 flex h-full flex-col justify-between p-4 text-white">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-neutral-700 bg-black/50 backdrop-blur-sm">
                  <AssetIcon className="h-6 w-6 text-red-500" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-bold tracking-tight text-white">{asset.name}</h3>
                  <p className="text-sm text-neutral-400">{asset.category}</p>
                </div>
              </div>
              <div
                className={cn(
                  "flex flex-shrink-0 items-center gap-1.5 rounded-full border border-neutral-700 bg-black/50 px-2 py-1 text-xs font-bold",
                  priceChangeColor
                )}
              >
                <ChangeIcon size={14} />
                <span>{asset.change ? asset.change.toFixed(1) : "N/A"}%</span>
              </div>
            </div>

            {/* Financials */}
            <div className="space-y-3">
              {/* Price */}
              <div className="space-y-1">
                <span className="text-xs text-neutral-400">Price per Fragment</span>
                <p className="text-3xl font-bold tracking-tighter text-white">{formatUsd(asset.price * CHZ_TO_USD_RATE)}</p>
                <p className="flex items-center gap-1 text-sm text-neutral-400">
                  {formatChz(asset.price)} <IconPepper className="size-4 text-red-500" />
                </p>
              </div>

              <Separator className="bg-neutral-700" />

              {/* Stats & Ownership */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="flex items-center gap-1 text-xs text-neutral-400">
                      <IconPigMoney size={14} />
                      Projected Yield
                    </span>
                    <p className="font-bold text-green-400">{projectedYield}%</p>
                  </div>
                  <div>
                    <span className="flex items-center gap-1 text-xs text-neutral-400">
                      <IconScale size={14} />
                      Valuation
                    </span>
                    <p className="font-bold">{formatChz(assetValuation)}</p>
                  </div>
                </div>

                {/* Ownership */}
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 font-medium text-neutral-300">
                      Ownership Minted
                      <Tooltip>
                        <TooltipTrigger>
                          <IconInfoCircle size={14} className="text-neutral-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Own a fraction of the asset and participate in its potential revenue.</p>
                        </TooltipContent>
                      </Tooltip>
                    </span>
                    <span className="font-bold text-white">
                      {ownedFragments} / {totalFragments}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-neutral-700/50">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
                      style={{ width: `${ownershipPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </TooltipProvider>
  )
} 