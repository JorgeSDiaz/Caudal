import {
  CalendarDays,
  Home,
  Tags,
  PanelLeftClose,
  PanelLeftOpen,
  ReceiptText,
  WalletCards,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { BackupControls } from '@/features/backup/components/backup-controls'
import { useRunDueRecurrences } from '@/features/recurrences/hooks/use-run-due-recurrences'
import { cn } from '@/lib/utils'
import { currentMonth } from '@/shared/dates'

const monthLabelFormatter = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' })

function monthLabel(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number)
  return monthLabelFormatter.format(new Date(year, monthNumber - 1, 1))
}

const navItems = [
  { to: '/', label: 'Inicio', end: true, icon: Home },
  { to: '/gastos', label: 'Gastos', end: false, icon: ReceiptText },
  { to: '/ingresos', label: 'Ingresos', end: false, icon: WalletCards },
  { to: '/calendario', label: 'Calendario', end: false, icon: CalendarDays },
  { to: '/categorias', label: 'Categorías', end: false, icon: Tags },
]

export function AppLayout() {
  const month = currentMonth()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)
  useRunDueRecurrences()

  return (
    <div className="bg-muted/40 min-h-svh">
      <aside
        className={cn(
          'bg-background fixed inset-y-0 left-0 z-30 hidden border-r transition-[width] duration-200 md:flex md:flex-col',
          isSidebarCollapsed ? 'w-[4.5rem]' : 'w-[16rem]',
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="bg-primary text-primary-foreground grid size-9 shrink-0 place-items-center rounded-lg font-semibold">
              C
            </div>
            <span
              className={cn(
                'text-primary truncate text-xl font-semibold tracking-tight transition-opacity',
                isSidebarCollapsed && 'pointer-events-none opacity-0',
              )}
            >
              Caudal
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn('size-8 shrink-0', isSidebarCollapsed && 'hidden')}
            onClick={() => setIsSidebarCollapsed(true)}
            aria-label="Colapsar navegación"
          >
            <PanelLeftClose />
          </Button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                aria-label={item.label}
                title={isSidebarCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    isSidebarCollapsed && 'justify-center px-0',
                  )
                }
              >
                <Icon className="size-4 shrink-0" />
                <span className={cn('truncate', isSidebarCollapsed && 'sr-only')}>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t p-3">
          {isSidebarCollapsed ? (
            <Button
              variant="ghost"
              size="icon"
              className="size-10"
              onClick={() => setIsSidebarCollapsed(false)}
              aria-label="Expandir navegación"
            >
              <PanelLeftOpen />
            </Button>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs font-medium uppercase">Periodo</p>
                <p className="truncate text-sm font-medium capitalize">{monthLabel(month)}</p>
              </div>
              <BackupControls />
            </div>
          )}
        </div>
      </aside>

      <header className="bg-background/95 sticky top-0 z-20 border-b backdrop-blur md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <span className="text-primary text-lg font-semibold tracking-tight">Caudal</span>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground text-sm font-medium capitalize">
              {monthLabel(month)}
            </span>
            <BackupControls />
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )
                }
              >
                <Icon className="size-4" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </header>

      <main
        className={cn(
          'transition-[padding-left] duration-200 md:min-h-svh',
          isSidebarCollapsed ? 'md:pl-[4.5rem]' : 'md:pl-[16rem]',
        )}
      >
        <div className="mx-auto w-full max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      <Toaster />
    </div>
  )
}
