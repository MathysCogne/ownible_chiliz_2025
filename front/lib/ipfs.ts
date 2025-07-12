import { PinataSDK } from "pinata-web3";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.PINATA_GATEWAY!,
});

export async function uploadImageToIPFS(file: File): Promise<string> {
  try {
    const upload = await pinata.upload.file(file);
    return `https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}`;
  } catch (error) {
    console.error('IPFS image upload error:', error);
    throw error;
  }
}

export async function uploadMetadataToIPFS(metadata: AssetMetadata): Promise<string> {
  try {
    const upload = await pinata.upload.json(metadata);
    return `https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}`;
  } catch (error) {
    console.error('IPFS metadata upload error:', error);
    throw error;
  }
}

export interface AssetMetadata {
  name: string;
  description: string;
  image: string;
  category: string;
  valuation: string;
  totalFragments: number;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
}

export function createAssetMetadata(
  name: string,
  description: string,
  imageUrl: string,
  category: string,
  valuation: string,
  totalFragments: number,
  additionalAttributes: Array<{trait_type: string; value: string | number}> = []
): AssetMetadata {
  return {
    name,
    description,
    image: imageUrl,
    category,
    valuation,
    totalFragments,
    attributes: [
      { trait_type: "Category", value: category },
      { trait_type: "Valuation", value: valuation },
      { trait_type: "Total Fragments", value: totalFragments },
      { trait_type: "Type", value: "Real World Asset" },
      ...additionalAttributes
    ]
  };
}