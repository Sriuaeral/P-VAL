import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, Loader2, X } from "lucide-react";
import { Button } from "./button";

export interface StatusMessage {
  id: string;
  type: "loading" | "success" | "error" | "info";
  message: string;
  timestamp: Date;
  dismissible?: boolean;
}

interface StatusBarProps {
  messages: StatusMessage[];
  onDismiss?: (id: string) => void;
  className?: string;
}

export function StatusBar({ messages, onDismiss, className }: StatusBarProps) {
  if (messages.length === 0) return null;

  const getStatusIcon = (type: StatusMessage["type"]) => {
    switch (type) {
      case "loading":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "info":
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (type: StatusMessage["type"]) => {
    switch (type) {
      case "loading":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  return (
    <div className={cn("fixed bottom-4 left-4 right-4 z-50 space-y-2", className)}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg border shadow-lg transition-all duration-300",
            getStatusColor(message.type)
          )}
        >
          {getStatusIcon(message.type)}
          <span className="flex-1 text-sm font-medium">{message.message}</span>
          <span className="text-xs opacity-70">
            {message.timestamp.toLocaleTimeString()}
          </span>
          {message.dismissible && onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-black/10"
              onClick={() => onDismiss(message.id)}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

export default StatusBar;
