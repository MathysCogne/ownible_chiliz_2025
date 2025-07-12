import { NextResponse } from "next/server"
import { createPublicClient, formatEther, http } from "viem"

import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/lib/contract"
import { spicyTestnet } from "@/lib/wagmi"

const publicClient = createPublicClient({
  chain: spicyTestnet,
  transport: http(),
})

export async function GET() {
  try {
    const contract = {
      read: {
        getAssetCount: () =>
          publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "getAssetCount",
          }),
        assets: (args: [bigint]) =>
          publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "assets",
            args,
          }),
        getFragmentInfo: (args: [bigint]) =>
          publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "getFragmentInfo",
            args,
          }),
      },
    }

    const assetCount = await contract.read.getAssetCount()
    const assets = []

    for (let i = 1; i <= Number(assetCount); i++) {
      try {
        const asset = await contract.read.assets([BigInt(i)])
        const fragmentInfo = await contract.read.getFragmentInfo([BigInt(i)])

        assets.push({
          id: i,
          name: asset[0],
          category: asset[1],
          valuation: formatEther(asset[2]),
          totalFragments: asset[3].toString(),
          remainingFragments: asset[4].toString(),
          isNFT: asset[5],
          isTransferable: asset[6],
          issuer: asset[7],
          fragmentInfo: {
            totalSupply: fragmentInfo[0].toString(),
            availableSupply: fragmentInfo[1].toString(),
            pricePerUnit: formatEther(fragmentInfo[2]),
            isActive: fragmentInfo[3],
          },
        })
      } catch (error) {
        console.error(`Error fetching asset ${i}:`, error)
      }
    }

    return NextResponse.json({ assets })
  } catch (error) {
    console.error("Assets fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 }
    )
  }
}