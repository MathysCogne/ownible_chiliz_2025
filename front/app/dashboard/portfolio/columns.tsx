'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { IconArrowUpRight, IconPepper } from '@tabler/icons-react';
import { PortfolioAsset } from '@/lib/types';
import { formatChz, formatUsd, CHZ_TO_USD_RATE } from '@/lib/utils';

export const columns: ColumnDef<PortfolioAsset>[] = [
  {
    accessorKey: 'name',
    header: 'RWA',
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-white">{row.original.name}</div>
        <div className="text-xs text-neutral-400">{row.original.category}</div>
      </div>
    ),
  },
  {
    accessorKey: 'quantity',
    header: () => <div className="text-right">Quantity</div>,
    cell: ({ row }) => (
      <div className="text-right font-mono">{row.original.quantity}</div>
    ),
  },
  {
    id: 'projectedYield',
    header: () => <div className="text-right">Projected Yield</div>,
    cell: ({ row }) => {
      return <div className="text-right font-mono text-green-400">{row.original.projectedYield?.toFixed(2) || 'N/A'}%</div>;
    },
  },
  {
    accessorKey: 'currentValue',
    header: () => <div className="text-right">Holdings Value</div>,
    cell: ({ row }) => {
      const valueInChz = (row.original.price || 0) * (row.original.quantity || 0);
      const valueInUsd = valueInChz * CHZ_TO_USD_RATE;
      return (
        <div className="text-right">
          <div className="font-semibold text-white">{formatUsd(valueInUsd)}</div>
          <div className="flex items-center justify-end gap-1 text-xs text-neutral-400">
            {formatChz(valueInChz)} <IconPepper className="size-3 text-red-500" />
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'ownership',
    header: () => <div className="text-right">Ownership</div>,
    cell: ({ row }) => {
      const ownership = ((row.original.quantity || 0) / parseFloat(row.original.totalFragments)) * 100;
      return <div className="text-right font-mono text-green-400">{ownership.toFixed(2)}%</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="text-right">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/dashboard/market/${row.original.id}`}>
            View
            <IconArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    ),
  },
]; 