import { useState, useMemo } from "react";
import { generateMockAlerts } from "@shared/solar-data";
import { Alert } from "@shared/interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAlert } from "@/hooks/use-alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterBar, createGlobalAlertFilterConfig } from "@/components/ui/filter-bar";
import {
  LineChart,
  Line,
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
  AlertTriangle,
  Search,
  Filter,
  Download,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  X,
  FileText,
  Target,
  Activity,
  Settings,
  User,
  MapPin,
  Thermometer,
  Zap,
  ExternalLink,
  FileDown,
  Wrench,
  UserPlus,
  Calendar as CalendarIcon,
  Phone,
  Star,
  BarChart2,
  ChevronRight,
} from "lucide-react";

interface RoleAssignment {
  id: string;
  name: string;
  title: string;
  competencyLevel: number;
  activeWorkOrders: number;
  maxCapacity: number;
  contactPhone: string;
  availability: {
    today: boolean;
    tomorrow: boolean;
    thisWeek: number; // days available this week
  };
  specialties: string[];
  avatar: string;
}

const generateRoleAssignments = (): RoleAssignment[] => [
  {
    id: "se-1",
    name: "Sarah Chen",
    title: "Senior Engineer",
    competencyLevel: 95,
    activeWorkOrders: 3,
    maxCapacity: 8,
    contactPhone: "+91 98765 43210",
    availability: {
      today: true,
      tomorrow: true,
      thisWeek: 5,
    },
    specialties: [
      "High Voltage Systems",
      "Grid Integration",
      "Safety Protocols",
    ],
    avatar: "SC",
  },
  {
    id: "se-2",
    name: "Rajesh Kumar",
    title: "Senior Engineer",
    competencyLevel: 92,
    activeWorkOrders: 5,
    maxCapacity: 8,
    contactPhone: "+91 98765 43211",
    availability: {
      today: false,
      tomorrow: true,
      thisWeek: 4,
    },
    specialties: [
      "Inverter Systems",
      "Performance Analysis",
      "Root Cause Analysis",
    ],
    avatar: "RK",
  },
  {
    id: "je-1",
    name: "Priya Sharma",
    title: "Junior Engineer",
    competencyLevel: 78,
    activeWorkOrders: 2,
    maxCapacity: 6,
    contactPhone: "+91 98765 43212",
    availability: {
      today: true,
      tomorrow: true,
      thisWeek: 5,
    },
    specialties: ["Data Analysis", "Preventive Maintenance", "Documentation"],
    avatar: "PS",
  },
  {
    id: "je-2",
    name: "Amit Patel",
    title: "Junior Engineer",
    competencyLevel: 82,
    activeWorkOrders: 4,
    maxCapacity: 6,
    contactPhone: "+91 98765 43213",
    availability: {
      today: true,
      tomorrow: false,
      thisWeek: 3,
    },
    specialties: [
      "String Diagnostics",
      "Thermal Analysis",
      "Component Testing",
    ],
    avatar: "AP",
  },
  {
    id: "ft-1",
    name: "Mohamed Ali",
    title: "Field Technician",
    competencyLevel: 88,
    activeWorkOrders: 1,
    maxCapacity: 4,
    contactPhone: "+91 98765 43214",
    availability: {
      today: true,
      tomorrow: true,
      thisWeek: 6,
    },
    specialties: ["Module Cleaning", "Connector Maintenance", "Basic Repairs"],
    avatar: "MA",
  },
  {
    id: "ft-2",
    name: "Vikram Singh",
    title: "Field Technician",
    competencyLevel: 85,
    activeWorkOrders: 2,
    maxCapacity: 4,
    contactPhone: "+91 98765 43215",
    availability: {
      today: false,
      tomorrow: true,
      thisWeek: 4,
    },
    specialties: [
      "Tracker Systems",
      "Electrical Connections",
      "Safety Compliance",
    ],
    avatar: "VS",
  },
];

