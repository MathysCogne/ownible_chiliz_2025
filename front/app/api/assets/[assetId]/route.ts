import { NextRequest, NextResponse } from 'next/server';
import { getContractInstance } from '@/lib/contract';
import { createPublicClient, http } from 'viem';
import { spicyTestnet } from '@/lib/wagmi';
import { CONTRACT_ADDRESS } from '@/lib/contract';

export async function GET(
  request: NextRequest,
  { params }: { params: { assetId?: string } }
) {
  try {
    const { assetId } = await params;

    if (!assetId) {
      return NextResponse.json({ error: 'Asset ID is required' }, { status: 400 });
    }

    const contract = getContractInstance();
    const publicClient = createPublicClient({
      chain: spicyTestnet,
      transport: http('https://spicy-rpc.chiliz.com'),
    });

    const asset = await contract.read.assets([BigInt(assetId)]);
    
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
        assetId: BigInt(assetId)
      },
      fromBlock: 'earliest',
      toBlock: 'latest'
    });

    const uniqueAddresses = [...new Set(events.map(event => event.args.buyer))];
    const owners = [];

    for (const address of uniqueAddresses) {
      if (address) {
        try {
          const balance = await contract.read.getFragmentBalance([
            BigInt(assetId),
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

    owners.sort((a, b) => BigInt(b.balance) > BigInt(a.balance) ? 1 : -1);

    const assetWithOwners = {
      id: assetId,
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
    };

    return NextResponse.json({ asset: assetWithOwners });
  } catch (error) {
    console.error(`Asset fetch error:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 