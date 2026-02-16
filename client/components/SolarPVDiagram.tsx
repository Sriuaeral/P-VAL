import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sun,
  Zap,
  Battery,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  ArrowLeftRight,
  Grid3X3,
  Radio,
  Monitor,
  Power,
  Cable,
  CircuitBoard,
  Gauge,
  Home,
  Wifi,
  CloudSun,
  TrendingUp,
  X,
  Box,
  Sparkles,
  Waves,
  Bolt,
  BarChart3,
  ArrowLeft
} from "lucide-react";

interface ComponentStatus {
  id: string;
  name: string;
  shortName: string;
  status: "healthy" | "warning" | "critical" | "offline";
  faults: string[];
  efficiency?: number;
  powerOutput?: string;
  voltage?: string;
  lastMaintenance?: string;
  description?: string;
}

interface SolarPVDiagramProps {
  plantId: string;
}

const generateMockComponentStatuses = (): ComponentStatus[] => [
  {
    id: "solar-modules",
    name: "Solar Module Array",
    shortName: "Solar Array",
    status: "healthy",
    faults: [],
    efficiency: 98.5,
    powerOutput: "1,245 kW",
    voltage: "1,500 VDC",
    lastMaintenance: "2024-01-10",
    description: "2,400 PV modules generating DC power",
  },
  {
    id: "inverter",
    name: "AC Service Panel & Inverter",
    shortName: "Inverter",
    status: "critical",
    faults: ["Inverter 5 offline", "DC isolation fault detected"],
    efficiency: 87.1,
    powerOutput: "1,028 kW",
    voltage: "480 VAC",
    lastMaintenance: "2023-12-28",
    description: "Converts DC to AC power",
  },
  {
    id: "lv-panel",
    name: "LV Panel",
    shortName: "LV Panel",
    status: "healthy",
    faults: [],
    efficiency: 99.8,
    powerOutput: "1,025 kW",
    voltage: "480 VAC",
    lastMaintenance: "2024-01-08",
    description: "Low voltage distribution panel",
  },
  {
    id: "metering-cabinet",
    name: "Metering Cabinet (Gross Meter)",
    shortName: "Gross Meter",
    status: "healthy",
    faults: [],
    efficiency: 99.9,
    powerOutput: "1,011 kW",
    voltage: "480 VAC",
    lastMaintenance: "2024-01-05",
    description: "Measures total generation output",
  },
  {
    id: "utility-meter",
    name: "AC Utility Net Meter",
    shortName: "Net Meter",
    status: "healthy",
    faults: [],
    efficiency: 99.8,
    powerOutput: "1,020 kW",
    voltage: "34.5 kV",
    lastMaintenance: "2024-01-08",
    description: "Measures bidirectional energy flow (import/export)",
  },
  {
    id: "utility-grid",
    name: "Utility Grid Connection (POC)",
    shortName: "Grid POC",
    status: "healthy",
    faults: [],
    efficiency: 99.9,
    powerOutput: "1,220 kW",
    voltage: "34.5 kV",
    lastMaintenance: "N/A",
    description: "Point of connection to electrical grid",
  },
  {
    id: "monitoring",
    name: "SCADA & Monitoring System",
    shortName: "Monitoring",
    status: "healthy",
    faults: [],
    efficiency: 98.0,
    powerOutput: "N/A",
    voltage: "N/A",
    lastMaintenance: "2024-01-12",
    description: "Remote monitoring and control",
  },
  {
    id: "weather-station",
    name: "Weather Monitoring",
    shortName: "Weather",
    status: "healthy",
    faults: [],
    efficiency: 99.0,
    powerOutput: "N/A",
    voltage: "N/A",
    lastMaintenance: "2024-01-01",
    description: "Environmental data collection",
  },
];

const getStatusColor = (status: ComponentStatus["status"]) => {
  switch (status) {
    case "healthy":
      return "border-emerald-400 bg-emerald-50 text-emerald-700";
    case "warning":
      return "border-amber-400 bg-amber-50 text-amber-700";
    case "critical":
      return "border-red-400 bg-red-50 text-red-700";
    case "offline":
      return "border-gray-400 bg-gray-50 text-gray-700";
    default:
      return "border-slate-300 bg-slate-50 text-slate-700";
  }
};

