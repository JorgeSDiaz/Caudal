import { NavLink, Outlet } from 'react-router-dom'

import { Toaster } from '@/components/ui/sonner'
import { BackupControls } from '@/features/backup/components/backup-controls'
import { cn } from '@/lib/utils'
import { currentMonth } from '@/shared/dates'

const monthLabelFormatter = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' })

function monthLabel(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number)
  return monthLabelFormatter.format(new Date(year, monthNumber - 1, 1))
}

const navItems = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/gastos', label: 'Gastos', end: false },
  { to: '/ingresos', label: 'Ingresos', end: false },
]

export function AppLayout() {
  const month = currentMonth()

  return (
    <div className="bg-muted/40 flex min-h-svh flex-col">
      <header className="bg-background border-b">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <span className="text-primary text-xl font-semibold tracking-tight">Caudal</span>
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground hidden text-sm font-medium capitalize sm:inline">
              {monthLabel(month)}
            </span>
            <BackupControls />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1400px] px-6 py-6">
          <Outlet />
        </div>
      </main>
      <Toaster />
    </div>
  )
}
