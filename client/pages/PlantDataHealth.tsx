import { useState, useEffect } from "react";
import { Plant } from "@shared/interface";
import PlantNavigation from '@/components/PlantNavigation';
import { useAlert } from "@/hooks/use-alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Database,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Server,
  Router,
  HardDrive,
  Zap,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertOctagon,
  Target,
  Calendar,
  Download,
  Filter,
  Eye,
  User,
  Settings,
  MessageSquare,
  FileText,
  Plus,
  Wrench,
  Bot,
} from "lucide-react";
import WorkOrderCreateDialog from "@/components/WorkOrderCreateDialog";

interface APIConnection {
  id: string;
  name: string;
  type: "SCADA" | "FTP" | "CRM" | "Inventory" | "Weather" | "Grid";
  status: "stable" | "warning" | "disconnected";
  dataFlowRate: number; // records per minute
  lastSuccessfulCall: string;
  errorCode?: string;
  uptime24h: number;
  uptime7d: number;
  responseTime: number; // milliseconds
  endpoint: string;
}

interface DataLogger {
  id: string;
  name: string;
  plantLocation: string;
  healthScore: number;
  captureFrequency: number; // seconds
  expectedFrequency: number; // seconds
  packetLossPercentage: number;
  syncDelay: number; // seconds
  lastMaintenance: string;
  lastReboot: string;
  status: "healthy" | "warning" | "critical" | "offline";
  packetsReceived: number;
  expectedPackets: number;
}

interface DataFlowEvent {
  id: string;
  timestamp: string;
  type: "api_failure" | "logger_issue" | "sync_error" | "maintenance";
  source: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  status: "acknowledged" | "resolved" | "pending";
  handledBy?: string;
  aiAnalysis: string;
  resolutionTime?: number;
}

interface AIRecommendation {
  id: string;
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  component: string;
  failureProbability: number;
  timeframe: string;
  financialImpact?: number;
  downtimeRisk: number;
  suggestedActions: string[];
}

const generateMockAPIConnections = (): APIConnection[] => [
  {
    id: "api-scada-1",
    name: "Primary SCADA Interface",
    type: "SCADA",
    status: "stable",
    dataFlowRate: 156,
    lastSuccessfulCall: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    uptime24h: 99.8,
    uptime7d: 98.5,
    responseTime: 45,
    endpoint: "scada.plant-a.solar.com",
  },
  {
    id: "api-ftp-1",
    name: "Data Export FTP Server",
    type: "FTP",
    status: "warning",
    dataFlowRate: 12,
    lastSuccessfulCall: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    errorCode: "TIMEOUT_ERROR",
    uptime24h: 94.2,
    uptime7d: 96.8,
    responseTime: 2340,
    endpoint: "ftp.databackup.solar.com",
  },
  {
    id: "api-crm-1",
    name: "Customer Management API",
    type: "CRM",
    status: "stable",
    dataFlowRate: 8,
    lastSuccessfulCall: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    uptime24h: 100,
    uptime7d: 99.9,
    responseTime: 120,
    endpoint: "api.crm.solar.com/v2",
  },
  {
    id: "api-inv-1",
    name: "Inventory Management",
    type: "Inventory",
    status: "disconnected",
    dataFlowRate: 0,
    lastSuccessfulCall: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    errorCode: "CONNECTION_REFUSED",
    uptime24h: 76.5,
    uptime7d: 88.3,
    responseTime: 0,
    endpoint: "inventory.solar.com/api",
  },
  {
    id: "api-weather-1",
    name: "Weather Data Service",
    type: "Weather",
    status: "stable",
    dataFlowRate: 24,
    lastSuccessfulCall: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    uptime24h: 99.2,
    uptime7d: 97.8,
    responseTime: 180,
    endpoint: "weather.api.solar.com",
  },
  {
    id: "api-grid-1",
    name: "Grid Connection Monitor",
    type: "Grid",
    status: "warning",
    dataFlowRate: 45,
    lastSuccessfulCall: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    errorCode: "RATE_LIMIT_EXCEEDED",
    uptime24h: 91.7,
    uptime7d: 94.2,
    responseTime: 890,
    endpoint: "grid.monitoring.solar.com",
  },
];