const getStatusDotColor = (status: ComponentStatus["status"]) => {
  switch (status) {
    case "healthy":
      return "bg-emerald-500";
    case "warning":
      return "bg-amber-500";
    case "critical":
      return "bg-red-500";
    case "offline":
      return "bg-gray-500";
    default:
      return "bg-slate-500";
  }
};

const getStatusIcon = (status: ComponentStatus["status"]) => {
  switch (status) {
    case "healthy":
      return CheckCircle;
    case "warning":
    case "critical":
    case "offline":
      return AlertTriangle;
    default:
      return Settings;
  }
};

const getComponentIcon = (componentId: string) => {
  switch (componentId) {
    case "solar-modules":
      return Sun;
    case "inverter":
      return "inverter";
    case "metering-cabinet":
      return Gauge;
    case "lv-panel":
      return CircuitBoard;
    case "utility-meter":
      return Gauge;
    case "utility-grid":
      return Power;
    case "monitoring":
      return Monitor;
    case "weather-station":
      return CloudSun;
    default:
      return CircuitBoard;
  }
};

const getFlowArrowColor = (fromStatus: string, toStatus: string) => {
  if (fromStatus === "critical" || toStatus === "critical") {
    return "text-red-500";
  } else if (fromStatus === "warning" || toStatus === "warning") {
    return "text-amber-500";
  } else if (fromStatus === "offline" || toStatus === "offline") {
    return "text-gray-400";
  } else {
    return "text-emerald-500";
  }
};

const powerFlowLabels = [
  { label: "DC Power", value: "1,245 kW", type: "dc" },
  { label: "AC Power", value: "1,028 kW", type: "ac" },
  { label: "LV Distribution", value: "1,025 kW", type: "lv" },
  { label: "Gross Meter", value: "1,025 kW", type: "gross" },
  { label: "Net Export/Import", value: "1,020 kW", type: "net" },
];

