import { BrowserRouter } from "react-router-dom"
import { AppProvider } from "@/context/app-context"
import { AppRoutes } from "@/routes/app-routes"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function App() {
  return (
    <TooltipProvider>
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  )
}
