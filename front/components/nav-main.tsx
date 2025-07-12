"use client"

import { type Icon } from '@tabler/icons-react';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function NavMain({
  items,
  isCollapsed,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
  isCollapsed?: boolean;
}) {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {items.map((item) => {
        const isActive = pathname === item.url;

        const buttonContent = (
          <SidebarMenuButton
            className={cn(
              'w-full rounded-lg p-3 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white',
              isActive && 'bg-neutral-800 text-white',
              isCollapsed ? 'justify-center' : 'justify-start px-4'
            )}
          >
            {item.icon && <item.icon className="size-5 shrink-0" />}
            {!isCollapsed && <span className="ml-4 text-base">{item.title}</span>}
          </SidebarMenuButton>
        );

        return (
          <SidebarMenuItem key={item.title} className="px-2 py-1">
            <Link href={item.url} passHref>
              {isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
                  <TooltipContent side="right">{item.title}</TooltipContent>
                </Tooltip>
              ) : (
                buttonContent
              )}
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
