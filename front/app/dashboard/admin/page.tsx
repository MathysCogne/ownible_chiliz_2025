'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function AdminPage() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [valuation, setValuation] = useState('');
  const [totalFragments, setTotalFragments] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [isNFT, setIsNFT] = useState(false);
  const [isTransferable, setIsTransferable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !name || !category || !valuation || !totalFragments) {
      toast.error('Please fill all fields and select an image.');
      return;
    }

    setIsSubmitting(true);
    toast.info('Uploading asset to IPFS...');

    try {
      // Step 1: Upload to IPFS via our API route
      const formData = new FormData();
      formData.append('name', name);
      formData.append('category', category);
      formData.append('image', image);

      const uploadResponse = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload to IPFS.');
      }

      const { metadataUri, imageUri } = await uploadResponse.json();
      toast.success('Asset uploaded to IPFS! Creating asset on-chain...');

      // Step 2: Call the new backend route to create the asset
      const createAssetResponse = await fetch('/api/admin/create-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          valuation,
          totalFragments,
          isNFT,
          isTransferable,
          metadataUri,
          imageUri,
        }),
      });

      if (!createAssetResponse.ok) {
        const errorData = await createAssetResponse.json();
        throw new Error(errorData.error || 'Failed to create asset on-chain.');
      }

      const { txHash } = await createAssetResponse.json();

      toast.success('Transaction submitted!', {
        description: 'Your asset is being created on the blockchain.',
        action: {
          label: 'View Tx',
          onClick: () => window.open(`https://testnet.chiliscan.com/tx/${txHash}`, '_blank'),
        },
      });

      // Reset form
      setName('');
      setCategory('');
      setValuation('');
      setTotalFragments('');
      setImage(null);
      setIsNFT(false);
      setIsTransferable(true);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error('Asset Creation Failed', { description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Create New RWA</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-neutral-900/50 p-8 rounded-lg border border-neutral-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Asset Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., ZywOo Player Shares" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Player Shares" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="valuation">Total Valuation (in CHZ)</Label>
            <Input id="valuation" type="number" value={valuation} onChange={(e) => setValuation(e.target.value)} placeholder="e.g., 10000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalFragments">Total Fragments</Label>
            <Input id="totalFragments" type="number" value={totalFragments} onChange={(e) => setTotalFragments(e.target.value)} placeholder="e.g., 1000" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="image">Asset Image</Label>
          <Input id="image" type="file" onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} accept="image/*" className="file:text-white" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch id="is-transferable" checked={isTransferable} onCheckedChange={setIsTransferable} />
            <Label htmlFor="is-transferable">Is Transferable?</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="is-nft" checked={isNFT} onCheckedChange={setIsNFT} />
            <Label htmlFor="is-nft">Is a single NFT?</Label>
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating Asset...' : 'Create Asset'}
        </Button>
      </form>
    </div>
  );
} 