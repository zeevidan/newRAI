import { BrowserRouter } from "react-router-dom"
import { AppProvider } from "@/context/app-context"
import { WorkflowProvider } from "@/context/workflow-context"
import { AppRoutes } from "@/routes/app-routes"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

export default function App() {
  return (
    <TooltipProvider>
      <AppProvider>
        <WorkflowProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
          <Toaster />
        </WorkflowProvider>
      </AppProvider>
    </TooltipProvider>
  )
}
