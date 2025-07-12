'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { useRouter } from 'next/navigation';
import { type Connector } from 'wagmi';

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const router = useRouter();

  const handleConnect = (connector: Connector) => {
    connect({ connector, chainId: 88882 });
  };

  if (isConnected) {
    router.push('/dashboard');
    return (
      <div className="flex items-center gap-4">
        <p className="text-white">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
        <Button onClick={() => disconnect()} variant="outline">
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button
          className="bg-white text-black font-bold py-3 px-8 rounded-lg hover:bg-gray-200 transition-colors fade-in"
          style={{ animationDelay: '2.2s', opacity: 0, animationFillMode: 'forwards' }}
        >
          Connect Wallet
        </button>
      </DrawerTrigger>
      <DrawerContent className="bg-black/80 backdrop-blur-md border-neutral-800 text-white">
        <div className="mx-auto w-full max-w-sm text-center">
          <DrawerHeader>
            <DrawerTitle>Connect your wallet</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <div className="flex flex-col space-y-2">
              {connectors.map((connector) => (
                <Button
                  key={connector.uid}
                  onClick={() => handleConnect(connector)}
                  variant="outline"
                  className="bg-transparent border-neutral-700 hover:bg-neutral-800 hover:text-white"
                >
                  {connector.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
} 