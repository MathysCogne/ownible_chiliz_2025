import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.PINATA_GATEWAY!,
});

// Upload image to IPFS
export async function uploadImageToIPFS(image: File | string): Promise<string> {
  try {
    let result;
    
    if (typeof image === 'string') {
      // Handle base64 string - make direct API call
      const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
      
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PINATA_JWT}`,
        },
        body: JSON.stringify({
          pinataContent: {
            data: base64Data,
            type: 'base64'
          },
          pinataMetadata: {
            name: 'uploaded-image'
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Pinata API error: ${response.statusText}`);
      }
      
      result = await response.json();
    } else {
      // Handle File object
      const formData = new FormData();
      formData.append('file', image);
      formData.append('pinataMetadata', JSON.stringify({
        name: 'uploaded-file'
      }));
      
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PINATA_JWT}`,
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Pinata API error: ${response.statusText}`);
      }
      
      result = await response.json();
    }
    
    return `ipfs://${result.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading image to IPFS:', error);
    throw new Error('Failed to upload image to IPFS');
  }
}

// Upload metadata to IPFS
export async function uploadMetadataToIPFS(metadata: any): Promise<string> {
  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PINATA_JWT}`,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: 'asset-metadata'
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Pinata API error: ${response.statusText}`);
    }
    
    const result = await response.json();
    return `ipfs://${result.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    throw new Error('Failed to upload metadata to IPFS');
  }
}

// Create asset metadata structure
export function createAssetMetadata(
  name: string,
  description: string,
  imageUrl: string,
  category: string,
  valuation: string,
  totalFragments: number
) {
  return {
    name,
    description,
    image: imageUrl,
    attributes: [
      {
        trait_type: "Category",
        value: category
      },
      {
        trait_type: "Valuation",
        value: valuation
      },
      {
        trait_type: "Total Fragments",
        value: totalFragments
      }
    ],
    external_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ownible.com'}`,
    background_color: "000000"
  };
}

export { pinata };