'use client';

import * as React from 'react';
import { IconCompass, IconBuildingStore, IconWallet, IconSettings } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

import { NavMain } from '@/components/nav-main';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';

const navMain = [
  {
    title: 'Discover',
    url: '/dashboard',
    icon: IconCompass,
  },
  {
    title: 'Market',
    url: '/dashboard/market',
    icon: IconBuildingStore,
  },
  {
    title: 'Portfolio',
    url: '/dashboard/portfolio',
    icon: IconWallet,
  },
  {
    title: 'Admin',
    url: '/dashboard/admin',
    icon: IconSettings,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setOpen, state } = useSidebar();

  const onMouseEnter = () => setOpen(true);
  const onMouseLeave = () => setOpen(false);

  return (
    <Sidebar
      collapsible="icon"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...props}
      className="hidden border-r border-neutral-800 bg-neutral-950 lg:flex"
    >
      <SidebarHeader
        className={cn(
          'flex h-16 flex-row items-center gap-0',
          state === 'expanded' ? 'justify-start px-4' : 'justify-center'
        )}
      >
        <Image src="/logo.png" width={42} height={42} alt="Logo" className="size-8" />
        <span
          className={cn(
            'ml-3 text-lg font-semibold',
            state !== 'expanded' && 'hidden'
          )}
        >
          Ownible
        </span>
      </SidebarHeader>

      <SidebarContent className="flex-1">
        <NavMain items={navMain} isCollapsed={state === 'collapsed'} />
      </SidebarContent>
    </Sidebar>
  );
}
