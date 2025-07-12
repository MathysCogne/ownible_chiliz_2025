import { NextResponse } from 'next/server';
import { getContractInstance } from '@/lib/contract';

export async function GET() {
  try {
    const contract = getContractInstance();
    
    // Test basic contract functions that should work
    const admin = await contract.read.admin();
    const baseURI = await contract.read.baseURI();
    const assetCount = await contract.read.getAssetCount();
    
    return NextResponse.json({
      contractAddress: contract.address,
      admin,
      baseURI,
      assetCount: assetCount.toString(),
      status: 'connected'
    });
  } catch (error) {
    console.error('Contract info error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch contract info', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}