const generateMockDataLoggers = (): DataLogger[] => [
  {
    id: "logger-1a",
    name: "Logger Block A",
    plantLocation: "Inverter Station 1",
    healthScore: 95,
    captureFrequency: 30,
    expectedFrequency: 30,
    packetLossPercentage: 0.2,
    syncDelay: 0.5,
    lastMaintenance: "2024-01-08",
    lastReboot: "2024-01-12",
    status: "healthy",
    packetsReceived: 2876,
    expectedPackets: 2880,
  },
  {
    id: "logger-2b",
    name: "Logger Block B",
    plantLocation: "String Combiner Bay",
    healthScore: 67,
    captureFrequency: 35,
    expectedFrequency: 30,
    packetLossPercentage: 5.8,
    syncDelay: 12.3,
    lastMaintenance: "2023-12-15",
    lastReboot: "2024-01-14",
    status: "warning",
    packetsReceived: 2654,
    expectedPackets: 2820,
  },
];

const generateMockDataFlowEvents = (): DataFlowEvent[] => [
  {
    id: "event-001",
    timestamp: "2024-01-15T14:30:00Z",
    type: "api_failure",
    source: "Inventory Management API",
    severity: "high",
    description: "Connection timeout - service unresponsive for 2 hours",
    status: "pending",
    aiAnalysis:
      "Network connectivity issue detected. Firewall rules may have changed or service crashed.",
  },
  {
    id: "event-002",
    timestamp: "2024-01-15T12:15:00Z",
    type: "logger_issue",
    source: "Logger Block D",
    severity: "critical",
    description: "Irregular packet delivery and high sync delays",
    status: "acknowledged",
    handledBy: "John Smith (Technician)",
    aiAnalysis:
      "Hardware degradation pattern detected. Logger cleaning or firmware update recommended.",
  },
  {
    id: "event-003",
    timestamp: "2024-01-15T09:45:00Z",
    type: "sync_error",
    source: "FTP Data Export",
    severity: "medium",
    description: "Data synchronization delays exceeding threshold",
    status: "resolved",
    handledBy: "Sarah Johnson (Engineer)",
    resolutionTime: 45,
    aiAnalysis:
      "Bandwidth congestion during peak hours. Schedule optimization implemented.",
  },
  {
    id: "event-004",
    timestamp: "2024-01-15T08:00:00Z",
    type: "maintenance",
    source: "Logger Block E",
    severity: "high",
    description: "Scheduled maintenance - system offline",
    status: "resolved",
    handledBy: "Mike Wilson (Maintenance)",
    resolutionTime: 120,
    aiAnalysis:
      "Planned maintenance completed successfully. System restored to normal operation.",
  },
];

const generateMockAIRecommendations = (): AIRecommendation[] => [
  {
    id: "ai-rec-001",
    priority: "critical",
    title: "Logger 4D predicted to fail within 5 days",
    description:
      "Intermittent disruptions and increasing packet loss indicate imminent hardware failure",
    component: "Logger Block D",
    failureProbability: 87,
    timeframe: "5 days",
    financialImpact: 15000,
    downtimeRisk: 72,
    suggestedActions: [
      "Schedule immediate technician visit",
      "Prepare backup logger for deployment",
      "Check physical connections and power supply",
      "Consider firmware update if hardware is stable",
    ],
  },
  {
    id: "ai-rec-002",
    priority: "high",
    title: "API rate limiting causing data delays",
    description:
      "Grid monitoring API hitting rate limits during peak data collection periods",
    component: "Grid Connection Monitor API",
    failureProbability: 65,
    timeframe: "3 days",
    downtimeRisk: 45,
    suggestedActions: [
      "Implement data collection throttling",
      "Negotiate higher rate limits with provider",
      "Cache non-critical data queries",
      "Distribute load across multiple endpoints",
    ],
  },
  {
    id: "ai-rec-003",
    priority: "medium",
    title: "FTP backup optimization needed",
    description:
      "Data export performance degrading due to increased file sizes",
    component: "Data Export FTP Server",
    failureProbability: 42,
    timeframe: "7 days",
    financialImpact: 3000,
    downtimeRisk: 28,
    suggestedActions: [
      "Implement data compression",
      "Archive older files automatically",
      "Consider upgrading server storage",
      "Optimize transfer scheduling",
    ],
  },
];

const generateHistoricalDataFlow = () => {
  const data = [];
  for (let i = 0; i < 24; i++) {
    const hour = new Date();
    hour.setHours(hour.getHours() - (23 - i));
    data.push({
      time: hour.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      apiUptime: Math.round(85 + Math.random() * 15),
      loggerStability: Math.round(80 + Math.random() * 20),
      dataCompleteness: Math.round(90 + Math.random() * 10),
      packetLoss: Math.round(Math.random() * 5),
    });
  }
  return data;
};

