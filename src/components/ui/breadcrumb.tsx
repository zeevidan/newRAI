import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function Breadcrumb({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol className={cn("flex flex-wrap items-center gap-1.5", className)} {...props} />
  )
}

export function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li className={cn("inline-flex items-center gap-1.5", className)} {...props} />
}

export function BreadcrumbSeparator({ className }: { className?: string }) {
  return (
    <ChevronRight
      className={cn("size-3.5 shrink-0 text-muted-foreground/60", className)}
      aria-hidden
    />
  )
}

export function BreadcrumbLink({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  )
}

export function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("font-medium text-foreground", className)}
      aria-current="page"
      {...props}
    />
  )
}
