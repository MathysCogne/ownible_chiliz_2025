'use client';

import { useAccount, useDisconnect, useBalance } from 'wagmi';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';
import { IconPower, IconSearch, IconWallet, IconPepper } from '@tabler/icons-react';
import { Input } from '@/components/ui/input';
import { useMounted } from '@/hooks/use-mounted';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function SiteHeader() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance, isLoading } = useBalance({
    address,
  });
  const isMounted = useMounted();

  const renderWalletButtonContent = () => {
    if (isLoading) {
      return (
        <span className="text-neutral-400">Loading...</span>
      );
    }
    if (balance) {
      return (
        <div className="flex items-center font-semibold">
          {parseFloat(balance.formatted).toFixed(2)}
          <span className="text-neutral-400 ml-1.5 mr-1.5">{balance.symbol}</span>
          <IconPepper className="size-4 text-red-500" />
        </div>
      );
    }
    // Fallback to address if balance is not available
    return (
      <>
        <IconWallet className="mr-2 h-4 w-4" />
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </>
    );
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-neutral-800 bg-neutral-950 px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard" className="text-lg font-semibold text-white flex items-center gap-2">
          Ownible
        </Link>
      </div>

      <div className="flex flex-1 items-center gap-4">
        <div className="relative ml-auto flex-1 md:grow-0">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
          <Input
            type="search"
            placeholder="Search collections and accounts"
            className="w-full rounded-lg bg-neutral-900 pl-8 md:w-[200px] lg:w-[336px] border-neutral-800 focus:border-red-500/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isMounted ? (
          <Button variant="ghost" className="text-neutral-300 hover:bg-neutral-800 hover:text-white h-9 w-36 animate-pulse bg-neutral-800/50" />
        ) : isConnected ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-neutral-300 hover:bg-neutral-800 hover:text-white">
                {renderWalletButtonContent()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 bg-neutral-900 border-neutral-800 text-neutral-200"
            >
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Wallet</p>
                  <p className="text-xs leading-none text-neutral-400">{address}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-neutral-800" />
              <DropdownMenuItem className="cursor-pointer focus:bg-neutral-800 focus:text-white flex justify-between">
                <span>Balance</span>
                <span>
                  {balance
                    ? `${parseFloat(balance.formatted).toFixed(2)} ${balance.symbol}`
                    : 'Loading...'}
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-neutral-800" />
              <DropdownMenuItem
                onClick={() => disconnect()}
                className="cursor-pointer focus:bg-neutral-800 focus:text-white"
              >
                <IconPower className="mr-2 h-4 w-4" />
                <span>Disconnect</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button className="bg-red-600 text-white hover:bg-red-700">
            <IconWallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        )}
      </div>
    </header>
  );
}
