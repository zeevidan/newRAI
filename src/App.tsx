import { AppProvider } from "@/context/app-context"
import { AdminShell } from "@/components/layout/admin-shell"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function App() {
  return (
    <TooltipProvider>
      <AppProvider>
        <AdminShell />
      </AppProvider>
    </TooltipProvider>
  )
}