interface GlobalAlertDetailData {
  metadata: {
    alertId: string;
    plantId: string;
    plantName: string;
    component: string;
    severity: string;
    status: string;
    timestamp: string;
    estimatedDuration?: number;
  };
  impactAnalysis: {
    affectedCapacity: number;
    estimatedEnergyLoss: number;
    financialImpact: number;
    cascadingEffects: string[];
  };
  technicalDetails: {
    componentSpecs: {
      model: string;
      capacity: string;
      installationDate: string;
      lastMaintenance: string;
    };
    diagnostics: {
      voltage?: number;
      current?: number;
      temperature?: number;
      resistance?: number;
    };
    errorCodes: string[];
  };
  resolutionPlan: {
    immediateActions: string[];
    longTermActions: string[];
    requiredPersonnel: string[];
    estimatedResolutionTime: number;
  };
  similarIncidents: Array<{
    date: string;
    component: string;
    resolution: string;
    duration: number;
  }>;
}

// Generate extended mock alerts for global view
const generateExtendedMockAlerts = (): Alert[] => [
  ...generateMockAlerts(),
  {
    id: "alert-5",
    plantId: "1",
    plantName: "Plant 1",
    component: "Weather Station",
    severity: "medium",
    message: "Wind sensor calibration required",
    timestamp: "2024-01-15T05:30:00Z",
    status: "resolved",
  },
  {
    id: "alert-6",
    plantId: "2",
    plantName: "Plant 2",
    component: "Tracking System",
    severity: "high",
    message: "Tracker 15 position error detected",
    timestamp: "2024-01-15T04:15:00Z",
    status: "acknowledged",
  },
  {
    id: "alert-7",
    plantId: "2",
    plantName: "Plant 2",
    component: "Data Logger",
    severity: "low",
    message: "Storage capacity 85% full",
    timestamp: "2024-01-15T03:45:00Z",
    status: "active",
  },
  {
    id: "alert-8",
    plantId: "1",
    plantName: "Plant 1",
    component: "Inverter Unit 8",
    severity: "critical",
    message: "Ground fault detected - immediate shutdown required",
    timestamp: "2024-01-15T02:20:00Z",
    status: "active",
  },
  {
    id: "alert-9",
    plantId: "1",
    plantName: "Plant 1",
    component: "Cleaning System",
    severity: "medium",
    message: "Robot cleaning schedule overdue",
    timestamp: "2024-01-15T01:00:00Z",
    status: "resolved",
  },
  {
    id: "alert-10",
    plantId: "2",
    plantName: "Plant 2",
    component: "Security System",
    severity: "low",
    message: "Perimeter sensor maintenance required",
    timestamp: "2024-01-14T23:30:00Z",
    status: "active",
  },
];

const generateAlertTrendData = () => [
  { month: "Jan", critical: 2, high: 5, medium: 12, low: 8 },
  { month: "Feb", critical: 1, high: 3, medium: 8, low: 6 },
  { month: "Mar", critical: 3, high: 7, medium: 15, low: 10 },
  { month: "Apr", critical: 1, high: 4, medium: 9, low: 7 },
  { month: "May", critical: 2, high: 6, medium: 11, low: 9 },
  { month: "Jun", critical: 4, high: 8, medium: 13, low: 12 },
];

