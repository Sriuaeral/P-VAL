import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  X,
  Maximize2,
  Play,
  Pause,
  RotateCcw,
  Eye,
  EyeOff,
  Zap,
  Activity,
  AlertTriangle,
  Settings,
  User,
  Clock,
  TrendingUp,
  TrendingDown,
  Target,
  Wrench,
  CheckCircle,
  MapPin,
  Thermometer,
  Battery,
  Layers,
  Calendar,
  FileText,
  Plus,
  Filter,
  Sun,
  Server,
  Gauge,
  Cpu,
  Radio,
  Zap as ZapIcon,
  ZoomIn,
  ZoomOut,
  Move,
  Wind,
  CloudSun,
  ArrowRight,
  Power,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import WorkOrderCreateDialog from "@/components/WorkOrderCreateDialog";

interface DigitalTwinProps {
  plantId: string;
  onClose: () => void;
}

interface Component {
  id: string;
  type:
    | "pv-strings"
    | "combiner-box"
    | "inverter"
    | "transformer"
    | "energy-meter"
    | "hvac"
    | "weather-station"
    | "bess"
    | "tracker"
    | "logger-gateway";
  name: string;
  x: number;
  y: number;
  status: "healthy" | "warning" | "fault" | "predicted-fault";
  powerOutput: number;
  healthScore: number;
  lastMaintenance: string;
  nextMaintenance: string;
  alerts: string[];
  tasks: string[];
  flow: "dc" | "ac" | "monitoring" | "storage";
  aiPrediction?: {
    failureProbability: number;
    timeToFailure: number;
    confidence: number;
  };
}

interface Task {
  id: string;
  componentId: string;
  title: string;
  priority: "low" | "medium" | "high" | "critical";
  assignee: string;
  dueDate: string;
  status: "pending" | "in-progress" | "completed";
  type: "maintenance" | "inspection" | "repair" | "cleaning";
}

interface AIRecommendation {
  id: string;
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  estimatedImpact: string;
  timeframe: string;
  componentIds: string[];
  confidence: number;
}

