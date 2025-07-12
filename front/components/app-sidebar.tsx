"use client"

import * as React from "react"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Package, Shield } from 'lucide-react'
import { useWallet } from "@/contexts/wallet-context"
import { getContractInfo } from "@/lib/api"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { WalletButton } from "./wallet/wallet-button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: '/', label: 'Marketplace', icon: Home },
  { href: '/collection', label: 'My Collection', icon: Package },
]

const adminNavItems = [
    { href: '/admin', label: 'Admin', icon: Shield },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const { address, isConnected } = useWallet()
    const [isOwner, setIsOwner] = React.useState(false)

    React.useEffect(() => {
        async function checkOwner() {
            if(isConnected && address) {
                // Hardcoded address for development access
                if (address.toLowerCase() === "0x0519e602ab8a321a5fd90f4d44149fbf7c4cb296") {
                    setIsOwner(true);
                    return;
                }
                try {
                    const info = await getContractInfo();
                    setIsOwner(address.toLowerCase() === info.owner.toLowerCase());
                } catch (error) {
                    setIsOwner(false);
                }
            } else {
                setIsOwner(false);
            }
        }
        checkOwner();
    }, [isConnected, address])

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
             <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/" className="font-bold text-chiliz-red text-lg">
                OWNIBLE
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <div className="flex flex-col gap-2">
            {navItems.map((item) => (
            <Link
                key={item.href}
                href={item.href}
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-neutral-400 transition-all hover:text-white hover:bg-neutral-800",
                    pathname === item.href && "bg-neutral-800 text-white"
                )}
            >
                <item.icon className="h-4 w-4" />
                {item.label}
            </Link>
            ))}
        </div>
        {isOwner && (
            <>
                <div className="my-4 border-t border-neutral-800 -mx-4"></div>
                <div className="flex flex-col gap-2">
                    {adminNavItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-neutral-400 transition-all hover:text-white hover:bg-neutral-800",
                            pathname === item.href && "bg-neutral-800 text-white"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                    </Link>
                    ))}
                </div>
            </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <WalletButton />
      </SidebarFooter>
    </Sidebar>
  )
}
