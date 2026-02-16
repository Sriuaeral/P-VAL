import { Link, useLocation, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Activity,
  BarChart3,
  Database,
  Bell,
  Target,
  FileText,
  TrendingUp,
  Battery,
  Package,
  Bot,
  Navigation,
  Play,
  Truck,
  ClipboardList,
  Sparkles,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PlantHeader from "./PlantHeader";

const plantModules = [
  { icon: Activity, label: "CMS", href: "monitor", color: "from-blue-500 to-cyan-500" },
  { icon: BarChart3, label: "Analysis", href: "analysis", color: "from-purple-500 to-violet-500" },
  { icon: Database, label: "Data Health", href: "data-health", color: "from-emerald-500 to-teal-500" },
  { icon: Bell, label: "Alerts", href: "alerts", color: "from-red-500 to-orange-500" },
  { icon: ClipboardList, label: "Work Orders", href: "work-orders", color: "from-indigo-500 to-blue-500" },
  { icon: Target, label: "KPI", href: "kpi", color: "from-green-500 to-emerald-500" },
  { icon: FileText, label: "Documents", href: "documents", color: "from-amber-500 to-orange-500" },
  { icon: TrendingUp, label: "Reports", href: "reports", color: "from-rose-500 to-pink-500" },
  { icon: Battery, label: "BESS", href: "bess", color: "from-cyan-500 to-blue-500" },
  { icon: Package, label: "Inventory", href: "inventory", color: "from-violet-500 to-purple-500" },
  { icon: Truck, label: "Tracking", href: "tracking", color: "from-lime-500 to-green-500" },
  { icon: Bot, label: "Robots", href: "robots", color: "from-sky-500 to-cyan-500" },
  { icon: Navigation, label: "Trackers", href: "trackers", color: "from-fuchsia-500 to-purple-500" },
  { icon: Play, label: "Simulator", href: "simulator", color: "from-orange-500 to-red-500" },
];

interface PlantNavigationProps {
  onRefresh?: () => void;
  onExport?: () => void;
}

export default function PlantNavigation({ onRefresh, onExport }: PlantNavigationProps = {}) {
  const location = useLocation();
  const { plantId } = useParams();
  const plantData = JSON.parse(localStorage.getItem('selectedPlant') || '{}');
  const plantName = plantData?.name || 'Unknown Plant';
  const plantStatus = plantData?.status || 'unknown';

  if (!plantId) return null;

  return (
    <TooltipProvider>
      <div className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
        {/* Plant Header */}
        <div className="px-3 py-2">
          <PlantHeader
            plantId={plantId}
            plantName={plantName}
            plantStatus={plantStatus}
            onRefresh={onRefresh}
            onExport={onExport}
          />
        </div>
        
        {/* Navigation container */}
        <div className="w-full px-2 py-1.5">
          {/* Navigation tabs - Ultra compact responsive grid */}
          <nav className="w-full">
            <div className="flex gap-0.5 w-full">
              {plantModules.map((module) => {
                const href = `/plants/${plantId}/${module.href}`;
                const isActive = location.pathname === href;
                return (
                  <Tooltip key={module.href}>
                    <TooltipTrigger asChild>
                      <Link
                        to={href}
                        className={cn(
                          "group relative flex flex-col items-center justify-center gap-0.5 px-1 py-1 rounded-sm text-xs font-medium transition-all duration-300 flex-1 min-w-0",
                          "hover:scale-105 hover:shadow-sm transform",
                          "border border-transparent",
                          isActive
                            ? "text-white shadow-md ring-0.5 ring-white/30 scale-105 bg-gradient-to-br from-primary via-primary/90 to-primary/80"
                            : "bg-white/80 text-slate-700 hover:bg-white/95 hover:text-slate-900 backdrop-blur-sm border-slate-200/60 hover:border-slate-300/80 hover:shadow-sm"
                        )}
                      >
                        {/* Active glow effect */}
                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 rounded-sm"></div>
                        )}
                        
                        {/* Icon with ultra compact styling to avoid scrollbars */}
                        <div className={cn(
                          "relative z-10 flex items-center justify-center w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm transition-all duration-300",
                          isActive 
                            ? "bg-white/25 text-white shadow-sm" 
                            : "bg-slate-100/90 text-slate-600 group-hover:bg-white group-hover:text-slate-800 group-hover:shadow-sm"
                        )}>
                          <module.icon className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                        </div>
                        
                        {/* Label with responsive visibility for single row layout */}
                        <span className={cn(
                          "relative z-10 font-medium text-xs text-center leading-tight hidden lg:block truncate max-w-full",
                          isActive && "text-white font-semibold drop-shadow-sm"
                        )}>{module.label}</span>
                        
                        {/* Active indicator - ultra compact */}
                        {isActive && (
                          <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-white rounded-full shadow-sm border border-white">
                            <div className="absolute inset-0.5 bg-green-500 rounded-full animate-pulse"></div>
                          </div>
                        )}
                        
                        {/* Hover effect overlay */}
                        <div className="absolute inset-0 rounded-sm bg-gradient-to-br from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="lg:hidden">
                      <p className="text-xs">{module.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </TooltipProvider>
  );
}