const generateAlertDistribution = (alerts: Alert[]) => {
  const distribution = alerts.reduce(
    (acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return [
    { name: "Critical", value: distribution.critical || 0, color: "#EF4444" },
    { name: "High", value: distribution.high || 0, color: "#F59E0B" },
    { name: "Medium", value: distribution.medium || 0, color: "#6B7280" },
    { name: "Low", value: distribution.low || 0, color: "#9CA3AF" },
  ];
};

export default function GlobalAlerts() {
  const alert = useAlert();
  const [alerts] = useState(generateExtendedMockAlerts());
  const [activeTab, setActiveTab] = useState<"active" | "historical">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [plantFilter, setPlantFilter] = useState<string>("all");
  const [componentFilter, setComponentFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Common filter state
  const [filterValues, setFilterValues] = useState({
    search: "",
    plant: "all",
    component: "all",
    severity: "all",
    status: "all"
  });

  // Handle filter value changes
  const handleFilterChange = (key: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    
    // Update individual filter states for backward compatibility
    if (key === "search") setSearchQuery(value);
    if (key === "plant") setPlantFilter(value);
    if (key === "component") setComponentFilter(value);
    if (key === "severity") setSeverityFilter(value);
    if (key === "status") setStatusFilter(value);
  };
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [isAssignmentPanelOpen, setIsAssignmentPanelOpen] = useState(false);
  const [alertToAssign, setAlertToAssign] = useState<Alert | null>(null);
  const [roleAssignments] = useState(generateRoleAssignments());
  const [selectedRole, setSelectedRole] = useState<RoleAssignment | null>(null);

  // Separate active and historical alerts
  const activeAlerts = useMemo(() => {
    return alerts.filter((alert) => alert.status === "active" || alert.status === "acknowledged");
  }, [alerts]);

  const historicalAlerts = useMemo(() => {
    return alerts.filter((alert) => alert.status === "resolved");
  }, [alerts]);

  // Filter alerts based on current tab
  const filteredAlerts = useMemo(() => {
    const alertsToFilter = activeTab === "active" ? activeAlerts : historicalAlerts;

    return alertsToFilter.filter((alert) => {
      const matchesSearch =
        alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.component.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.plantName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlant =
        plantFilter === "all" || alert.plantId === plantFilter;
      const matchesComponent =
        componentFilter === "all" ||
        alert.component.toLowerCase().includes(componentFilter.toLowerCase());
      const matchesSeverity =
        severityFilter === "all" || alert.severity === severityFilter;
      const matchesStatus =
        statusFilter === "all" || alert.status === statusFilter;

      return (
        matchesSearch &&
        matchesPlant &&
        matchesComponent &&
        matchesSeverity &&
        matchesStatus
      );
    });
  }, [
    activeTab,
    activeAlerts,
    historicalAlerts,
    searchQuery,
    plantFilter,
    componentFilter,
    severityFilter,
    statusFilter,
  ]);

  const alertTrendData = generateAlertTrendData();
  const alertDistribution = generateAlertDistribution(filteredAlerts);

  const getStatusIcon = (status: Alert["status"]) => {
    switch (status) {
      case "active":
        return AlertTriangle;
      case "acknowledged":
        return Clock;
      case "resolved":
        return CheckCircle;
      default:
        return XCircle;
    }
  };

  const getStatusColor = (status: Alert["status"]) => {
    switch (status) {
      case "active":
        return "destructive";
      case "acknowledged":
        return "warning";
      case "resolved":
        return "success";
      default:
        return "secondary";
    }
  };

  const getSeverityColor = (severity: Alert["severity"]) => {
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

  const uniquePlants = Array.from(
    new Set(alerts.map((alert) => alert.plantName)),
  );
  const uniqueComponents = Array.from(
    new Set(alerts.map((alert) => alert.component)),
  );

  const totalCritical = alerts.filter((a) => a.severity === "critical").length;
  const totalActive = activeAlerts.length;
  const totalHistorical = historicalAlerts.length;

  const handleViewAlertDetails = (alert: Alert) => {
    console.log("View alert details clicked for:", alert.id);
    setSelectedAlert(alert);
    setIsDetailPanelOpen(true);
  };

  const handleCloseDetailPanel = () => {
    setIsDetailPanelOpen(false);
    setSelectedAlert(null);
  };

  const handleAssignAlert = (alert: Alert) => {
    setAlertToAssign(alert);
    setIsAssignmentPanelOpen(true);
    alert.info('Alert Assignment', 'Opening assignment panel for this alert.');
  };

  const handleCloseAssignmentPanel = () => {
    setIsAssignmentPanelOpen(false);
    setAlertToAssign(null);
  };

  const generateGlobalAlertDetailData = (
    alert: Alert,
  ): GlobalAlertDetailData => {
    return {
      metadata: {
        alertId: alert.id,
        plantId: alert.plantId,
        plantName: alert.plantName,
        component: alert.component,
        severity: alert.severity,
        status: alert.status,
        timestamp: alert.timestamp,
        estimatedDuration: Math.round(2 + Math.random() * 8),
      },
      impactAnalysis: {
        affectedCapacity: Math.round(50 + Math.random() * 200),
        estimatedEnergyLoss: Math.round(1000 + Math.random() * 5000),
        financialImpact: Math.round(500 + Math.random() * 2000),
        cascadingEffects: generateCascadingEffects(alert),
      },
      technicalDetails: {
        componentSpecs: generateComponentSpecs(alert.component),
        diagnostics: generateDiagnostics(alert.component),
        errorCodes: generateErrorCodes(alert.severity),
      },
      resolutionPlan: {
        immediateActions: generateImmediateActions(alert),
        longTermActions: generateLongTermActions(alert),
        requiredPersonnel: generateRequiredPersonnel(alert.severity),
        estimatedResolutionTime: Math.round(30 + Math.random() * 180),
      },
      similarIncidents: generateSimilarIncidents(),
    };
  };

  const generateCascadingEffects = (alert: Alert): string[] => {
    const effects = [
      "Reduced plant efficiency in affected sector",
      "Potential overload on adjacent components",
    ];

    if (alert.severity === "critical") {
      effects.push(
        "Emergency shutdown protocols may be triggered",
        "Grid stability impact in surrounding area",
      );
    }

    return effects;
  };

  const generateComponentSpecs = (component: string) => {
    const baseYear = 2020 + Math.floor(Math.random() * 4);
    return {
      model: component.includes("Inverter")
        ? "SMA Sunny Central 2500-EV"
        : component.includes("Tracker")
          ? "NEXTracker NX Horizon"
          : component.includes("Weather")
            ? "Lufft WS600-UMB"
            : "Generic Solar Component Model X",
      capacity: component.includes("Inverter")
        ? "2.5 MW"
        : component.includes("Tracker")
          ? "120 panels"
          : "Standard Capacity",
      installationDate: `${baseYear}-03-15`,
      lastMaintenance: "2024-01-08",
    };
  };

  const generateDiagnostics = (component: string) => {
    const diagnostics: any = {};

    if (component.includes("Inverter")) {
      diagnostics.voltage = Math.round(800 + Math.random() * 200);
      diagnostics.current = Math.round(50 + Math.random() * 100);
      diagnostics.temperature = Math.round(45 + Math.random() * 20);
    }

    if (component.includes("String")) {
      diagnostics.voltage = Math.round(600 + Math.random() * 150);
      diagnostics.resistance = Math.round(0.5 + Math.random() * 2);
    }

    return diagnostics;
  };

  const generateErrorCodes = (severity: string): string[] => {
    const codes = ["E001: General System Fault", "W205: Performance Threshold"];

    if (severity === "critical") {
      codes.push("E503: Critical Safety Violation", "E401: Emergency Shutdown");
    } else if (severity === "high") {
      codes.push("E302: High Priority Fault", "W108: Component Degradation");
    }

    return codes;
  };

  const generateImmediateActions = (alert: Alert): string[] => {
    const actions = [
      "Isolate affected component from grid connection",
      "Dispatch maintenance team for on-site assessment",
      "Monitor adjacent components for cascading effects",
    ];

    if (alert.severity === "critical") {
      actions.unshift("Execute emergency shutdown procedure");
      actions.push("Notify grid operator of capacity reduction");
    }

    return actions;
  };

  const generateLongTermActions = (alert: Alert): string[] => {
    return [
      "Conduct detailed root cause analysis",
      "Review and update preventive maintenance schedule",
      "Consider component upgrade if recurring issues",
      "Update operational procedures based on findings",
    ];
  };

  const generateRequiredPersonnel = (severity: string): string[] => {
    const personnel = ["Electrical Technician", "Site Supervisor"];

    if (severity === "critical" || severity === "high") {
      personnel.push("Safety Officer", "Lead Engineer");
    }

    return personnel;
  };

  const generateSimilarIncidents = () => {
    return [
      {
        date: "2024-01-08",
        component: "Inverter Unit 3",
        resolution: "Component replacement",
        duration: 180,
      },
      {
        date: "2023-12-15",
        component: "String Combiner 8",
        resolution: "Connector tightening",
        duration: 45,
      },
      {
        date: "2023-11-22",
        component: "Tracker System",
        resolution: "Software calibration",
        duration: 90,
      },
    ];
  };

  const handleExportAlertReport = () => {
    if (!selectedAlert) return;
    console.log(`Exporting alert report for: ${selectedAlert.id}`);
    alert.exportNotification('PDF');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Global Alerts</h1>
          <p className="text-muted-foreground">
            Centralized alert monitoring across all solar plants
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="w-4 h-4" />
            Last 30 Days
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export Log
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Critical Alerts
                </div>
                <div className="text-2xl font-bold text-destructive">
                  {totalCritical}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Active Alerts
                </div>
                <div className="text-2xl font-bold text-warning">
                  {totalActive}
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
                  Total This Month
                </div>
                <div className="text-2xl font-bold">{alerts.length}</div>
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
                  Resolution Rate
                </div>
                <div className="text-2xl font-bold text-success">87%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Alert Trends (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={alertTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                
                <Line
                  type="monotone"
                  dataKey="critical"
                  stroke="#EF4444"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="high"
                  stroke="#F59E0B"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="medium"
                  stroke="#6B7280"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="low"
                  stroke="#9CA3AF"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alert Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Current Alert Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={alertDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={false}
                  >
                    {alertDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {alertDistribution.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs font-medium">{entry.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({entry.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Alert Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FilterBar
            config={createGlobalAlertFilterConfig(uniquePlants, uniqueComponents)}
            values={filterValues}
            onValueChange={handleFilterChange}
            className="flex-wrap"
          />
        </CardContent>
      </Card>

      {/* Alert Management Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Management</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "active" | "historical")} className="w-full">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active" className="gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Active Alerts ({activeAlerts.length})
                </TabsTrigger>
                <TabsTrigger value="historical" className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Historical Alerts ({historicalAlerts.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="active" className="mt-0">
              <div className="px-6 py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Manage currently active and acknowledged alerts requiring attention.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium text-sm">Timestamp</th>
                      <th className="text-left p-4 font-medium text-sm">Plant</th>
                      <th className="text-left p-4 font-medium text-sm">Component</th>
                      <th className="text-left p-4 font-medium text-sm">Severity</th>
                      <th className="text-left p-4 font-medium text-sm">Message</th>
                      <th className="text-left p-4 font-medium text-sm">Status</th>
                      <th className="text-left p-4 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAlerts.map((alert) => {
                      const StatusIcon = getStatusIcon(alert.status);
                      return (
                        <tr key={alert.id} className="border-t hover:bg-muted/30">
                          <td className="p-4 text-sm">
                            {new Date(alert.timestamp).toLocaleString()}
                          </td>
                          <td className="p-4 text-sm font-medium">{alert.plantName}</td>
                          <td className="p-4 text-sm">{alert.component}</td>
                          <td className="p-4">
                            <Badge variant={getSeverityColor(alert.severity) as any} className="capitalize">
                              {alert.severity}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm max-w-xs truncate">{alert.message}</td>
                          <td className="p-4">
                            <Badge variant={getStatusColor(alert.status) as any} className="gap-1 capitalize">
                              <StatusIcon className="w-3 h-3" />
                              {alert.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {alert.status === "active" && (
                                <>
                                  <Button variant="outline" size="sm">Acknowledge</Button>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleAssignAlert(alert)}
                                    className="gap-1"
                                  >
                                    <UserPlus className="w-3 h-3" />
                                    Assign
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewAlertDetails(alert)}
                                className="gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="historical" className="mt-0">
              <div className="px-6 py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  View resolved alerts and historical incident patterns for analysis.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium text-sm">Resolved Date</th>
                      <th className="text-left p-4 font-medium text-sm">Plant</th>
                      <th className="text-left p-4 font-medium text-sm">Component</th>
                      <th className="text-left p-4 font-medium text-sm">Severity</th>
                      <th className="text-left p-4 font-medium text-sm">Message</th>
                      <th className="text-left p-4 font-medium text-sm">Resolution Time</th>
                      <th className="text-left p-4 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAlerts.map((alert) => {
                      // Calculate mock resolution time (hours)
                      const resolutionTime = Math.floor(Math.random() * 48 + 1);
                      return (
                        <tr key={alert.id} className="border-t hover:bg-muted/30">
                          <td className="p-4 text-sm">
                            {new Date(alert.timestamp).toLocaleString()}
                          </td>
                          <td className="p-4 text-sm font-medium">{alert.plantName}</td>
                          <td className="p-4 text-sm">{alert.component}</td>
                          <td className="p-4">
                            <Badge variant={getSeverityColor(alert.severity) as any} className="capitalize">
                              {alert.severity}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm max-w-xs truncate">{alert.message}</td>
                          <td className="p-4 text-sm">
                            <Badge variant="outline" className="gap-1">
                              <Clock className="w-3 h-3" />
                              {resolutionTime}h
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewAlertDetails(alert)}
                                className="gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </Button>
                              <Button variant="outline" size="sm" className="gap-2">
                                <Download className="w-3 h-3" />
                                Export
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Global Alert Detail Panel */}
      {isDetailPanelOpen && selectedAlert && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9999] flex">
          {/* Backdrop */}
          <div className="flex-1" onClick={handleCloseDetailPanel} />

          {/* Detail Panel */}
          <div className="w-[800px] bg-background shadow-2xl flex flex-col h-full border-l overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-destructive/10 to-warning/10 border-b p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-destructive/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    Global Alert Details
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedAlert.plantName} - {selectedAlert.component}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseDetailPanel}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {(() => {
                const detailData = generateGlobalAlertDetailData(selectedAlert);
                return (
                  <>
                    {/* 1. Alert Metadata */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-base flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Alert Metadata
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">
                              Alert ID:
                            </span>
                            <div className="font-mono text-sm">
                              {detailData.metadata.alertId}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">
                              Plant Name:
                            </span>
                            <div className="text-sm">
                              {detailData.metadata.plantName}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">
                              Component:
                            </span>
                            <div className="text-sm">
                              {detailData.metadata.component}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">
                              Severity:
                            </span>
                            <div className="mt-1">
                              <Badge
                                variant={
                                  getSeverityColor(
                                    detailData.metadata.severity as "high" | "low" | "critical" | "medium",
                                  ) as any
                                }
                              >
                                {detailData.metadata.severity.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">
                              Status:
                            </span>
                            <div className="mt-1">
                              <Badge
                                variant={
                                  getStatusColor(
                                    detailData.metadata.status as "active" | "acknowledged" | "resolved",
                                  ) as any
                                }
                              >
                                {detailData.metadata.status.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">
                              Timestamp:
                            </span>
                            <div className="text-sm">
                              {new Date(
                                detailData.metadata.timestamp,
                              ).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. Impact Analysis */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-base flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        Impact Analysis
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 bg-red-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-medium">
                              Affected Capacity
                            </span>
                          </div>
                          <div className="text-lg font-bold text-red-700">
                            {detailData.impactAnalysis.affectedCapacity} kW
                          </div>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4 text-orange-600" />
                            <span className="text-sm font-medium">
                              Energy Loss
                            </span>
                          </div>
                          <div className="text-lg font-bold text-orange-700">
                            {detailData.impactAnalysis.estimatedEnergyLoss} kWh
                          </div>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium">
                              Financial Impact
                            </span>
                          </div>
                          <div className="text-lg font-bold text-yellow-700">
                            ${detailData.impactAnalysis.financialImpact}
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <h5 className="font-medium mb-3">Cascading Effects:</h5>
                        <div className="space-y-2">
                          {detailData.impactAnalysis.cascadingEffects.map(
                            (effect, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-2 text-sm"
                              >
                                <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                                {effect}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 3. Technical Details */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-base flex items-center gap-2">
                        <Settings className="w-4 h-4 text-primary" />
                        Technical Details
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <h5 className="font-medium mb-3">
                            Component Specifications
                          </h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Model:</span>
                              <span className="font-medium">
                                {
                                  detailData.technicalDetails.componentSpecs
                                    .model
                                }
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Capacity:</span>
                              <span className="font-medium">
                                {
                                  detailData.technicalDetails.componentSpecs
                                    .capacity
                                }
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Installation Date:</span>
                              <span className="font-medium">
                                {
                                  detailData.technicalDetails.componentSpecs
                                    .installationDate
                                }
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Last Maintenance:</span>
                              <span className="font-medium">
                                {
                                  detailData.technicalDetails.componentSpecs
                                    .lastMaintenance
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <h5 className="font-medium mb-3">
                            Current Diagnostics
                          </h5>
                          <div className="space-y-2 text-sm">
                            {Object.entries(
                              detailData.technicalDetails.diagnostics,
                            ).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="capitalize">{key}:</span>
                                <span className="font-medium">
                                  {value}
                                  {key === "voltage"
                                    ? "V"
                                    : key === "current"
                                      ? "A"
                                      : key === "temperature"
                                        ? "°C"
                                        : key === "resistance"
                                          ? "Ω"
                                          : ""}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg">
                        <h5 className="font-medium mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          Error Codes
                        </h5>
                        <div className="space-y-2">
                          {detailData.technicalDetails.errorCodes.map(
                            (code, index) => (
                              <div
                                key={index}
                                className="font-mono text-sm bg-white p-2 rounded"
                              >
                                {code}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 4. Resolution Plan */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-base flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-primary" />
                        Resolution Plan
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h5 className="font-medium mb-3">
                            Immediate Actions
                          </h5>
                          <div className="space-y-2">
                            {detailData.resolutionPlan.immediateActions.map(
                              (action, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-3"
                                >
                                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                                    {index + 1}
                                  </div>
                                  <div className="text-sm">{action}</div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h5 className="font-medium mb-3">
                            Long-term Actions
                          </h5>
                          <div className="space-y-2">
                            {detailData.resolutionPlan.longTermActions.map(
                              (action, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-3"
                                >
                                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                                    {index + 1}
                                  </div>
                                  <div className="text-sm">{action}</div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium">
                              Required Personnel
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {detailData.resolutionPlan.requiredPersonnel.map(
                              (person, index) => (
                                <Badge key={index} variant="secondary">
                                  {person}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                        <div className="p-3 bg-indigo-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-indigo-600" />
                            <span className="text-sm font-medium">
                              Estimated Resolution
                            </span>
                          </div>
                          <div className="text-lg font-bold text-indigo-700">
                            {detailData.resolutionPlan.estimatedResolutionTime}{" "}
                            min
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 5. Similar Incidents */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-base flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Historical Similar Incidents
                      </h4>
                      <div className="space-y-3">
                        {detailData.similarIncidents.map((incident, index) => (
                          <div
                            key={index}
                            className="p-4 bg-muted/30 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">
                                {incident.component}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(incident.date).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Resolution: {incident.resolution}</span>
                              <span>Duration: {incident.duration} min</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Footer with Export */}
            <div className="border-t p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Generated on {new Date().toLocaleDateString()} at{" "}
                  {new Date().toLocaleTimeString()}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportAlertReport}
                    className="gap-2"
                  >
                    <FileDown className="w-3 h-3" />
                    Export PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportAlertReport}
                    className="gap-2"
                  >
                    <Download className="w-3 h-3" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Assignment Dialog */}
      <Dialog
        open={isAssignmentPanelOpen}
        onOpenChange={setIsAssignmentPanelOpen}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Assign Work Order - {alertToAssign?.component}
            </DialogTitle>
            <DialogDescription>
              Convert this alert to a work order and assign to the most suitable
              role based on competency, workload, and availability.
            </DialogDescription>
          </DialogHeader>

          {alertToAssign && (
            <div className="space-y-6">
              {/* Alert Summary */}
              <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-1" />
                    <div className="flex-1">
                      <div className="font-semibold text-red-900 mb-1">
                        {alertToAssign.message}
                      </div>
                      <div className="text-sm text-red-700 space-y-1">
                        <div>Plant: {alertToAssign.plantName}</div>
                        <div>Component: {alertToAssign.component}</div>
                        <div className="flex items-center gap-2">
                          <span>Severity:</span>
                          <Badge
                            variant={
                              getSeverityColor(alertToAssign.severity) as any
                            }
                          >
                            {alertToAssign.severity.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Role Selection */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Available Personnel</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roleAssignments
                    .sort((a, b) => {
                      // Prioritize by availability today, then competency, then workload
                      if (a.availability.today !== b.availability.today) {
                        return a.availability.today ? -1 : 1;
                      }
                      if (a.competencyLevel !== b.competencyLevel) {
                        return b.competencyLevel - a.competencyLevel;
                      }
                      return a.activeWorkOrders - b.activeWorkOrders;
                    })
                    .map((role) => {
                      const workloadPercentage =
                        (role.activeWorkOrders / role.maxCapacity) * 100;
                      const isSelected = selectedRole?.id === role.id;
                      const isRecommended =
                        role ===
                        roleAssignments
                          .filter((r) => r.availability.today)
                          .sort((a, b) => {
                            const scoreA =
                              a.competencyLevel -
                              (a.activeWorkOrders / a.maxCapacity) * 20;
                            const scoreB =
                              b.competencyLevel -
                              (b.activeWorkOrders / b.maxCapacity) * 20;
                            return scoreB - scoreA;
                          })[0];

                      return (
                        <Card
                          key={role.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            isSelected
                              ? "ring-2 ring-primary border-primary"
                              : ""
                          } ${isRecommended ? "bg-blue-50 border-blue-200" : ""}`}
                          onClick={() => setSelectedRole(role)}
                        >
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {/* Header */}
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                                      {role.avatar}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-semibold flex items-center gap-2">
                                      {role.name}
                                      {isRecommended && (
                                        <Badge
                                          variant="default"
                                          className="text-xs"
                                        >
                                          <Star className="w-3 h-3 mr-1" />
                                          Recommended
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {role.title}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xs text-muted-foreground">
                                    Competency
                                  </div>
                                  <div className="font-semibold text-lg">
                                    {role.competencyLevel}%
                                  </div>
                                </div>
                              </div>

                              {/* Competency Progress */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span>Competency Level</span>
                                  <span>{role.competencyLevel}%</span>
                                </div>
                                <Progress
                                  value={role.competencyLevel}
                                  className="h-2"
                                />
                              </div>

                              {/* Workload */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span>Current Workload</span>
                                  <span>
                                    {role.activeWorkOrders}/{role.maxCapacity}{" "}
                                    orders
                                  </span>
                                </div>
                                <Progress
                                  value={workloadPercentage}
                                  className={`h-2 ${workloadPercentage > 80 ? "bg-red-100" : workloadPercentage > 60 ? "bg-yellow-100" : "bg-green-100"}`}
                                />
                              </div>

                              {/* Availability */}
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                  <span>Available:</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={
                                      role.availability.today
                                        ? "success"
                                        : "destructive"
                                    }
                                    className="text-xs"
                                  >
                                    Today:{" "}
                                    {role.availability.today ? "Yes" : "No"}
                                  </Badge>
                                  <Badge
                                    variant={
                                      role.availability.tomorrow
                                        ? "success"
                                        : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    Tomorrow:{" "}
                                    {role.availability.tomorrow ? "Yes" : "No"}
                                  </Badge>
                                </div>
                              </div>

                              {/* Contact */}
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="w-4 h-4" />
                                {role.contactPhone}
                              </div>

                              {/* Specialties */}
                              <div className="space-y-2">
                                <div className="text-xs font-medium text-muted-foreground">
                                  Specialties:
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {role.specialties.map((specialty, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {specialty}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </div>

              {/* Assignment Summary */}
              {selectedRole && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <UserPlus className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-green-900">
                          Assignment Preview
                        </div>
                        <div className="text-sm text-green-700">
                          Work Order will be created and assigned to{" "}
                          <strong>{selectedRole.name}</strong> (
                          {selectedRole.title}). Estimated completion time based
                          on alert severity and component type:{" "}
                          <strong>2-4 hours</strong>.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseAssignmentPanel}>
              Cancel
            </Button>
            <Button
              disabled={!selectedRole}
              onClick={() => {
                if (selectedRole && alertToAssign) {
                  console.log(
                    `Creating work order for alert ${alertToAssign.id} assigned to ${selectedRole.name}`,
                  );
                  // Here we would create the work order and redirect to work orders page
                  handleCloseAssignmentPanel();
                }
              }}
            >
              Create Work Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
