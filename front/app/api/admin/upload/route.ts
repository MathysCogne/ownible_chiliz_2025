import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const image = data.get('image') as File | null;
    const name = data.get('name') as string;
    const category = data.get('category') as string;

    if (!image || !name || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Upload Image to Pinata
    const imageFormData = new FormData();
    imageFormData.append('file', image, image.name);
    
    const imageUploadRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PINATA_JWT}`,
      },
      body: imageFormData,
    });

    if (!imageUploadRes.ok) {
      const errorBody = await imageUploadRes.text();
      console.error('Pinata image upload error:', errorBody);
      return NextResponse.json({ error: 'Failed to upload image to IPFS', details: errorBody }, { status: 500 });
    }
    
    const imageData = await imageUploadRes.json();
    const imageUri = `ipfs://${imageData.IpfsHash}`;

    // 2. Create and Upload Metadata JSON to Pinata
    const metadata = {
      name: name,
      description: `A collectible asset from the ${category} category.`,
      image: imageUri,
      attributes: [
        {
          trait_type: 'Category',
          value: category,
        },
      ],
    };

    const metadataUploadRes = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PINATA_JWT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: { name: `${name}-metadata.json` },
      }),
    });

    if (!metadataUploadRes.ok) {
        const errorBody = await metadataUploadRes.text();
        console.error('Pinata metadata upload error:', errorBody);
        return NextResponse.json({ error: 'Failed to upload metadata to IPFS', details: errorBody }, { status: 500 });
    }

    const metadataData = await metadataUploadRes.json();
    const metadataUri = `ipfs://${metadataData.IpfsHash}`;

    // 3. Return both URIs to the frontend
    return NextResponse.json({ metadataUri, imageUri });

  } catch (error) {
    console.error('Upload API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
} 