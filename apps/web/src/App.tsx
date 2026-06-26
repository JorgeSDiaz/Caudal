import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Toaster } from '@/components/ui/sonner'
import { ExpenseForm } from '@/features/expenses/expense-form'

function App() {
  return (
    <div className="bg-muted/30 flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl tracking-tight">Caudal</CardTitle>
          <CardDescription>Registra un gasto en segundos</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseForm />
        </CardContent>
      </Card>
      <Toaster />
    </div>
  )
}

export default App
