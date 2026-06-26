import { Button } from '@/components/ui/button'

function App() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Caudal</h1>
        <p className="text-muted-foreground">Control de gastos personales</p>
      </div>
      <Button>Empezar</Button>
    </div>
  )
}

export default App
