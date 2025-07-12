import { NextResponse } from 'next/server';
import { getContractInstance } from '@/lib/contract';
import { createPublicClient, http } from 'viem';
import { spicyTestnet } from '@/lib/wagmi';
import { CONTRACT_ADDRESS } from '@/lib/contract';

export async function GET() {
  try {
    const contract = getContractInstance();
    const publicClient = createPublicClient({
      chain: spicyTestnet,
      transport: http('https://spicy-rpc.chiliz.com'),
    });

    const assetCount = await contract.read.getAssetCount();
    const assetsWithOwners = [];

    for (let i = 1; i <= Number(assetCount); i++) {
      try {
        const asset = await contract.read.assets([BigInt(i)]);
        
        // Get all FragmentsPurchased events for this asset
        const events = await publicClient.getLogs({
          address: CONTRACT_ADDRESS,
          event: {
            type: 'event',
            name: 'FragmentsPurchased',
            inputs: [
              { name: 'assetId', type: 'uint256', indexed: true },
              { name: 'buyer', type: 'address', indexed: true },
              { name: 'amount', type: 'uint256', indexed: false }
            ]
          },
          args: {
            assetId: BigInt(i)
          },
          fromBlock: 'earliest',
          toBlock: 'latest'
        });

        // Get unique addresses that have purchased fragments
        const uniqueAddresses = [...new Set(events.map(event => event.args.buyer))];
        const owners = [];

        for (const address of uniqueAddresses) {
          if (address) {
            try {
              const balance = await contract.read.getFragmentBalance([
                BigInt(i),
                address as `0x${string}`
              ]);
              
              if (balance > 0) {
                owners.push({
                  address,
                  balance: balance.toString(),
                  percentage: ((Number(balance) / Number(asset[3])) * 100).toFixed(2)
                });
              }
            } catch (error) {
              console.error(`Error fetching balance for ${address}:`, error);
            }
          }
        }

        // Sort owners by balance (highest first)
        owners.sort((a, b) => BigInt(b.balance) > BigInt(a.balance) ? 1 : -1);

        assetsWithOwners.push({
          id: i,
          name: asset[0],
          category: asset[1],
          valuation: asset[2].toString(),
          totalFragments: asset[3].toString(),
          remainingFragments: asset[6].toString(),
          isNFT: asset[4],
          isTransferable: asset[5],
          owner: asset[7],
          metadataURI: asset[8],
          imageURI: asset[9],
          fragmentOwners: owners,
          totalOwners: owners.length,
          distributionPercentage: owners.length > 0 ? 
            ((Number(asset[3]) - Number(asset[6])) / Number(asset[3]) * 100).toFixed(2) : '0'
        });
      } catch (error) {
        console.error(`Error fetching asset ${i} with owners:`, error);
      }
    }

    return NextResponse.json({ assets: assetsWithOwners });
  } catch (error) {
    console.error('Assets with owners fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets with owners' },
      { status: 500 }
    );
  }
}