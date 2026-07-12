import { Route, Routes } from 'react-router-dom'

import { AppLayout } from '@/app/layout'
import { CalendarPage } from '@/pages/calendar-page'
import { ExpensesPage } from '@/pages/expenses-page'
import { HomePage } from '@/pages/home-page'
import { IncomesPage } from '@/pages/incomes-page'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="gastos" element={<ExpensesPage />} />
        <Route path="ingresos" element={<IncomesPage />} />
        <Route path="calendario" element={<CalendarPage />} />
      </Route>
    </Routes>
  )
}

export default App
