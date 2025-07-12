import { NextResponse } from 'next/server';
import { getContractInstance } from '@/lib/contract';

export async function GET() {
  try {
    const contract = getContractInstance();
    
    // Try to get stats, but fallback to individual calls if getContractStats doesn't exist
    try {
      const stats = await contract.read.getContractStats();
      return NextResponse.json({
        totalAssets: stats[0].toString(),
        activeAssets: stats[1].toString(),
        totalOwnerships: stats[2].toString(),
      });
    } catch (statsError) {
      console.log('getContractStats failed, trying individual calls:', statsError);
      
      // Fallback to individual function calls
      const assetCount = await contract.read.getAssetCount();
      
      return NextResponse.json({
        totalAssets: assetCount.toString(),
        activeAssets: "0", // We'll calculate this when we have assets
        totalOwnerships: "0", // We'll calculate this when we have assets
        note: "Using fallback method - getContractStats function may not be available"
      });
    }
  } catch (error) {
    console.error('Contract stats error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch contract stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}