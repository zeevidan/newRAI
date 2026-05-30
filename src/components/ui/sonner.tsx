import { Toaster as Sonner } from "sonner"

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast border-border bg-background text-foreground shadow-lg",
          title: "text-sm font-medium",
          description: "text-sm text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-muted-foreground",
        },
      }}
    />
  )
}
