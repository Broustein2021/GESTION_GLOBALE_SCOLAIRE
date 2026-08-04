'use client'

import { Bell, Search } from 'lucide-react'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { anneesScolaires, etablissement } from '@/lib/data'

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />

      <div className="hidden min-w-0 flex-col md:flex">
        <span className="truncate text-sm font-medium leading-tight">
          {etablissement.nom}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {etablissement.ville} — {etablissement.commune}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden lg:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Rechercher un élève, une classe..."
            className="h-9 w-64 rounded-md border bg-card pl-8 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </div>

        <Select defaultValue={anneesScolaires[0].id}>
          <SelectTrigger className="h-9 w-[132px]" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {anneesScolaires.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.libelle}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-4" />
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-white">
            3
          </span>
        </Button>

        <div className="flex items-center gap-2 pl-1">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              AD
            </AvatarFallback>
          </Avatar>
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-sm font-medium">Awa Diallo</span>
            <Badge variant="secondary" className="h-4 w-fit px-1.5 text-[10px]">
              Directrice
            </Badge>
          </div>
        </div>
      </div>
    </header>
  )
}