const generateLoggerTimeSeries = (loggerId: string) => {
  const data = [];
  for (let i = 0; i < 48; i++) {
    const time = new Date();
    time.setMinutes(time.getMinutes() - (47 - i) * 30);
    const isHealthy = loggerId !== "logger-4d" && loggerId !== "logger-5e";
    data.push({
      time: time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      packets: isHealthy
        ? Math.round(55 + Math.random() * 10)
        : loggerId === "logger-5e"
          ? 0
          : Math.round(25 + Math.random() * 20),
      expected: 60,
      status: isHealthy
        ? "normal"
        : loggerId === "logger-5e"
          ? "offline"
          : "degraded",
    });
  }
  return data;
};

export default function PlantDataHealth() {
  const [plant, setPlant] = useState<Plant | null>(() => {
    const raw = localStorage.getItem('selectedPlant');
    return raw ? (JSON.parse(raw) as Plant) : null;
  });
  const [isCreateWorkOrderOpen, setIsCreateWorkOrderOpen] = useState(false);
  const [apis, setApis] = useState<APIConnection[]>(
    generateMockAPIConnections(),
  );
  const [loggers, setLoggers] = useState<DataLogger[]>(
    generateMockDataLoggers(),
  );
  const [events, setEvents] = useState<DataFlowEvent[]>(
    generateMockDataFlowEvents(),
  );
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(
    generateMockAIRecommendations(),
  );
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h");
  const [selectedLogger, setSelectedLogger] = useState<string | null>(null);

  const historicalData = generateHistoricalDataFlow();

  useEffect(() => {
    const raw = localStorage.getItem('selectedPlant');
    setPlant(raw ? (JSON.parse(raw) as Plant) : null);
  }, []);

  if (!plant) {
    return <div>Plant not found</div>;
  }

  const getAPIStatusColor = (status: APIConnection["status"]) => {
    switch (status) {
      case "stable":
        return "success";
      case "warning":
        return "warning";
      case "disconnected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getLoggerStatusColor = (status: DataLogger["status"]) => {
    switch (status) {
      case "healthy":
        return "success";
      case "warning":
        return "warning";
      case "critical":
        return "destructive";
      case "offline":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getEventSeverityColor = (severity: DataFlowEvent["severity"]) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "warning";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getPriorityColor = (priority: AIRecommendation["priority"]) => {
    switch (priority) {
      case "critical":
        return "destructive";
      case "high":
        return "warning";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "secondary";
    }
  };
  const handleSelectLogger = (loggerId: string) => {
    console.log('Selecting logger:', loggerId);
    setSelectedLogger(loggerId);
    alert.success(`Selected logger: ${loggerId}`);
  };

  const handleMarkAsServiced = (loggerId: string) => {
    alert.featureUnderConstruction('Marking logger as serviced');
    setLoggers((prev) =>
      prev.map((logger) =>
        logger.id === loggerId
          ? {
              ...logger,
              lastMaintenance: new Date().toISOString().split("T")[0],
              healthScore: Math.min(logger.healthScore + 20, 100),
              status:
                logger.status === "critical"
                  ? "warning"
                  : logger.status === "warning"
                    ? "healthy"
                    : logger.status,
            }
          : logger,
      ),
    );
  };

  const handleAcknowledgeEvent = (eventId: string) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId
          ? { ...event, status: "acknowledged", handledBy: "Current User" }
          : event,
      ),
    );
  };

  const alert = useAlert();

  const handleExportReport = () => {
    // Generate and download data health report
    alert.featureUnderConstruction('Data health report export');
  };
  const totalAPIs = apis.length;
  const stableAPIs = apis.filter((api) => api.status === "stable").length;
  const avgUptime =
    apis.reduce((sum, api) => sum + api.uptime24h, 0) / apis.length;
  const totalLoggers = loggers.length;
  const healthyLoggers = loggers.filter(
    (logger) => logger.status === "healthy",
  ).length;
  const avgLoggerHealth =
    loggers.reduce((sum, logger) => sum + logger.healthScore, 0) /
    loggers.length;
  const pendingEvents = events.filter(
    (event) => event.status === "pending",
  ).length;

  return (
    <div className="flex flex-col h-full">
      <PlantNavigation />

      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {plant.name} - Data Health Monitor
            </h1>
            <p className="text-muted-foreground">
              Real-time monitoring of API connectivity, data loggers, and data
              flow integrity
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={selectedTimeRange}
              onValueChange={setSelectedTimeRange}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExportReport}>
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    API Connections
                  </div>
                  <div className="text-2xl font-bold">{totalAPIs}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Wifi className="w-5 h-5 text-success" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    APIs Stable
                  </div>
                  <div className="text-2xl font-bold text-success">
                    {stableAPIs}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-info" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Avg Uptime 24h
                  </div>
                  <div className="text-2xl font-bold">
                    {avgUptime.toFixed(1)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <HardDrive className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Data Loggers
                  </div>
                  <div className="text-2xl font-bold">{totalLoggers}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Loggers Healthy
                  </div>
                  <div className="text-2xl font-bold text-success">
                    {healthyLoggers}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Pending Events
                  </div>
                  <div className="text-2xl font-bold text-warning">
                    {pendingEvents}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Banner */}
        <Card className="bg-gradient-to-r from-primary/5 to-info/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  AI Data Health Insights
                </h3>
                <div className="text-sm mb-3">
                  <strong>Critical Finding:</strong> API connectivity stable,
                  but data input rate from Grid Monitor API has decreased by 28%
                  over past 2 hours. Logger Block D showing irregular packet
                  delivery - cleaning or firmware update recommended.
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="bg-yellow-50 text-yellow-700 border-yellow-200"
                  >
                    Check Grid API connection at Site A
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    Restart API handler service
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    Schedule Logger D maintenance
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-Time API Status Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              Real-Time API Status Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-sm">
                      API Name
                    </th>
                    <th className="text-left p-4 font-medium text-sm">Type</th>
                    <th className="text-left p-4 font-medium text-sm">
                      Status
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Data Flow Rate
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Last Call
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Response Time
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Uptime 24h
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Uptime 7d
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Error Code
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {apis.map((api) => (
                    <tr key={api.id} className="border-t hover:bg-muted/30">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{api.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {api.endpoint}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">{api.type}</Badge>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={getAPIStatusColor(api.status) as any}
                          className="gap-1"
                        >
                          {api.status === "stable" ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : api.status === "warning" ? (
                            <AlertTriangle className="w-3 h-3" />
                          ) : (
                            <WifiOff className="w-3 h-3" />
                          )}
                          {api.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm">
                        {api.dataFlowRate} rec/min
                      </td>
                      <td className="p-4 text-sm">
                        {new Date(api.lastSuccessfulCall).toLocaleString()}
                      </td>
                      <td className="p-4 text-sm">{api.responseTime}ms</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Progress
                            value={api.uptime24h}
                            className="w-16 h-2"
                          />
                          <span className="text-sm font-medium">
                            {api.uptime24h}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Progress value={api.uptime7d} className="w-16 h-2" />
                          <span className="text-sm font-medium">
                            {api.uptime7d}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        {api.errorCode ? (
                          <Badge
                            variant="destructive"
                            className="font-mono text-xs"
                          >
                            {api.errorCode}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Data Logger Performance Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-primary" />
              Data Logger Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Logger Status Cards */}
              <div className="lg:col-span-2 space-y-4">
                {loggers.map((logger) => (
                  <div key={logger.id} className={`p-4 border rounded-lg transition-all duration-200 ${
                    selectedLogger === logger.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50/50 border-blue-300' 
                      : 'hover:bg-muted/30'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {logger.name}
                          {selectedLogger === logger.id && (
                            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                              Selected
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {logger.plantLocation}
                        </div>
                      </div>
                      <Badge
                        variant={getLoggerStatusColor(logger.status) as any}
                      >
                        {logger.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Health Score
                        </div>
                        <div className="font-semibold">
                          {logger.healthScore}/100
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Packet Loss
                        </div>
                        <div className="font-semibold">
                          {logger.packetLossPercentage}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Sync Delay
                        </div>
                        <div className="font-semibold">{logger.syncDelay}s</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Data Rate
                        </div>
                        <div className="font-semibold">
                          {logger.captureFrequency}s /{" "}
                          {logger.expectedFrequency}s
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Last Maintenance: {logger.lastMaintenance} | Packets:{" "}
                        {logger.packetsReceived}/{logger.expectedPackets}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleSelectLogger(logger.id);
                          }}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View Details
                        </Button>
                        {logger.status !== "healthy" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleMarkAsServiced(logger.id)}
                          >
                            <Wrench className="w-3 h-3 mr-1" />
                            Mark Serviced
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Logger Performance Chart */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Data Packets Over Time</h4>
                  {selectedLogger && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLogger(null)}
                      className="text-xs"
                    >
                      Clear Selection
                    </Button>
                  )}
                </div>
                {selectedLogger ? (
                  <div>
                    <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                      <strong>Selected Logger:</strong> {selectedLogger}
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={generateLoggerTimeSeries(selectedLogger)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" fontSize={10} />
                        <YAxis fontSize={10} />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="expected"
                          stroke="#E5E7EB"
                          fill="#F3F4F6"
                          name="Expected"
                        />
                        <Area
                          type="monotone"
                          dataKey="packets"
                          stroke="#10B981"
                          fill="#10B98120"
                          name="Received"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <Activity className="w-8 h-8 mx-auto mb-2" />
                      <div className="text-sm">
                        Select a logger to view performance
                      </div>
                    </div>
                  </div>
                )}
                {selectedLogger && (
                  <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm font-medium mb-2">AI Analysis</div>
                    <div className="text-xs text-muted-foreground">
                      {selectedLogger === "logger-4d"
                        ? "Logger showing irregular packet delivery; cleaning or firmware update recommended."
                        : selectedLogger === "logger-5e"
                          ? "Logger offline - immediate technician intervention required."
                          : "Logger performance within normal parameters."}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Historical Data Flow Analyzer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Historical Data Flow Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                
                <Line
                  type="monotone"
                  dataKey="apiUptime"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="API Uptime %"
                />
                <Line
                  type="monotone"
                  dataKey="loggerStability"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Logger Stability %"
                />
                <Line
                  type="monotone"
                  dataKey="dataCompleteness"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  name="Data Completeness %"
                />
                <Line
                  type="monotone"
                  dataKey="packetLoss"
                  stroke="#EF4444"
                  strokeWidth={2}
                  name="Packet Loss %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Recommendations & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                AI-Powered Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={getPriorityColor(rec.priority) as any}>
                        {rec.priority.toUpperCase()}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {rec.failureProbability}% probability
                      </div>
                    </div>
                    <div className="font-medium mb-1">{rec.title}</div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {rec.description}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div>
                        <span className="text-muted-foreground">
                          Timeframe:
                        </span>{" "}
                        {rec.timeframe}
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Downtime Risk:
                        </span>{" "}
                        {rec.downtimeRisk}%
                      </div>
                      {rec.financialImpact && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">
                            Financial Impact:
                          </span>{" "}
                          ${rec.financialImpact.toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-medium">
                        Suggested Actions:
                      </div>
                      {rec.suggestedActions.slice(0, 2).map((action, index) => (
                        <div
                          key={index}
                          className="text-xs text-muted-foreground flex items-start gap-1"
                        >
                          <div className="w-1 h-1 bg-muted-foreground rounded-full mt-1.5 flex-shrink-0" />
                          {action}
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => setIsCreateWorkOrderOpen(true)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Create Maintenance Task
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alerts & Actions Log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-primary" />
                Alerts & Actions Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge
                        variant={getEventSeverityColor(event.severity) as any}
                      >
                        {event.severity.toUpperCase()}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="font-medium text-sm mb-1">
                      {event.source}
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {event.description}
                    </div>
                    <div className="text-xs bg-muted/30 p-2 rounded mb-2">
                      <span className="font-medium">AI Analysis:</span>{" "}
                      {event.aiAnalysis}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs">
                        Status:{" "}
                        <Badge
                          variant={
                            event.status === "resolved"
                              ? "success"
                              : event.status === "acknowledged"
                                ? "warning"
                                : "secondary"
                          }
                        >
                          {event.status.toUpperCase()}
                        </Badge>
                        {event.handledBy && (
                          <span className="ml-2 text-muted-foreground">
                            by {event.handledBy}
                          </span>
                        )}
                      </div>
                      {event.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcknowledgeEvent(event.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Work Order Create Dialog */}
      <WorkOrderCreateDialog
        open={isCreateWorkOrderOpen}
        onOpenChange={setIsCreateWorkOrderOpen}
        defaultAssetId={plant?.id as any}
        defaultTitle="Data Health Maintenance Task"
        onWorkOrderCreated={(workOrder) => {
          console.log("Data health maintenance task created:", workOrder);
        }}
      />
    </div>
  );
}
