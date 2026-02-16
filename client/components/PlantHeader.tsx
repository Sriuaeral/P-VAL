import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";

interface PlantHeaderProps {
  plantId: string;
  plantName: string;
  plantStatus: string;
  onRefresh?: () => void;
  onExport?: () => void;
  className?: string;
}

export default function PlantHeader({
  plantId,
  plantName,
  plantStatus,
  onRefresh,
  onExport,
  className = ""
}: PlantHeaderProps) {
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    }
  };

  return (
    <div className={`bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg rounded-xl p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {plantName}
            <span className="text-sm text-gray-600 ml-2 font-normal">
              (ID: {plantId})
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              plantStatus === "operational"
                ? "success"
                : plantStatus === "maintenance"
                  ? "warning"
                  : ("destructive" as any)
            }
            className="text-xs px-2 py-1"
          >
            {plantStatus.toUpperCase()}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 text-xs px-3 py-2 h-8 min-w-[80px] font-medium border-gray-300 hover:border-green-500 hover:bg-green-50 hover:text-green-700 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
            onClick={handleRefresh}
            aria-label="Refresh plant data"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gray-600 group-hover:text-green-600" />
            <span className="hidden sm:inline">Refresh</span>
            <span className="sm:hidden">↻</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 text-xs px-3 py-2 h-8 min-w-[80px] font-medium border-gray-300 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
            onClick={handleExport}
            aria-label="Export plant data"
          >
            <Download className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-600" />
            <span className="hidden sm:inline">Export</span>
            <span className="sm:hidden">↓</span>
          </Button>
        </div>
      </div>
    </div>
  );
}