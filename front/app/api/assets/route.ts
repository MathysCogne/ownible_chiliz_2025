import { NextResponse } from 'next/server';
import { getContractInstance } from '@/lib/contract';

export async function GET() {
  try {
    const contract = getContractInstance();
    const assetCount = await contract.read.getAssetCount();
    const assets = [];
    
    // Fix: Commence à 1, pas 0
    for (let i = 1; i <= Number(assetCount); i++) {
      try {
        const asset = await contract.read.assets([BigInt(i)]);
        assets.push({
          id: i,
          name: asset[0],
          category: asset[1],
          valuation: asset[2].toString(),
          totalFragments: asset[3].toString(),
          remainingFragments: asset[6].toString(), // Fix: index 6, pas 4
          isNFT: asset[4],
          isTransferable: asset[5],
          owner: asset[7],
          metadataURI: asset[8], // IPFS metadata URI
          imageURI: asset[9]     // IPFS image URI
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