'use client'

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { AppSidebar } from "./app-sidebar"
import Link from "next/link"

export function SiteHeader() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-neutral-900 px-4 lg:h-[60px] lg:px-6">
        <div className="lg:hidden">
            <Sheet>
                <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col p-0">
                    <AppSidebar />
                </SheetContent>
            </Sheet>
        </div>
        <div className="w-full flex-1">
            {/* Can add breadcrumbs or page title here dynamically */}
        </div>
    </header>
  )
}
