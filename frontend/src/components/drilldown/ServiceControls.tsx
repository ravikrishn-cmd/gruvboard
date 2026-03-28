import { useState } from "react";
import { Play, Square, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ServiceControlsProps {
  onAction: (action: "start" | "stop" | "restart") => Promise<void>;
  activeState: string;
}

export function ServiceControls({ onAction, activeState }: ServiceControlsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  async function handleAction(action: "start" | "stop" | "restart") {
    if (confirmAction !== action) {
      setConfirmAction(action);
      setTimeout(() => setConfirmAction(null), 3000);
      return;
    }
    setConfirmAction(null);
    setLoading(action);
    try {
      await onAction(action);
    } finally {
      setLoading(null);
    }
  }

  const isRunning = activeState === "active";

  return (
    <div className="flex items-center gap-2">
      {!isRunning && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAction("start")}
          disabled={loading !== null}
          className={cn(
            "text-grv-green hover:bg-grv-green-dim/20",
            confirmAction === "start" && "ring-1 ring-grv-green"
          )}
        >
          <Play className="h-4 w-4 mr-1" />
          {confirmAction === "start" ? "Confirm?" : "Start"}
        </Button>
      )}
      {isRunning && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAction("stop")}
          disabled={loading !== null}
          className={cn(
            "text-grv-red hover:bg-grv-red-dim/20",
            confirmAction === "stop" && "ring-1 ring-grv-red"
          )}
        >
          <Square className="h-4 w-4 mr-1" />
          {confirmAction === "stop" ? "Confirm?" : "Stop"}
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleAction("restart")}
        disabled={loading !== null}
        className={cn(
          "text-grv-yellow hover:bg-grv-yellow-dim/20",
          confirmAction === "restart" && "ring-1 ring-grv-yellow"
        )}
      >
        <RotateCcw className={cn("h-4 w-4 mr-1", loading === "restart" && "animate-spin")} />
        {confirmAction === "restart" ? "Confirm?" : "Restart"}
      </Button>
    </div>
  );
}
