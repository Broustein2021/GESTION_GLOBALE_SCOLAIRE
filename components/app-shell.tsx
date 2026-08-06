'use client'

import { usePathname } from 'next/navigation'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Topbar } from '@/components/topbar'
import { TooltipProvider } from '@/components/ui/tooltip'

export function AppShell({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const isStandaloneRoute =
    pathname === '/login' ||
    pathname.startsWith('/inscription') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/onboarding')

  if (isStandaloneRoute) {
    return <>{children}</>
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />

        <SidebarInset>
          <Topbar />

          <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}