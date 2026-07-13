import { Route, Routes } from 'react-router-dom'

import { AppLayout } from '@/app/layout'
import { CalendarPage } from '@/pages/calendar-page'
import { CategoriesPage } from '@/pages/categories-page'
import { ExpensesPage } from '@/pages/expenses-page'
import { HomePage } from '@/pages/home-page'
import { IncomesPage } from '@/pages/incomes-page'
import { ProfilePage } from '@/pages/profile-page'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="gastos" element={<ExpensesPage />} />
        <Route path="ingresos" element={<IncomesPage />} />
        <Route path="calendario" element={<CalendarPage />} />
        <Route path="categorias" element={<CategoriesPage />} />
        <Route path="perfil" element={<ProfilePage />} />
      </Route>
    </Routes>
  )
}

export default App