const generateMockComponents = (): Component[] => [
  // DC Generation Side (Left) - More spaced out layout
  {
    id: "pv-1",
    type: "pv-strings",
    name: "PV Array 1",
    x: 100,
    y: 140,
    status: "healthy",
    powerOutput: 1200,
    healthScore: 94,
    lastMaintenance: "2024-01-05",
    nextMaintenance: "2024-07-05",
    alerts: [],
    tasks: [],
    flow: "dc",
  },
  {
    id: "pv-2",
    type: "pv-strings",
    name: "PV Array 2",
    x: 100,
    y: 220,
    status: "warning",
    powerOutput: 1100,
    healthScore: 78,
    lastMaintenance: "2024-01-05",
    nextMaintenance: "2024-07-05",
    alerts: ["Dust Accumulation"],
    tasks: ["Cleaning Required"],
    flow: "dc",
  },
  {
    id: "pv-3",
    type: "pv-strings",
    name: "PV Array 3",
    x: 100,
    y: 300,
    status: "healthy",
    powerOutput: 1180,
    healthScore: 91,
    lastMaintenance: "2024-01-05",
    nextMaintenance: "2024-07-05",
    alerts: [],
    tasks: [],
    flow: "dc",
  },
  // DC Collection
  {
    id: "cmb-1",
    type: "combiner-box",
    name: "Combiner A",
    x: 240,
    y: 180,
    status: "healthy",
    powerOutput: 2200,
    healthScore: 88,
    lastMaintenance: "2024-01-12",
    nextMaintenance: "2024-10-12",
    alerts: [],
    tasks: [],
    flow: "dc",
  },
  {
    id: "cmb-2",
    type: "combiner-box",
    name: "Combiner B",
    x: 240,
    y: 260,
    status: "healthy",
    powerOutput: 1180,
    healthScore: 90,
    lastMaintenance: "2024-01-12",
    nextMaintenance: "2024-10-12",
    alerts: [],
    tasks: [],
    flow: "dc",
  },
  // DC to AC Conversion
  {
    id: "inv-1",
    type: "inverter",
    name: "Inverter 1",
    x: 380,
    y: 180,
    status: "healthy",
    powerOutput: 2450,
    healthScore: 95,
    lastMaintenance: "2024-01-08",
    nextMaintenance: "2024-04-08",
    alerts: [],
    tasks: [],
    flow: "ac",
  },
  {
    id: "inv-2",
    type: "inverter",
    name: "Inverter 2",
    x: 380,
    y: 260,
    status: "warning",
    powerOutput: 2180,
    healthScore: 78,
    lastMaintenance: "2024-01-08",
    nextMaintenance: "2024-04-08",
    alerts: ["High Temperature"],
    tasks: ["Cooling Fan Check"],
    flow: "ac",
    aiPrediction: { failureProbability: 72, timeToFailure: 7, confidence: 85 },
  },
  // AC Infrastructure
  {
    id: "tfm-1",
    type: "transformer",
    name: "Transformer",
    x: 520,
    y: 220,
    status: "healthy",
    powerOutput: 15000,
    healthScore: 96,
    lastMaintenance: "2024-01-01",
    nextMaintenance: "2024-12-01",
    alerts: [],
    tasks: [],
    flow: "ac",
  },
  {
    id: "meter-1",
    type: "energy-meter",
    name: "Grid Meter",
    x: 660,
    y: 220,
    status: "healthy",
    powerOutput: 14850,
    healthScore: 98,
    lastMaintenance: "2024-01-15",
    nextMaintenance: "2024-07-15",
    alerts: [],
    tasks: [],
    flow: "ac",
  },
  // Support Systems
  {
    id: "weather-1",
    type: "weather-station",
    name: "Weather",
    x: 100,
    y: 80,
    status: "healthy",
    powerOutput: 0,
    healthScore: 92,
    lastMaintenance: "2024-01-20",
    nextMaintenance: "2024-07-20",
    alerts: [],
    tasks: [],
    flow: "monitoring",
  },
  {
    id: "bess-1",
    type: "bess",
    name: "BESS",
    x: 520,
    y: 140,
    status: "healthy",
    powerOutput: -200,
    healthScore: 89,
    lastMaintenance: "2024-01-18",
    nextMaintenance: "2024-06-18",
    alerts: [],
    tasks: [],
    flow: "storage",
  },
  {
    id: "logger-1",
    type: "logger-gateway",
    name: "Logger",
    x: 660,
    y: 140,
    status: "healthy",
    powerOutput: 0,
    healthScore: 96,
    lastMaintenance: "2024-01-22",
    nextMaintenance: "2024-07-22",
    alerts: [],
    tasks: [],
    flow: "monitoring",
  },
];

const generateMockTasks = (): Task[] => [
  {
    id: "task-1",
    componentId: "inv-2",
    title: "Temperature Sensor Check",
    priority: "high",
    assignee: "John Smith",
    dueDate: "2024-01-18",
    status: "pending",
    type: "inspection",
  },
  {
    id: "task-2",
    componentId: "inv-3",
    title: "DC Isolation Fault Repair",
    priority: "critical",
    assignee: "Sarah Johnson",
    dueDate: "2024-01-16",
    status: "in-progress",
    type: "repair",
  },
  {
    id: "task-3",
    componentId: "trk-1",
    title: "Tracker Calibration",
    priority: "medium",
    assignee: "Mike Wilson",
    dueDate: "2024-01-20",
    status: "pending",
    type: "maintenance",
  },
];

const generateMockRecommendations = (): AIRecommendation[] => [
  {
    id: "rec-1",
    priority: "high",
    title: "Clean Modules 14-22 within 3 days",
    description:
      "Dust accumulation detected on string combiners, clean within next 3 days to prevent 4% performance drop.",
    estimatedImpact: "4% performance loss prevention",
    timeframe: "3 days",
    componentIds: ["str-1", "str-2"],
    confidence: 94,
  },
  {
    id: "rec-2",
    priority: "critical",
    title: "Replace Inverter 1B cooling fan",
    description:
      "Prioritize replacement of Inverter 1B cooling fan within 5 days due to predicted thermal failure.",
    estimatedImpact: "Prevent 48h downtime",
    timeframe: "5 days",
    componentIds: ["inv-2"],
    confidence: 87,
  },
  {
    id: "rec-3",
    priority: "medium",
    title: "Schedule tracker maintenance",
    description:
      "Schedule preventive maintenance for Tracker Unit 1 to prevent mechanical degradation.",
    estimatedImpact: "2% efficiency improvement",
    timeframe: "10 days",
    componentIds: ["trk-1"],
    confidence: 76,
  },
];

