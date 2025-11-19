"use client"

import { SidebarProvider, SidebarTrigger } from "@/lib/presentation/components/ui/sidebar"
import { AppSidebar } from "@/lib/presentation/components/app-sidebar"
import { Toaster } from "@/lib/presentation/components/ui/sonner"
import { ThemeToggle } from "@/lib/presentation/components/theme-toggle"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1">
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center justify-between px-4">
              <SidebarTrigger />
              <ThemeToggle />
            </div>
          </div>
          <div className="flex-1 space-y-4 p-8 pt-6">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}
