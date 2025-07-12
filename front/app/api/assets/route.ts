import { NextResponse } from 'next/server';
import { getContractInstance } from '@/lib/contract';

export async function GET() {
  try {
    const contract = getContractInstance();
    const assetCount = await contract.read.getAssetCount();
    const assets = [];
    
    for (let i = 0; i < Number(assetCount); i++) {
      try {
        const asset = await contract.read.assets([BigInt(i)]);
        assets.push({
          id: i,
          name: asset[0],
          category: asset[1],
          valuation: asset[2].toString(),
          totalFragments: asset[3].toString(),
          remainingFragments: asset[4].toString(),
          isNFT: asset[5],
          isTransferable: asset[6],
          issuer: asset[7],
        });
      } catch (error) {
        console.error(`Error fetching asset ${i}:`, error);
      }
    }
    
    return NextResponse.json({ assets });
  } catch (error) {
    console.error('Assets fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}