const generateHistoricalData = () => {
  const data = [];
  for (let i = 0; i < 24; i++) {
    data.push({
      time: `${i.toString().padStart(2, "0")}:00`,
      power: Math.round(
        8000 + Math.sin((i * Math.PI) / 12) * 6000 + Math.random() * 1000,
      ),
      availability: Math.round(95 + Math.random() * 5),
      faults: Math.floor(Math.random() * 3),
      health: Math.round(85 + Math.random() * 10),
    });
  }
  return data;
};

export default function DigitalTwinOperationsCenter({
  plantId,
  onClose,
}: DigitalTwinProps) {
  const [components, setComponents] = useState<Component[]>(
    generateMockComponents(),
  );
  const [tasks, setTasks] = useState<Task[]>(generateMockTasks());
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(
    generateMockRecommendations(),
  );
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(
    null,
  );
  const [showPredictiveHeatmap, setShowPredictiveHeatmap] = useState(false);
  const [showTasks, setShowTasks] = useState(true);
  const [timeSlider, setTimeSlider] = useState([24]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [isCreateWorkOrderOpen, setIsCreateWorkOrderOpen] = useState(false);
  const [createWorkOrderData, setCreateWorkOrderData] = useState<{
    title: string;
    description: string;
    componentId?: string;
  }>({
    title: "",
    description: "",
  });

  // Zoom and Pan State
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Environmental Overlays
  const [showEnvironmental, setShowEnvironmental] = useState(false);
  const [showLiveFlow, setShowLiveFlow] = useState(true);
  const [showBessStatus, setShowBessStatus] = useState(false);

  const historicalData = generateHistoricalData();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeSlider((prev) => {
          const newValue = prev[0] > 0 ? prev[0] - 1 : 24;
          return [newValue];
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const getComponentStatusColor = (status: Component["status"]): string => {
    switch (status) {
      case "healthy":
        return "#10B981";
      case "warning":
        return "#F59E0B";
      case "fault":
        return "#EF4444";
      case "predicted-fault":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  const getComponentIcon = (type: Component["type"]) => {
    switch (type) {
      case "pv-strings":
        return <Sun className="w-4 h-4" />;
      case "combiner-box":
        return <Server className="w-4 h-4" />;
      case "inverter":
        return <Zap className="w-4 h-4" />;
      case "transformer":
        return <Power className="w-4 h-4" />;
      case "energy-meter":
        return <Gauge className="w-4 h-4" />;
      case "hvac":
        return <Wind className="w-4 h-4" />;
      case "weather-station":
        return <CloudSun className="w-4 h-4" />;
      case "bess":
        return <Battery className="w-4 h-4" />;
      case "tracker":
        return <Target className="w-4 h-4" />;
      case "logger-gateway":
        return <Radio className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getFlowColor = (flow: Component["flow"]): string => {
    switch (flow) {
      case "dc":
        return "#2563eb"; // Blue for DC
      case "ac":
        return "#dc2626"; // Red for AC
      case "storage":
        return "#7c3aed"; // Purple for Storage
      case "monitoring":
        return "#059669"; // Green for Monitoring
      default:
        return "#64748b";
    }
  };

  const handleCreateTask = (
    componentId: string,
    recommendation?: AIRecommendation,
  ) => {
    const component = components.find((c) => c.id === componentId);
    setCreateWorkOrderData({
      title: recommendation
        ? recommendation.title
        : `Maintenance Task - ${component?.name || "Component"}`,
      description: recommendation
        ? recommendation.description
        : `Maintenance task for ${component?.name || "component"} in the digital twin system.`,
      componentId,
    });
    setIsCreateWorkOrderOpen(true);
  };

  // Zoom and Pan Handlers
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      setPanX(prev => prev + deltaX / zoomLevel);
      setPanY(prev => prev + deltaY / zoomLevel);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const currentTime = timeSlider[0];
  const totalPower = components.reduce(
    (sum, comp) => sum + comp.powerOutput,
    0,
  );
  const availabilityScore = Math.round(
    (components.filter((c) => c.status !== "fault").length /
      components.length) *
      100,
  );
  const degradedComponents = components.filter(
    (c) => c.status === "warning",
  ).length;
  const activeFaults = components.filter((c) => c.status === "fault").length;
  const avgHealthScore = Math.round(
    components.reduce((sum, comp) => sum + comp.healthScore, 0) /
      components.length,
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex">
      <div className="w-full h-full bg-background flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-info/10 border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">
                Digital Twin Operations Center
              </h1>
              <p className="text-sm text-muted-foreground">
                Real-time plant visualization and AI-powered insights
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPredictiveHeatmap(!showPredictiveHeatmap)}
            >
              {showPredictiveHeatmap ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              Predictive Heatmap
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Real-Time Status Panel with Enhanced Metrics */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border-b p-4">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {totalPower.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Power (kW)
                  </div>
                  <div className="text-xs text-success font-medium">
                    ↑ 12.3% vs Yesterday
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">
                    {availabilityScore}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    System Availability
                  </div>
                  <div className="text-xs text-success font-medium">
                    Target: 99.5%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">
                    {degradedComponents}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Components w/ Issues
                  </div>
                  <div className="text-xs text-warning font-medium">
                    Needs Attention
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-destructive">
                    {activeFaults}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Critical Faults
                  </div>
                  <div className="text-xs text-destructive font-medium">
                    Immediate Action
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-info">
                    {avgHealthScore}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Avg Health Score
                  </div>
                  <div className="text-xs text-info font-medium">
                    Trending ↑
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {components.find(c => c.type === 'bess')?.powerOutput || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    BESS (kW)
                  </div>
                  <div className="text-xs text-purple-600 font-medium">
                    {(components.find(c => c.type === 'bess')?.powerOutput || 0) < 0 ? 'Charging' : 'Discharging'}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Plant Layout */}
            <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-auto">
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <Button variant="outline" size="sm" onClick={handleZoomIn}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleZoomOut}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleResetView}>
                  <Move className="w-4 h-4" />
                </Button>
                <div className="bg-white px-2 py-1 rounded text-xs font-medium">
                  {Math.round(zoomLevel * 100)}%
                </div>
              </div>
              <svg
                width="800"
                height="400"
                className="w-full h-full min-h-[400px] cursor-grab active:cursor-grabbing"
                viewBox="0 0 800 400"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <g transform={`translate(${panX}, ${panY}) scale(${zoomLevel})`}>
                  {/* Grid Background */}
                  <defs>
                  <pattern
                    id="grid"
                    width="50"
                    height="50"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 50 0 L 0 0 0 50"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Predictive Heatmap Overlay */}
                {showPredictiveHeatmap && (
                  <g>
                    {components
                      .filter((c) => c.aiPrediction)
                      .map((comp) => (
                        <circle
                          key={`heatmap-${comp.id}`}
                          cx={comp.x}
                          cy={comp.y}
                          r="40"
                          fill={
                            comp.aiPrediction!.failureProbability > 70
                              ? "#1e3a8a20"
                              : comp.aiPrediction!.failureProbability > 40
                                ? "#3b82f620"
                                : "#22d3ee20"
                          }
                          stroke={
                            comp.aiPrediction!.failureProbability > 70
                              ? "#1e3a8a"
                              : comp.aiPrediction!.failureProbability > 40
                                ? "#3b82f6"
                                : "#22d3ee"
                          }
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          className="animate-pulse"
                        />
                      ))}
                  </g>
                )}

                {/* Power Flow Connections with Directional Arrows */}
                <defs>
                  <marker
                    id="arrowhead-dc"
                    markerWidth="8"
                    markerHeight="6"
                    refX="8"
                    refY="3"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 8 3, 0 6"
                      fill="#3b82f6"
                    />
                  </marker>
                  <marker
                    id="arrowhead-ac"
                    markerWidth="8"
                    markerHeight="6"
                    refX="8"
                    refY="3"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 8 3, 0 6"
                      fill="#ef4444"
                    />
                  </marker>
                  <marker
                    id="arrowhead-storage"
                    markerWidth="8"
                    markerHeight="6"
                    refX="8"
                    refY="3"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 8 3, 0 6"
                      fill="#8b5cf6"
                    />
                  </marker>
                </defs>

                {/* DC Power Flow Lines */}
                <g>
                  {/* PV Arrays to Combiner Boxes */}
                  <line
                    x1="130"
                    y1="140"
                    x2="210"
                    y2="180"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead-dc)"
                    opacity="0.8"
                  />
                  <line
                    x1="130"
                    y1="220"
                    x2="210"
                    y2="200"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead-dc)"
                    opacity="0.8"
                  />
                  <line
                    x1="130"
                    y1="300"
                    x2="210"
                    y2="260"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead-dc)"
                    opacity="0.8"
                  />

                  {/* Combiner Boxes to Inverters */}
                  <line
                    x1="270"
                    y1="180"
                    x2="350"
                    y2="180"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    markerEnd="url(#arrowhead-dc)"
                    opacity="0.9"
                  />
                  <line
                    x1="270"
                    y1="260"
                    x2="350"
                    y2="260"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    markerEnd="url(#arrowhead-dc)"
                    opacity="0.9"
                  />
                </g>

                {/* AC Power Flow Lines */}
                <g>
                  {/* Inverters to Transformer */}
                  <line
                    x1="410"
                    y1="180"
                    x2="490"
                    y2="200"
                    stroke="#ef4444"
                    strokeWidth="3"
                    markerEnd="url(#arrowhead-ac)"
                    opacity="0.9"
                  />
                  <line
                    x1="410"
                    y1="260"
                    x2="490"
                    y2="240"
                    stroke="#ef4444"
                    strokeWidth="3"
                    markerEnd="url(#arrowhead-ac)"
                    opacity="0.9"
                  />

                  {/* Transformer to Grid Meter */}
                  <line
                    x1="550"
                    y1="220"
                    x2="630"
                    y2="220"
                    stroke="#ef4444"
                    strokeWidth="4"
                    markerEnd="url(#arrowhead-ac)"
                    opacity="0.9"
                  />

                  {/* Grid Connection */}
                  <line
                    x1="690"
                    y1="220"
                    x2="750"
                    y2="220"
                    stroke="#10b981"
                    strokeWidth="4"
                    strokeDasharray="6,3"
                    opacity="0.8"
                  />
                  <text
                    x="755"
                    y="225"
                    fontSize="10"
                    fill="#10b981"
                    fontWeight="600"
                  >
                    GRID
                  </text>
                </g>

                {/* Storage Connection */}
                <g>
                  <line
                    x1="520"
                    y1="180"
                    x2="520"
                    y2="160"
                    stroke="#8b5cf6"
                    strokeWidth="2"
                    strokeDasharray="4,2"
                    markerEnd="url(#arrowhead-storage)"
                    opacity="0.8"
                  />
                </g>

                {/* System Labels */}
                <g>
                  <text x="100" y="30" fontSize="10" fontWeight="600" fill="#3b82f6">DC GENERATION</text>
                  <text x="380" y="30" fontSize="10" fontWeight="600" fill="#ef4444">AC CONVERSION</text>
                  <text x="660" y="30" fontSize="10" fontWeight="600" fill="#10b981">GRID</text>
                  <text x="100" y="380" fontSize="10" fontWeight="600" fill="#6b7280">MONITORING</text>
                </g>

                {/* Environmental Overlays */}
                {showEnvironmental && (
                  <g>
                    {/* Temperature Zones */}
                    <circle cx="380" cy="220" r="60" fill="#fbbf24" fillOpacity="0.08" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,2" />
                    <text x="350" y="180" fontSize="8" fill="#f59e0b" fontWeight="500">TEMP ZONE</text>
                    <text x="355" y="190" fontSize="7" fill="#f59e0b">42°C Avg</text>

                    {/* Irradiance Overlay */}
                    <rect x="60" y="100" width="100" height="200" fill="#facc15" fillOpacity="0.1" stroke="#eab308" strokeWidth="1" strokeDasharray="4,2" />
                    <text x="65" y="350" fontSize="8" fill="#eab308" fontWeight="500">GHI: 850 W/m²</text>
                    <text x="65" y="360" fontSize="8" fill="#eab308" fontWeight="500">DNI: 920 W/m²</text>
                  </g>
                )}

                {/* Live Energy Flow Animation */}
                {showLiveFlow && (
                  <g>
                    {/* Animated Energy Particles */}
                    <circle cx="170" cy="165" r="2" fill="#3b82f6" className="animate-ping" opacity="0.6" />
                    <circle cx="310" cy="195" r="2" fill="#3b82f6" className="animate-ping" style={{animationDelay: '0.5s'}} opacity="0.6" />
                    <circle cx="450" cy="200" r="2" fill="#ef4444" className="animate-ping" style={{animationDelay: '1s'}} opacity="0.6" />
                    <circle cx="590" cy="220" r="2" fill="#ef4444" className="animate-ping" style={{animationDelay: '1.5s'}} opacity="0.6" />

                    {/* Power Flow Indicators */}
                    <text x="170" y="155" fontSize="7" fill="#3b82f6" fontWeight="500" className="animate-pulse">3.2MW</text>
                    <text x="450" y="185" fontSize="7" fill="#ef4444" fontWeight="500" className="animate-pulse">3.1MW</text>
                    <text x="590" y="205" fontSize="7" fill="#10b981" fontWeight="500" className="animate-pulse">3.0MW</text>
                  </g>
                )}

                {/* BESS Status Overlay */}
                {showBessStatus && (
                  <g>
                    {/* Battery Charge Level Indicator */}
                    <rect x="490" y="110" width="40" height="12" fill="none" stroke="#8b5cf6" strokeWidth="1" />
                    <rect x="491" y="111" width="30" height="10" fill="#8b5cf6" fillOpacity="0.5" />
                    <text x="485" y="105" fontSize="7" fill="#8b5cf6" fontWeight="500">SOC: 75%</text>
                    <text x="535" y="120" fontSize="6" fill="#8b5cf6">25°C</text>

                    {/* Charge/Discharge Arrow */}
                    <path d="M 520 180 L 520 165" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrowhead-storage)" className="animate-pulse" opacity="0.7" />
                  </g>
                )}

                {/* Components with Realistic Icons */}
                {components.map((component) => (
                  <g key={component.id}>
                    {/* Status Glow Ring */}
                    <circle
                      cx={component.x}
                      cy={component.y}
                      r="22"
                      fill="none"
                      stroke={getComponentStatusColor(component.status)}
                      strokeWidth="2"
                      strokeOpacity="0.3"
                      className={`${component.status === "fault" || component.status === "predicted-fault" ? "animate-pulse" : ""}`}
                    />

                    {/* Component Background */}
                    <rect
                      x={component.x - 16}
                      y={component.y - 16}
                      width="32"
                      height="32"
                      rx="6"
                      fill="#ffffff"
                      stroke={getComponentStatusColor(component.status)}
                      strokeWidth="2"
                      className={`cursor-pointer transition-all duration-300 hover:scale-105 shadow-sm ${
                        component.status === "predicted-fault"
                          ? "animate-pulse"
                          : ""
                      }`}
                      onClick={() => setSelectedComponent(component)}
                    />

                    {/* Component Icon */}
                    <foreignObject
                      x={component.x - 8}
                      y={component.y - 8}
                      width="16"
                      height="16"
                      className="pointer-events-none"
                    >
                      <div
                        style={{
                          color: getFlowColor(component.flow),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        {getComponentIcon(component.type)}
                      </div>
                    </foreignObject>

                    {/* Task Indicators */}
                    {showTasks &&
                      tasks.filter(
                        (t) =>
                          t.componentId === component.id &&
                          t.status !== "completed",
                      ).length > 0 && (
                        <circle
                          cx={component.x + 12}
                          cy={component.y - 12}
                          r="4"
                          fill="#3b82f6"
                          stroke="#ffffff"
                          strokeWidth="1"
                        />
                      )}

                    {/* Alert Indicators */}
                    {component.alerts.length > 0 && (
                      <circle
                        cx={component.x - 12}
                        cy={component.y - 12}
                        r="4"
                        fill="#ef4444"
                        stroke="#ffffff"
                        strokeWidth="1"
                        className="animate-pulse"
                      />
                    )}

                    {/* Component Label */}
                    <text
                      x={component.x}
                      y={component.y + 30}
                      textAnchor="middle"
                      fontSize="8"
                      fill="#374151"
                      className="pointer-events-none select-none font-medium"
                    >
                      {component.name}
                    </text>

                    {/* Power Output Display */}
                    {component.powerOutput !== 0 && (
                      <text
                        x={component.x}
                        y={component.y + 42}
                        textAnchor="middle"
                        fontSize="7"
                        fill={component.flow === "storage" && component.powerOutput < 0 ? "#8b5cf6" : "#10b981"}
                        className="pointer-events-none select-none font-medium"
                      >
                        {component.powerOutput > 0 ? "+" : ""}{Math.abs(component.powerOutput) > 1000 ? (component.powerOutput/1000).toFixed(1) + "MW" : component.powerOutput + "kW"}
                      </text>
                    )}
                  </g>
                ))}
                </g>
              </svg>

              {/* Environmental Overlays Toggle */}
              <div className="absolute bottom-4 left-4 z-10 flex gap-2">
                <Button
                  variant={showEnvironmental ? "default" : "outline"}
                  size="sm"
                  className="bg-white/90"
                  onClick={() => setShowEnvironmental(!showEnvironmental)}
                >
                  <Thermometer className="w-4 h-4 mr-1" />
                  Environmental
                </Button>
                <Button
                  variant={showLiveFlow ? "default" : "outline"}
                  size="sm"
                  className="bg-white/90"
                  onClick={() => setShowLiveFlow(!showLiveFlow)}
                >
                  <Activity className="w-4 h-4 mr-1" />
                  Live Flow
                </Button>
                <Button
                  variant={showBessStatus ? "default" : "outline"}
                  size="sm"
                  className="bg-white/90"
                  onClick={() => setShowBessStatus(!showBessStatus)}
                >
                  <Battery className="w-4 h-4 mr-1" />
                  BESS Status
                </Button>
              </div>

              {/* System Flow Legend */}
              <div className="absolute bottom-4 right-4 z-10 bg-white/95 p-2 rounded-md border shadow-sm">
                <div className="text-xs font-medium mb-1.5 text-gray-700">Power Flow</div>
                <div className="space-y-0.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-blue-500 rounded"></div>
                    <span className="text-gray-600">DC</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-red-500 rounded"></div>
                    <span className="text-gray-600">AC</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-purple-500 rounded border-dashed border border-purple-500"></div>
                    <span className="text-gray-600">Storage</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-green-500 rounded border-dashed border border-green-500"></div>
                    <span className="text-gray-600">Grid</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Historical Playback Slider */}
            <div className="bg-muted/30 border-t p-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTimeSlider([24])}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-2">
                    Time:{" "}
                    {currentTime === 24
                      ? "Current"
                      : `${currentTime}:00 hours ago`}
                  </div>
                  <Slider
                    value={timeSlider}
                    onValueChange={setTimeSlider}
                    max={24}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-80 border-l bg-background flex flex-col">
            {/* KPI Trends */}
            <div className="p-4 border-b">
              <h3 className="font-semibold text-sm mb-3">
                Real-Time KPI Trends
              </h3>
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={historicalData.slice(-12)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="power"
                    stroke="#F5C842"
                    fill="#F5C84220"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="availability"
                    stroke="#10B981"
                    fill="#10B98120"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* AI Recommendations */}
            {showRecommendations && (
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      AI Recommendations
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowRecommendations(false)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {recommendations.map((rec) => (
                      <div key={rec.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            variant={
                              rec.priority === "critical"
                                ? "destructive"
                                : rec.priority === "high"
                                  ? "warning"
                                  : rec.priority === "medium"
                                    ? "secondary"
                                    : "outline"
                            }
                          >
                            {rec.priority.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {rec.confidence}% confidence
                          </span>
                        </div>
                        <div className="text-sm font-medium mb-1">
                          {rec.title}
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {rec.description}
                        </div>
                        <div className="text-xs text-info mb-2">
                          Impact: {rec.estimatedImpact}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Timeline: {rec.timeframe}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleCreateTask(rec.componentIds[0], rec)
                            }
                            className="h-6 text-xs"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Create Task
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Task Management */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Wrench className="w-4 h-4" />
                      Active Tasks
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTasks(!showTasks)}
                    >
                      <Filter className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {tasks
                      .filter((t) => t.status !== "completed")
                      .map((task) => (
                        <div key={task.id} className="p-2 border rounded">
                          <div className="flex items-center justify-between mb-1">
                            <Badge
                              variant={
                                task.priority === "critical"
                                  ? "destructive"
                                  : task.priority === "high"
                                    ? "warning"
                                    : task.priority === "medium"
                                      ? "secondary"
                                      : "outline"
                              }
                              className="text-xs"
                            >
                              {task.priority.toUpperCase()}
                            </Badge>
                            <Badge
                              variant={
                                task.status === "in-progress"
                                  ? "info"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {task.status.replace("-", " ").toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-xs font-medium mb-1">
                            {task.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Assignee: {task.assignee}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Component Detail Side Panel */}
        {selectedComponent && (
          <div className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-2xl z-10 overflow-y-auto">
            <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-info/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedComponent.name}
                  </h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedComponent.type} Component
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedComponent(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-6">
              {/* Component Status */}
              <div>
                <h4 className="font-medium mb-3">Current Status</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground">
                      Power Output
                    </div>
                    <div className="text-lg font-semibold">
                      {selectedComponent.powerOutput} kW
                    </div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground">
                      Health Score
                    </div>
                    <div className="text-lg font-semibold">
                      {selectedComponent.healthScore}/100
                    </div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground">
                      Last Maintenance
                    </div>
                    <div className="text-sm font-medium">
                      {selectedComponent.lastMaintenance}
                    </div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground">
                      Next Maintenance
                    </div>
                    <div className="text-sm font-medium">
                      {selectedComponent.nextMaintenance}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Prediction */}
              {selectedComponent.aiPrediction && (
                <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-warning" />
                    AI Failure Prediction
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Failure Probability:</span>
                      <span className="font-medium text-warning">
                        {selectedComponent.aiPrediction.failureProbability}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Time to Failure:</span>
                      <span className="font-medium">
                        {selectedComponent.aiPrediction.timeToFailure} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">AI Confidence:</span>
                      <span className="font-medium">
                        {selectedComponent.aiPrediction.confidence}%
                      </span>
                    </div>
                    <Progress
                      value={selectedComponent.aiPrediction.failureProbability}
                      className="mt-2"
                    />
                  </div>
                </div>
              )}

              {/* Active Alerts */}
              {selectedComponent.alerts.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    Active Alerts
                  </h4>
                  <div className="space-y-2">
                    {selectedComponent.alerts.map((alert, index) => (
                      <div
                        key={index}
                        className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                      >
                        <div className="text-sm font-medium text-destructive">
                          {alert}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Open Tasks */}
              {selectedComponent.tasks.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-info" />
                    Open Tasks
                  </h4>
                  <div className="space-y-2">
                    {selectedComponent.tasks.map((task, index) => (
                      <div
                        key={index}
                        className="p-3 bg-info/10 border border-info/20 rounded-lg"
                      >
                        <div className="text-sm font-medium text-info">
                          {task}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Operational History */}
              <div>
                <h4 className="font-medium mb-3">Operational History</h4>
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={historicalData.slice(-12)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="power"
                      stroke="#F5C842"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="health"
                      stroke="#10B981"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Quick Actions */}
              <div>
                <h4 className="font-medium mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => handleCreateTask(selectedComponent.id)}
                  >
                    <Plus className="w-4 h-4" />
                    Create Maintenance Task
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule Inspection
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    View Technical Documentation
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Work Order Create Dialog */}
      <WorkOrderCreateDialog
        open={isCreateWorkOrderOpen}
        onOpenChange={setIsCreateWorkOrderOpen}
        defaultAssetId={plantId}
        defaultTitle={createWorkOrderData.title}
        defaultDescription={createWorkOrderData.description}
        onWorkOrderCreated={(workOrder) => {
          console.log("Digital twin maintenance task created:", workOrder);
          setIsCreateWorkOrderOpen(false);
        }}
      />
    </div>
  );
}
