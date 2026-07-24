import { Check, CheckCheck, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageStatusProps {
  status?: "pending" | "sent" | "delivered" | "seen" | "failed";
  className?: string;
}

export function MessageStatus({ status = "sent", className }: MessageStatusProps) {
  if (status === "pending") {
    return <Clock className={cn("h-3 w-3 opacity-60", className)} />;
  }
  if (status === "failed") {
    return <AlertCircle className={cn("h-3 w-3 text-destructive", className)} />;
  }
  if (status === "seen") {
    return <CheckCheck className={cn("h-3 w-3 text-blue-400", className)} />;
  }
  if (status === "delivered") {
    return <CheckCheck className={cn("h-3 w-3 opacity-70", className)} />;
  }
  return <Check className={cn("h-3 w-3 opacity-60", className)} />;
}
