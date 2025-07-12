"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  IconLayoutDashboard,
  IconHome,
  IconUsers,
  IconShoppingCart,
  IconFileText,
} from "@tabler/icons-react"
import { useIsMobile } from "@/hooks/use-mobile"

export function NavMain({
  isCollapsed,
  isMobile,
}: {
  isCollapsed: boolean
  isMobile: boolean
}) {
  const pathname = usePathname()

  const links = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: IconLayoutDashboard,
    },
    {
      href: "/dashboard/market",
      label: "Market",
      icon: IconShoppingCart,
    },
    {
      href: "/dashboard/portfolio",
      label: "Portfolio",
      icon: IconHome,
    },
    {
      href: "/dashboard/white-paper",
      label: "White Paper",
      icon: IconFileText,
    },
  ]

  const NavLink = ({
    href,
    label,
    icon: Icon,
  }: {
    href: string
    label: string
    icon: React.ComponentType<{ className?: string }>
  }) => (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-neutral-400 transition-all hover:bg-neutral-800 hover:text-white",
            pathname === href && "bg-neutral-800 text-white",
            isCollapsed && "justify-center"
          )}
        >
          <Icon className="h-5 w-5" />
          <span className={cn("text-sm font-medium", isCollapsed && "hidden")}>
            {label}
          </span>
        </Link>
      </TooltipTrigger>
      {isCollapsed && !isMobile && (
        <TooltipContent side="right" className="flex items-center gap-4">
          {label}
        </TooltipContent>
      )}
    </Tooltip>
  )

  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link) => (
          <NavLink key={link.href} {...link} />
        ))}
      </nav>
    </div>
  )
}
