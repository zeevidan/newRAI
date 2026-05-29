import { Gauge, Pause, Play, Square } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { RunState } from "@/lib/workflow/types"

interface ClockSpeedControls {
  speed: number
  ticking: boolean
  onSetSpeed: (speed: number) => void
  onPauseClock: () => void
  onResumeClock: () => void
}

interface RunControlsProps {
  runState: RunState
  onStart: () => void
  onPause: () => void
  onStop: () => void
  disabled?: boolean
  size?: "sm" | "default"
  className?: string
  clockSpeed?: ClockSpeedControls
}

export function RunControls({
  runState,
  onStart,
  onPause,
  onStop,
  disabled = false,
  size = "default",
  className,
  clockSpeed,
}: RunControlsProps) {
  const isRunning = runState === "running"
  const isPaused = runState === "paused"

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="group/speed relative">
        <Badge
          variant={isRunning ? "default" : "outline"}
          className={cn(
            "capitalize gap-1.5",
            isRunning && "bg-emerald-600 hover:bg-emerald-600",
            clockSpeed && "cursor-default",
          )}
        >
          {isRunning && <span className="size-1.5 animate-pulse rounded-full bg-white" />}
          {runState}
        </Badge>

        {clockSpeed && (
          <div className="pointer-events-none absolute bottom-full left-0 z-50 pb-1 opacity-0 transition-opacity group-hover/speed:pointer-events-auto group-hover/speed:opacity-100">
            <div className="flex items-center gap-1 rounded-md border border-border bg-popover px-2 py-1 text-xs text-muted-foreground shadow-md">
              <Gauge className="size-3.5 shrink-0" />
              <span className="whitespace-nowrap">Speed</span>
              {[1, 2, 5].map((speed) => (
                <Button
                  key={speed}
                  type="button"
                  size="sm"
                  variant={clockSpeed.speed === speed ? "secondary" : "ghost"}
                  className="h-6 px-2"
                  onClick={() => clockSpeed.onSetSpeed(speed)}
                >
                  {speed}x
                </Button>
              ))}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-6 gap-1 px-2"
                onClick={() =>
                  clockSpeed.ticking ? clockSpeed.onPauseClock() : clockSpeed.onResumeClock()
                }
              >
                {clockSpeed.ticking ? (
                  <>
                    <Pause className="size-3" />
                    Pause clock
                  </>
                ) : (
                  <>
                    <Play className="size-3" />
                    Resume clock
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        {!isRunning && (
          <Button
            type="button"
            size={size}
            variant="default"
            disabled={disabled}
            onClick={onStart}
          >
            <Play className="size-3.5" />
            Start
          </Button>
        )}
        {isRunning && (
          <Button
            type="button"
            size={size}
            variant="outline"
            disabled={disabled}
            onClick={onPause}
          >
            <Pause className="size-3.5" />
            Pause
          </Button>
        )}
        {isPaused && (
          <Button
            type="button"
            size={size}
            variant="default"
            disabled={disabled}
            onClick={onStart}
          >
            <Play className="size-3.5" />
            Resume
          </Button>
        )}
        {runState !== "stopped" && (
          <Button
            type="button"
            size={size}
            variant="outline"
            disabled={disabled}
            onClick={onStop}
          >
            <Square className="size-3.5" />
            Stop
          </Button>
        )}
      </div>
    </div>
  )
}