export default function SolarPVDiagram({ plantId }: SolarPVDiagramProps) {
  const [components] = useState(generateMockComponentStatuses());
  const [selectedComponent, setSelectedComponent] = useState<ComponentStatus | null>(null);
  const [flowAnimation, setFlowAnimation] = useState(0);
  const [hoveredComponent, setHoveredComponent] = useState<ComponentStatus | null>(null);

  const mainFlowComponents = components.filter(c =>
    ["solar-modules", "inverter", "lv-panel", "metering-cabinet", "utility-meter", "utility-grid"].includes(c.id)
  );
  
  const auxiliaryComponents = components.filter(c =>
    ["monitoring", "weather-station"].includes(c.id)
  );

  // Animation effect for energy flow
  useEffect(() => {
    const interval = setInterval(() => {
      setFlowAnimation(prev => (prev + 1) % mainFlowComponents.length);
    }, 800);
    return () => clearInterval(interval);
  }, [mainFlowComponents.length]);

  return (
    <div className="w-full space-y-3 h-full overflow-hidden">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Waves className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Solar PV System</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Plant {plantId}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-slate-600 dark:text-slate-400">
                {mainFlowComponents.filter(c => c.status === 'healthy').length} Healthy
              </span>
            </div>
            {mainFlowComponents.filter(c => c.status === 'critical').length > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-slate-600 dark:text-slate-400">
                  {mainFlowComponents.filter(c => c.status === 'critical').length} Critical
                </span>
              </div>
            )}
          </div>
          <div className="w-px h-6 bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Live</span>
          </div>
        </div>
      </div>

      {/* Main Flow Diagram */}
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-slate-50/50 rounded-xl border border-slate-200"></div>
        
        <div className="relative p-3 sm:p-4 lg:p-6 h-full overflow-y-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4 lg:p-6 w-full">
            {/* Mobile: Vertical Stack */}
            <div className="block sm:hidden">
              <div className="space-y-6">
                {mainFlowComponents.map((component, index) => (
                  <div key={component.id} className="flex flex-col items-center">
                    {/* Component */}
                    <div className="flex flex-col items-center justify-center w-full max-w-[200px]">
                      <div className="flex justify-center mb-3">
                        <CompactComponentBlock
                          component={component}
                          icon={getComponentIcon(component.id)}
                          onClick={setSelectedComponent}
                          isSelected={selectedComponent?.id === component.id}
                          isAnimated={index <= flowAnimation}
                        />
                      </div>
                      
                      <div className="text-center w-full">
                        <div className="font-medium text-sm text-slate-700 mb-1">{component.shortName}</div>
                        {component.powerOutput && component.powerOutput !== "N/A" && (
                          <div className="text-sm text-slate-500">
                            {component.powerOutput}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Vertical Flow Arrow */}
                    {index < mainFlowComponents.length - 1 && (
                      <div className="flex flex-col items-center justify-center my-4">
                        <div className="relative w-1 h-12 bg-slate-200 rounded-full overflow-hidden">
                          <div className={cn(
                            "absolute left-0 w-full rounded-full transition-all duration-500",
                            index <= flowAnimation - 1 ? "opacity-100" : "opacity-30"
                          )} 
                          style={{
                            height: flowAnimation === index ? '100%' : '0%',
                            top: flowAnimation === index ? '0%' : 'auto',
                            bottom: flowAnimation === index ? 'auto' : '0%',
                            background: component.status === "critical" || mainFlowComponents[index + 1]?.status === "critical"
                              ? "#ef4444"
                              : component.status === "warning" || mainFlowComponents[index + 1]?.status === "warning"
                              ? "#f59e0b"
                              : "#10b981"
                          }}
                          />
                        </div>
                        
                        <div className="absolute">
                          <div className={cn(
                            "w-4 h-4 transition-all duration-300 rotate-90",
                            index <= flowAnimation - 1
                              ? getFlowArrowColor(component.status, mainFlowComponents[index + 1]?.status || "healthy")
                              : "text-slate-300"
                          )}>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                        
                        <div className="mt-3 px-2 py-1 bg-slate-50 rounded-md">
                          <div className="text-xs font-medium text-slate-600 text-center whitespace-nowrap">
                            {powerFlowLabels[index]?.label}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tablet & Desktop: Horizontal Flow */}
            <div className="hidden sm:block">
              <div className="flex items-center justify-center w-full min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] gap-4 sm:gap-6 lg:gap-8">
                {mainFlowComponents.map((component, index) => (
                  <React.Fragment key={component.id}>
                    {/* Component Container */}
                    <div className="flex flex-col items-center justify-center w-24 sm:w-28 lg:w-32">
                      {/* Component Block */}
                      <div className="flex justify-center mb-3 sm:mb-4">
                        <CompactComponentBlock
                          component={component}
                          icon={getComponentIcon(component.id)}
                          onClick={setSelectedComponent}
                          isSelected={selectedComponent?.id === component.id}
                          isAnimated={index <= flowAnimation}
                        />
                      </div>
                      
                      {/* Component Info */}
                      <div className="text-center w-full px-1">
                        <div className="font-medium text-xs sm:text-sm text-slate-700 mb-1">{component.shortName}</div>
                        {component.powerOutput && component.powerOutput !== "N/A" && (
                          <div className="text-xs sm:text-sm text-slate-500">
                            {component.powerOutput}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Flow Arrow */}
                    {index < mainFlowComponents.length - 1 && (
                      <div className="flex flex-col items-center justify-center flex-shrink-0 w-16 sm:w-20 lg:w-24 h-full">
                        {/* Spacer to align with component center */}
                        <div className="h-6 sm:h-8"></div>
                        
                        {/* Arrow and flow line */}
                        <div className="flex flex-col items-center justify-center">
                          <div className="relative w-12 sm:w-16 lg:w-20 h-1 bg-slate-200 rounded-full overflow-hidden">
                            <div className={cn(
                              "absolute top-0 h-full rounded-full transition-all duration-500",
                              index <= flowAnimation - 1 ? "opacity-100" : "opacity-30"
                            )} 
                            style={{
                              width: flowAnimation === index ? '100%' : '0%',
                              left: flowAnimation === index ? '0%' : 'auto',
                              right: flowAnimation === index ? 'auto' : '0%',
                              background: component.status === "critical" || mainFlowComponents[index + 1]?.status === "critical"
                                ? "#ef4444"
                                : component.status === "warning" || mainFlowComponents[index + 1]?.status === "warning"
                                ? "#f59e0b"
                                : "#10b981"
                            }}
                            />
                          </div>

                          {/* Arrow Icon */}
                          <div className="absolute">
                            {component.id === "utility-meter" ? (
                              <div className={cn(
                                "w-3 h-3 sm:w-4 sm:h-4 transition-all duration-300",
                                index <= flowAnimation - 1
                                  ? getFlowArrowColor(component.status, mainFlowComponents[index + 1]?.status || "healthy")
                                  : "text-slate-300"
                              )}>
                                <ArrowLeftRight className="w-3 h-3 sm:w-4 sm:h-4" />
                              </div>
                            ) : (
                              <div className={cn(
                                "w-3 h-3 sm:w-4 sm:h-4 transition-all duration-300",
                                index <= flowAnimation - 1
                                  ? getFlowArrowColor(component.status, mainFlowComponents[index + 1]?.status || "healthy")
                                  : "text-slate-300"
                              )}>
                                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Flow Label */}
                        <div className="mt-2 sm:mt-3 px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-50 rounded-md w-full">
                          <div className="text-xs font-medium text-slate-600 text-center">
                            {powerFlowLabels[index]?.label}
                          </div>
                        </div>
                        
                        {/* Bottom spacer */}
                        <div className="h-6 sm:h-8"></div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Hover Summary */}
      {/* {hoveredComponent && !selectedComponent && (
        <div className="fixed z-50 pointer-events-none transform -translate-y-2">
          <div className="p-4 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-xl max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              {React.createElement(getComponentIcon(hoveredComponent.id), { className: "w-5 h-5" })}
              <span className="font-semibold text-sm">{hoveredComponent.name}</span>
              <Badge
                variant={hoveredComponent.status === "healthy" ? "success" : hoveredComponent.status === "warning" ? "warning" : "destructive"}
                className="text-xs"
              >
                {hoveredComponent.status}
              </Badge>
            </div>
            <div className="text-xs text-slate-600 mb-3">{hoveredComponent.description}</div>
            {hoveredComponent.powerOutput && hoveredComponent.powerOutput !== "N/A" && (
              <div className="text-xs mb-2">
                <span className="text-slate-500">Power: </span>
                <span className="font-semibold">{hoveredComponent.powerOutput}</span>
              </div>
            )}
            {hoveredComponent.efficiency && (
              <div className="text-xs mb-2">
                <span className="text-slate-500">Efficiency: </span>
                <span className="font-semibold">{hoveredComponent.efficiency}%</span>
              </div>
            )}
            {hoveredComponent.faults.length > 0 && (
              <div className="text-xs text-red-600 mt-2">
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                {hoveredComponent.faults.length} fault(s) detected
              </div>
            )}
          </div>
        </div>
      )} */}

      {/* Component Details Panel */}
      {selectedComponent && (
        <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {typeof getComponentIcon(selectedComponent.id) === "string" ? (
                  <img 
                    src={`/assets/${getComponentIcon(selectedComponent.id)}.png`} 
                    alt={selectedComponent.name}
                    className="w-5 h-5 object-contain"
                  />
                ) : (
                  React.createElement(getComponentIcon(selectedComponent.id), { className: "w-5 h-5" })
                )}
                {selectedComponent.name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedComponent.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  selectedComponent.status === "healthy" ? "success" :
                  selectedComponent.status === "warning" ? "warning" : "destructive"
                }
                className="text-xs px-3 py-1"
              >
                {selectedComponent.status.toUpperCase()}
              </Badge>
              <button
                onClick={() => setSelectedComponent(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Check if selected component is a meter */}
          {selectedComponent.id === "metering-cabinet" || selectedComponent.id === "utility-meter" ? (
            // Display meter reading for meter components
            <div className="flex justify-center mb-4">
              <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200 max-w-xs">
                <div className="text-2xl font-bold text-emerald-600">1011 kW</div>
                <div className="text-sm text-emerald-600 font-semibold">Meter Reading</div>
              </div>
            </div>
          ) : (
            // Display standard metrics for non-meter components
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 justify-items-center">
              {selectedComponent.efficiency && (
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="text-lg font-bold text-blue-600">{selectedComponent.efficiency}%</div>
                  <div className="text-xs text-blue-600 font-semibold">Efficiency</div>
                </div>
              )}
              {selectedComponent.powerOutput && selectedComponent.powerOutput !== "N/A" && (
                <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                  <div className="text-sm font-bold text-emerald-600">{selectedComponent.powerOutput}</div>
                  <div className="text-xs text-emerald-600 font-semibold">Power Output</div>
                </div>
              )}
              {selectedComponent.voltage && selectedComponent.voltage !== "N/A" && (
                <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <div className="text-sm font-bold text-purple-600">{selectedComponent.voltage}</div>
                  <div className="text-xs text-purple-600 font-semibold">Voltage</div>
                </div>
              )}
              {selectedComponent.lastMaintenance && selectedComponent.lastMaintenance !== "N/A" && (
                <div className="text-center p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                  <div className="text-xs font-bold text-slate-600">{selectedComponent.lastMaintenance}</div>
                  <div className="text-xs text-slate-600 font-semibold">Last Maintenance</div>
                </div>
              )}
            </div>
          )}

          {selectedComponent.faults.length > 0 ? (
            <div className="p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4" />
                Active Faults ({selectedComponent.faults.length}) - Energy Flow Blocked
              </h4>
              <ul className="space-y-1">
                {selectedComponent.faults.map((fault, index) => (
                  <li key={index} className="text-xs text-red-700 flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
                    {fault}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-700 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span className="font-semibold">No faults detected - Energy flowing normally</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface CompactComponentBlockProps {
  component: ComponentStatus;
  icon: React.ComponentType<{ className?: string }> | string;
  onClick: (component: ComponentStatus) => void;
  isSelected?: boolean;
  isAnimated?: boolean;
}

function CompactComponentBlock({
  component,
  icon: Icon,
  onClick,
  isSelected = false,
  isAnimated = true,
}: CompactComponentBlockProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "relative w-12 h-12 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 border-2",
            "bg-gradient-to-br from-white via-slate-50 to-white shadow-md hover:shadow-lg",
            getStatusColor(component.status),
            isSelected && "ring-2 ring-blue-400 ring-opacity-50 scale-105 shadow-lg",
            !isAnimated && component.status === "critical" && "opacity-75 grayscale",
            isAnimated && "animate-pulse scale-105 ring-1 ring-emerald-400 ring-opacity-70 shadow-lg"
          )}
          onClick={() => onClick(component)}
        >
          <div className="flex flex-col items-center justify-center h-full p-2">
            <div className={cn(
              "flex items-center justify-center rounded-md p-1.5 transition-all duration-300 border",
              component.status === "healthy" ? "bg-emerald-100 border-emerald-200" :
              component.status === "warning" ? "bg-amber-100 border-amber-200" :
              component.status === "critical" ? "bg-red-100 border-red-200" : 
              "bg-slate-100 border-slate-200",
              isAnimated && "bg-emerald-200 border-emerald-300 scale-105"
            )}>
              {typeof Icon === "string" ? (
                <img 
                  src={`/assets/${Icon}.png`} 
                  alt={component.name}
                  className={cn(
                    "w-4 h-4 transition-all duration-300 object-contain",
                    component.status === "critical" ? "opacity-75" : "opacity-100",
                    isAnimated && "scale-105"
                  )}
                />
              ) : (
                <Icon className={cn(
                  "w-4 h-4 transition-all duration-300",
                  component.status === "healthy" ? "text-emerald-600" :
                  component.status === "warning" ? "text-amber-600" :
                  component.status === "critical" ? "text-red-600" : "text-slate-600",
                  isAnimated && "text-emerald-700 scale-105"
                )} />
              )}
            </div>
          </div>

          {/* Status Indicator */}
          <div className={cn(
            "absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-white shadow-md",
            getStatusDotColor(component.status)
          )}>
            <div className={cn(
              "w-full h-full rounded-full",
              isAnimated && component.status !== "offline" ? "animate-pulse" : ""
            )}></div>
          </div>

          {/* Power Flow Indicator */}
          {component.powerOutput && component.status !== "offline" && (
            <div className={cn(
              "absolute -bottom-1 -left-1 w-2 h-2 rounded-full border border-white shadow-md",
              isAnimated ? "bg-emerald-500 animate-pulse" : "bg-slate-400",
              isAnimated && "bg-emerald-600 scale-125"
            )}></div>
          )}

          {/* Active Flow Glow */}
          {isAnimated && (
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-400/20 via-blue-400/20 to-purple-400/20 animate-pulse"></div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="p-2">
          <div className="font-semibold text-sm mb-1">{component.name}</div>
          <div className="text-xs text-slate-600 mb-2">{component.description}</div>
          {component.powerOutput && component.powerOutput !== "N/A" && (
            <div className="text-xs mb-1">
              <span className="text-slate-500">Power: </span>
              <span className="font-semibold">{component.powerOutput}</span>
            </div>
          )}
          {component.efficiency && (
            <div className="text-xs mb-1">
              <span className="text-slate-500">Efficiency: </span>
              <span className="font-semibold">{component.efficiency}%</span>
            </div>
          )}
          {component.faults.length > 0 && (
            <div className="text-xs text-red-600 mt-2">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              {component.faults.length} fault(s) detected
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
