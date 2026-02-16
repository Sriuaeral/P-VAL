import { useState, useEffect } from "react";
import { Plant } from "@shared/interface";
//`import PlantNavigation from '@/components/PlantNavigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Bot,
  Battery,
  Play,
  Pause,
  Settings,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Eye,
  Activity,
  X,
  FileText,
  MapPin,
  Zap,
  Timer,
  TrendingUp,
  Target,
  ExternalLink,
  FileDown,
} from "lucide-react";
import PlantNavigation from "@/components/PlantNavigation";

interface Robot {
  id: string;
  name: string;
  type: "Cleaning Bot" | "Inspection Drone" | "Maintenance Bot";
  currentTask: "Idle" | "Cleaning" | "Inspecting" | "Charging" | "Maintenance";
  lastOperationTime: string;
  batteryStatus: number; // percentage
  maintenanceDueDate: string;
  operationalHours: number;
  location: string;
  status: "operational" | "maintenance" | "offline" | "charging";
}

interface TaskSchedule {
  id: string;
  robotId: string;
  robotName: string;
  taskType: "Cleaning" | "Visual Inspection" | "Panel Dusting" | "Maintenance";
  scheduledTime: string;
  duration: number; // minutes
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  area: string;
  priority: "low" | "medium" | "high";
}

interface RobotActivityLog {
  id: string;
  robotId: string;
  robotName: string;
  taskType: string;
  duration: number; // minutes
  timestamp: string;
  resultSummary: string;
  energyConsumed: number; // kWh
  areasCovered: string[];
}

interface MaintenanceRecord {
  id: string;
  robotId: string;
  robotName: string;
  maintenanceType: "Routine" | "Repair" | "Component Replacement";
  scheduledDate: string;
  completedDate?: string;
  technician: string;
  status: "scheduled" | "in-progress" | "completed" | "overdue";
  cost: number;
  description: string;
}

interface RobotDetailData {
  metadata: {
    logId: string;
    robotId: string;
    robotName: string;
    robotType: string;
    taskType: string;
    timestamp: string;
    duration: number;
    energyConsumed: number;
  };
  taskSummary: {
    objective: string;
    areasTargeted: string[];
    performanceMetrics: {
      coverageArea: number;
      efficiency: number;
      qualityScore: number;
    };
  };
  operationalDetails: {
    batteryUsage: {
      startLevel: number;
      endLevel: number;
      consumptionRate: number;
    };
    navigationPath: Array<{
      time: string;
      location: string;
      action: string;
    }>;
    environmentalConditions: {
      temperature: number;
      humidity: number;
      windSpeed: number;
      irradiance: number;
    };
  };
  resultsAnalysis: {
    panelsProcessed: number;
    issuesDetected: Array<{
      type: string;
      location: string;
      severity: string;
      action: string;
    }>;
    efficiencyImprovement: number;
    recommendations: string[];
  };
  timelineData: Array<{
    time: string;
    progress: number;
    batteryLevel: number;
    efficiency: number;
  }>;
}

// Mock data generators
const generateRobotFleet = (plantId: string): Robot[] => [
  {
    id: "robot-001",
    name: "CleanBot Alpha",
    type: "Cleaning Bot",
    currentTask: "Cleaning",
    lastOperationTime: "2024-01-15T08:30:00Z",
    batteryStatus: 78,
    maintenanceDueDate: "2024-02-01T09:00:00Z",
    operationalHours: 1245,
    location: "Block A - Row 15",
    status: "operational",
  },
  {
    id: "robot-002",
    name: "CleanBot Beta",
    type: "Cleaning Bot",
    currentTask: "Charging",
    lastOperationTime: "2024-01-15T07:45:00Z",
    batteryStatus: 95,
    maintenanceDueDate: "2024-01-28T10:00:00Z",
    operationalHours: 892,
    location: "Charging Station 1",
    status: "charging",
  },
  {
    id: "robot-003",
    name: "InspectDrone Gamma",
    type: "Inspection Drone",
    currentTask: "Inspecting",
    lastOperationTime: "2024-01-15T09:15:00Z",
    batteryStatus: 45,
    maintenanceDueDate: "2024-02-15T11:00:00Z",
    operationalHours: 567,
    location: "Block B - Row 8",
    status: "operational",
  },
  {
    id: "robot-004",
    name: "MaintenanceBot Delta",
    type: "Maintenance Bot",
    currentTask: "Maintenance",
    lastOperationTime: "2024-01-14T16:20:00Z",
    batteryStatus: 0,
    maintenanceDueDate: "2024-01-20T14:00:00Z",
    operationalHours: 2134,
    location: "Maintenance Bay",
    status: "maintenance",
  },
  {
    id: "robot-005",
    name: "InspectDrone Epsilon",
    type: "Inspection Drone",
    currentTask: "Idle",
    lastOperationTime: "2024-01-15T06:00:00Z",
    batteryStatus: 100,
    maintenanceDueDate: "2024-03-01T09:00:00Z",
    operationalHours: 234,
    location: "Drone Landing Pad 2",
    status: "operational",
  },
];

const generateTaskSchedule = (): TaskSchedule[] => [
  {
    id: "task-001",
    robotId: "robot-001",
    robotName: "CleanBot Alpha",
    taskType: "Cleaning",
    scheduledTime: "2024-01-16T06:00:00Z",
    duration: 180,
    status: "scheduled",
    area: "Block A - Rows 1-10",
    priority: "high",
  },
  {
    id: "task-002",
    robotId: "robot-002",
    robotName: "CleanBot Beta",
    scheduledTime: "2024-01-16T08:00:00Z",
    taskType: "Cleaning",
    duration: 150,
    status: "scheduled",
    area: "Block B - Rows 11-20",
    priority: "medium",
  },
  {
    id: "task-003",
    robotId: "robot-003",
    robotName: "InspectDrone Gamma",
    taskType: "Visual Inspection",
    scheduledTime: "2024-01-16T10:00:00Z",
    duration: 90,
    status: "scheduled",
    area: "Block C - Full Area",
    priority: "low",
  },
  {
    id: "task-004",
    robotId: "robot-001",
    robotName: "CleanBot Alpha",
    taskType: "Panel Dusting",
    scheduledTime: "2024-01-15T14:30:00Z",
    duration: 120,
    status: "completed",
    area: "Block A - Rows 15-25",
    priority: "medium",
  },
  {
    id: "task-005",
    robotId: "robot-004",
    robotName: "MaintenanceBot Delta",
    taskType: "Maintenance",
    scheduledTime: "2024-01-15T09:00:00Z",
    duration: 240,
    status: "in-progress",
    area: "Inverter Station 3",
    priority: "high",
  },
];

const generateActivityLog = (): RobotActivityLog[] => [
  {
    id: "log-001",
    robotId: "robot-001",
    robotName: "CleanBot Alpha",
    taskType: "Panel Cleaning",
    duration: 165,
    timestamp: "2024-01-15T14:30:00Z",
    resultSummary: "Successfully cleaned 450 panels, 2% efficiency improvement",
    energyConsumed: 2.3,
    areasCovered: ["Block A Row 15", "Block A Row 16", "Block A Row 17"],
  },
  {
    id: "log-002",
    robotId: "robot-003",
    robotName: "InspectDrone Gamma",
    taskType: "Thermal Inspection",
    duration: 85,
    timestamp: "2024-01-15T11:20:00Z",
    resultSummary: "Identified 3 hotspots requiring attention",
    energyConsumed: 1.1,
    areasCovered: ["Block B Row 8", "Block B Row 9"],
  },
  {
    id: "log-003",
    robotId: "robot-002",
    robotName: "CleanBot Beta",
    taskType: "Dust Removal",
    duration: 140,
    timestamp: "2024-01-15T09:45:00Z",
    resultSummary: "Removed accumulated dust, 1.8% power output increase",
    energyConsumed: 1.9,
    areasCovered: ["Block B Row 11", "Block B Row 12"],
  },
  {
    id: "log-004",
    robotId: "robot-005",
    robotName: "InspectDrone Epsilon",
    taskType: "Visual Inspection",
    duration: 60,
    timestamp: "2024-01-15T08:15:00Z",
    resultSummary: "No issues detected, all panels in good condition",
    energyConsumed: 0.8,
    areasCovered: ["Block C Row 1", "Block C Row 2"],
  },
];

const generateMaintenanceRecords = (): MaintenanceRecord[] => [
  {
    id: "maint-001",
    robotId: "robot-004",
    robotName: "MaintenanceBot Delta",
    maintenanceType: "Routine",
    scheduledDate: "2024-01-20T14:00:00Z",
    technician: "John Smith",
    status: "scheduled",
    cost: 450,
    description: "Quarterly maintenance check and cleaning",
  },
  {
    id: "maint-002",
    robotId: "robot-001",
    robotName: "CleanBot Alpha",
    maintenanceType: "Component Replacement",
    scheduledDate: "2024-02-01T09:00:00Z",
    technician: "Sarah Johnson",
    status: "scheduled",
    cost: 1200,
    description: "Replace cleaning brush assembly",
  },
  {
    id: "maint-003",
    robotId: "robot-003",
    robotName: "InspectDrone Gamma",
    maintenanceType: "Repair",
    scheduledDate: "2024-01-18T11:00:00Z",
    completedDate: "2024-01-18T13:30:00Z",
    technician: "Mike Wilson",
    status: "completed",
    cost: 320,
    description: "Repair camera gimbal stabilization",
  },
];

const generateRobotUtilization = () => [
  { month: "Jul", cleaning: 85, inspection: 65, maintenance: 45 },
  { month: "Aug", cleaning: 78, inspection: 72, maintenance: 38 },
  { month: "Sep", cleaning: 92, inspection: 68, maintenance: 52 },
  { month: "Oct", cleaning: 88, inspection: 75, maintenance: 41 },
  { month: "Nov", cleaning: 82, inspection: 70, maintenance: 48 },
  { month: "Dec", cleaning: 89, inspection: 73, maintenance: 44 },
];

const COLORS = ["#F5C842", "#10B981", "#3B82F6", "#EF4444"];

export default function PlantRobots() {
  const [plant, setPlant] = useState<Plant | null>(JSON.parse(localStorage.getItem('selectedPlant') || '{}'));
  const plantName = localStorage.getItem('selectedPlant');
  const [robots] = useState(generateRobotFleet(plant.id || ""));
  const [tasks] = useState(generateTaskSchedule());
  const [activityLog] = useState(generateActivityLog());
  const [maintenanceRecords] = useState(generateMaintenanceRecords());
  const [selectedActivityLog, setSelectedActivityLog] =
    useState<RobotActivityLog | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);

  const robotUtilization = generateRobotUtilization();

  useEffect(() => {
    if (plant?.id) {
      const selectedPlant = JSON.parse( localStorage.getItem('selectedPlant') || '{}');
      setPlant(selectedPlant || null);
    }
  }, [plant?.id]);

  if (!plant) {
    return <div>Plant not found</div>;
  }

  // Calculate KPIs
  const totalRobots = robots.length;
  const operationalRobots = robots.filter(
    (r) => r.status === "operational",
  ).length;
  const robotsUnderMaintenance = robots.filter(
    (r) => r.status === "maintenance",
  ).length;
  const scheduledOperationsToday = tasks.filter(
    (t) =>
      new Date(t.scheduledTime).toDateString() === new Date().toDateString(),
  ).length;

  const getStatusColor = (status: Robot["status"]) => {
    switch (status) {
      case "operational":
        return "success";
      case "charging":
        return "info";
      case "maintenance":
        return "warning";
      case "offline":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getTaskStatusColor = (status: TaskSchedule["status"]) => {
    switch (status) {
      case "completed":
        return "success";
      case "in-progress":
        return "info";
      case "scheduled":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getMaintenanceStatusColor = (status: MaintenanceRecord["status"]) => {
    switch (status) {
      case "completed":
        return "success";
      case "in-progress":
        return "info";
      case "scheduled":
        return "secondary";
      case "overdue":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getPriorityColor = (priority: TaskSchedule["priority"]) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      case "low":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getBatteryColor = (percentage: number) => {
    if (percentage > 50) return "text-success";
    if (percentage > 20) return "text-warning";
    return "text-destructive";
  };

  const handleViewActivityDetails = (log: RobotActivityLog) => {
    console.log("View activity details clicked for:", log.id);
    setSelectedActivityLog(log);
    setIsDetailPanelOpen(true);
  };

  const handleCloseDetailPanel = () => {
    setIsDetailPanelOpen(false);
    setSelectedActivityLog(null);
  };

  const generateRobotDetailData = (log: RobotActivityLog): RobotDetailData => {
    const robot = robots.find((r) => r.id === log.robotId);
    return {
      metadata: {
        logId: log.id,
        robotId: log.robotId,
        robotName: log.robotName,
        robotType: robot?.type || "Unknown",
        taskType: log.taskType,
        timestamp: log.timestamp,
        duration: log.duration,
        energyConsumed: log.energyConsumed,
      },
      taskSummary: {
        objective: generateTaskObjective(log.taskType),
        areasTargeted: log.areasCovered,
        performanceMetrics: {
          coverageArea: Math.round(150 + Math.random() * 200),
          efficiency: Math.round(85 + Math.random() * 15),
          qualityScore: Math.round(88 + Math.random() * 12),
        },
      },
      operationalDetails: {
        batteryUsage: {
          startLevel: Math.round(85 + Math.random() * 15),
          endLevel: Math.round(60 + Math.random() * 20),
          consumptionRate:
            Math.round((log.energyConsumed / (log.duration / 60)) * 100) / 100,
        },
        navigationPath: generateNavigationPath(log),
        environmentalConditions: {
          temperature: Math.round(28 + Math.random() * 12),
          humidity: Math.round(45 + Math.random() * 20),
          windSpeed: Math.round(8 + Math.random() * 15),
          irradiance: Math.round(850 + Math.random() * 200),
        },
      },
      resultsAnalysis: {
        panelsProcessed: Math.round(400 + Math.random() * 300),
        issuesDetected: generateIssuesDetected(log.taskType),
        efficiencyImprovement: Math.round((Math.random() * 3 + 1) * 100) / 100,
        recommendations: generateRecommendations(log.taskType),
      },
      timelineData: generateActivityTimelineData(log),
    };
  };

  const generateTaskObjective = (taskType: string): string => {
    switch (taskType) {
      case "Panel Cleaning":
        return "Remove dust, debris, and soiling from solar panel surfaces to optimize light absorption and energy output";
      case "Thermal Inspection":
        return "Conduct thermal imaging analysis to identify hotspots, defective cells, and potential electrical issues";
      case "Dust Removal":
        return "Systematic cleaning operation to remove accumulated dust and particulate matter from panel arrays";
      case "Visual Inspection":
        return "Visual assessment of panel condition, mounting structures, and overall system integrity";
      default:
        return "Execute assigned robotic maintenance and monitoring tasks according to operational protocols";
    }
  };

  const generateNavigationPath = (log: RobotActivityLog) => {
    const path = [];
    const startTime = new Date(log.timestamp);
    const intervalMinutes = log.duration / 6;

    for (let i = 0; i < 6; i++) {
      const time = new Date(startTime.getTime() + i * intervalMinutes * 60000);
      path.push({
        time: time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        location:
          log.areasCovered[i % log.areasCovered.length] || `Position ${i + 1}`,
        action:
          i === 0
            ? "Task Initiated"
            : i === 5
              ? "Task Completed"
              : `Processing Area ${i}`,
      });
    }
    return path;
  };

  const generateIssuesDetected = (taskType: string) => {
    const baseIssues = [
      {
        type: "Dust Accumulation",
        location: "Row 15, Panel 23",
        severity: "Medium",
        action: "Scheduled for cleaning",
      },
      {
        type: "Bird Droppings",
        location: "Row 12, Panel 8",
        severity: "Low",
        action: "Cleaned during operation",
      },
    ];

    if (taskType === "Thermal Inspection") {
      baseIssues.push(
        {
          type: "Hotspot Detected",
          location: "Row 8, Panel 15",
          severity: "High",
          action: "Flagged for maintenance",
        },
        {
          type: "Temperature Variance",
          location: "Row 10, Panel 3",
          severity: "Medium",
          action: "Monitoring required",
        },
      );
    }

    return baseIssues;
  };

  const generateRecommendations = (taskType: string): string[] => {
    const baseRecommendations = [
      "Schedule routine maintenance for optimal performance",
      "Monitor weather conditions for cleaning optimization",
      "Consider preventive measures for bird activity",
    ];

    switch (taskType) {
      case "Thermal Inspection":
        baseRecommendations.push(
          "Investigate electrical connections in flagged areas",
          "Schedule follow-up thermal inspection in 2 weeks",
        );
        break;
      case "Panel Cleaning":
        baseRecommendations.push(
          "Adjust cleaning frequency based on soiling rate",
          "Optimize cleaning solution concentration",
        );
        break;
    }

    return baseRecommendations;
  };

  const generateActivityTimelineData = (log: RobotActivityLog) => {
    const data = [];
    const startTime = new Date(log.timestamp);
    const intervalMinutes = log.duration / 10;

    for (let i = 0; i <= 10; i++) {
      const time = new Date(startTime.getTime() + i * intervalMinutes * 60000);
      data.push({
        time: time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        progress: Math.round((i / 10) * 100),
        batteryLevel: Math.round(95 - i * 3 - Math.random() * 5),
        efficiency: Math.round(85 + Math.random() * 10),
      });
    }

    return data;
  };

  const handleExportActivityReport = () => {
    if (!selectedActivityLog) return;
    console.log(`Exporting activity report for: ${selectedActivityLog.id}`);
  };

  const robotTypeDistribution = [
    {
      name: "Cleaning Bots",
      value: robots.filter((r) => r.type === "Cleaning Bot").length,
    },
    {
      name: "Inspection Drones",
      value: robots.filter((r) => r.type === "Inspection Drone").length,
    },
    {
      name: "Maintenance Bots",
      value: robots.filter((r) => r.type === "Maintenance Bot").length,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <PlantNavigation />

      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {plant.name} - Robotic Systems
            </h1>
            <p className="text-muted-foreground">
              Manage and monitor robotic cleaning and inspection systems
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Activity className="w-4 h-4" />
              Fleet Status
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export Logs
            </Button>
          </div>
        </div>

        {/* Robot Fleet KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Total Robots
                  </div>
                  <div className="text-2xl font-bold">{totalRobots}</div>
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
                    Operational
                  </div>
                  <div className="text-2xl font-bold text-success">
                    {operationalRobots}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Under Maintenance
                  </div>
                  <div className="text-2xl font-bold text-warning">
                    {robotsUnderMaintenance}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-info" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Scheduled Today
                  </div>
                  <div className="text-2xl font-bold text-info">
                    {scheduledOperationsToday}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Robot Utilization */}
          <Card>
            <CardHeader>
              <CardTitle>Robot Utilization Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={robotUtilization}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  {/* <Legend /> */}
                  <Line
                    type="monotone"
                    dataKey="cleaning"
                    stroke="#F5C842"
                    strokeWidth={2}
                    name="Cleaning %"
                  />
                  <Line
                    type="monotone"
                    dataKey="inspection"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Inspection %"
                  />
                  <Line
                    type="monotone"
                    dataKey="maintenance"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Maintenance %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Robot Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Fleet Composition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={robotTypeDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={false}
                    >
                      {robotTypeDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {robotTypeDistribution.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
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

        {/* Robot Fleet Status */}
        <Card>
          <CardHeader>
            <CardTitle>Robot Fleet Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-sm">Robot</th>
                    <th className="text-left p-4 font-medium text-sm">Type</th>
                    <th className="text-left p-4 font-medium text-sm">
                      Current Task
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Battery
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Last Operation
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Location
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Status
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Next Maintenance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {robots.map((robot) => (
                    <tr key={robot.id} className="border-t hover:bg-muted/30">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{robot.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {robot.operationalHours}h operational
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">{robot.type}</Badge>
                      </td>
                      <td className="p-4 text-sm">{robot.currentTask}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Battery
                            className={`w-4 h-4 ${getBatteryColor(robot.batteryStatus)}`}
                          />
                          <span
                            className={`font-medium ${getBatteryColor(robot.batteryStatus)}`}
                          >
                            {robot.batteryStatus}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        {new Date(robot.lastOperationTime).toLocaleString()}
                      </td>
                      <td className="p-4 text-sm">{robot.location}</td>
                      <td className="p-4">
                        <Badge variant={getStatusColor(robot.status) as any}>
                          {robot.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm">
                        {new Date(
                          robot.maintenanceDueDate,
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Task Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Task Schedule</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-sm">Robot</th>
                    <th className="text-left p-4 font-medium text-sm">
                      Task Type
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Scheduled Time
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Duration
                    </th>
                    <th className="text-left p-4 font-medium text-sm">Area</th>
                    <th className="text-left p-4 font-medium text-sm">
                      Priority
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id} className="border-t hover:bg-muted/30">
                      <td className="p-4 font-medium">{task.robotName}</td>
                      <td className="p-4 text-sm">{task.taskType}</td>
                      <td className="p-4 text-sm">
                        {new Date(task.scheduledTime).toLocaleString()}
                      </td>
                      <td className="p-4 text-sm">{task.duration} min</td>
                      <td className="p-4 text-sm">{task.area}</td>
                      <td className="p-4">
                        <Badge variant={getPriorityColor(task.priority) as any}>
                          {task.priority.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={getTaskStatusColor(task.status) as any}>
                          {task.status.replace("-", " ").toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Robot Activity Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityLog.map((log) => (
                <div key={log.id} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{log.taskType}</Badge>
                      <span className="font-medium">{log.robotName}</span>
                      <span className="text-sm text-muted-foreground">
                        {log.duration} min
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm mb-2">{log.resultSummary}</div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Areas: {log.areasCovered.join(", ")} | Energy:{" "}
                      {log.energyConsumed} kWh
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewActivityDetails(log)}
                      title="View Activity Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Status */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Status</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-sm">Robot</th>
                    <th className="text-left p-4 font-medium text-sm">Type</th>
                    <th className="text-left p-4 font-medium text-sm">
                      Scheduled
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Technician
                    </th>
                    <th className="text-left p-4 font-medium text-sm">Cost</th>
                    <th className="text-left p-4 font-medium text-sm">
                      Status
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {maintenanceRecords.map((record) => (
                    <tr key={record.id} className="border-t hover:bg-muted/30">
                      <td className="p-4 font-medium">{record.robotName}</td>
                      <td className="p-4">
                        <Badge variant="secondary">
                          {record.maintenanceType}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm">
                        {new Date(record.scheduledDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm">{record.technician}</td>
                      <td className="p-4 font-medium">
                        {record.cost.toLocaleString()} AED
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            getMaintenanceStatusColor(record.status) as any
                          }
                        >
                          {record.status.replace("-", " ").toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm max-w-xs truncate">
                        {record.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Robot Activity Detail Panel */}
      {isDetailPanelOpen && selectedActivityLog && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9999] flex">
          {/* Backdrop */}
          <div className="flex-1" onClick={handleCloseDetailPanel} />

          {/* Detail Panel */}
          <div className="w-[800px] bg-background shadow-2xl flex flex-col h-full border-l overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 to-info/10 border-b p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    Robot Activity Details
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedActivityLog.robotName} -{" "}
                    {selectedActivityLog.taskType}
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
                const detailData = generateRobotDetailData(selectedActivityLog);
                return (
                  <>
                    {/* 1. Activity Metadata */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-base flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Activity Metadata
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">
                              Activity ID:
                            </span>
                            <div className="font-mono text-sm">
                              {detailData.metadata.logId}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">
                              Robot Name:
                            </span>
                            <div className="text-sm">
                              {detailData.metadata.robotName}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">
                              Robot Type:
                            </span>
                            <div className="text-sm">
                              {detailData.metadata.robotType}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">
                              Task Type:
                            </span>
                            <div className="text-sm">
                              {detailData.metadata.taskType}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">
                              Start Time:
                            </span>
                            <div className="text-sm">
                              {new Date(
                                detailData.metadata.timestamp,
                              ).toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">
                              Duration:
                            </span>
                            <div className="text-sm">
                              {detailData.metadata.duration} minutes
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">
                              Energy Consumed:
                            </span>
                            <div className="text-sm">
                              {detailData.metadata.energyConsumed} kWh
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. Task Summary */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-base flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        Task Summary & Objectives
                      </h4>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="text-sm leading-relaxed mb-4">
                          {detailData.taskSummary.objective}
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium">
                                Coverage Area
                              </span>
                            </div>
                            <div className="text-lg font-bold text-blue-700">
                              {
                                detailData.taskSummary.performanceMetrics
                                  .coverageArea
                              }{" "}
                              m²
                            </div>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium">
                                Efficiency
                              </span>
                            </div>
                            <div className="text-lg font-bold text-green-700">
                              {
                                detailData.taskSummary.performanceMetrics
                                  .efficiency
                              }
                              %
                            </div>
                          </div>
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-4 h-4 text-purple-600" />
                              <span className="text-sm font-medium">
                                Quality Score
                              </span>
                            </div>
                            <div className="text-lg font-bold text-purple-700">
                              {
                                detailData.taskSummary.performanceMetrics
                                  .qualityScore
                              }
                              %
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <span className="text-sm font-medium">
                            Areas Targeted:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {detailData.taskSummary.areasTargeted.map(
                              (area, index) => (
                                <Badge key={index} variant="secondary">
                                  {area}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. Operational Details */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-base flex items-center gap-2">
                        <Settings className="w-4 h-4 text-primary" />
                        Operational Details
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <div className="p-4 bg-muted/30 rounded-lg">
                            <h5 className="font-medium mb-3 flex items-center gap-2">
                              <Battery className="w-4 h-4" />
                              Battery Usage
                            </h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Start Level:</span>
                                <span className="font-medium">
                                  {
                                    detailData.operationalDetails.batteryUsage
                                      .startLevel
                                  }
                                  %
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>End Level:</span>
                                <span className="font-medium">
                                  {
                                    detailData.operationalDetails.batteryUsage
                                      .endLevel
                                  }
                                  %
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Consumption Rate:</span>
                                <span className="font-medium">
                                  {
                                    detailData.operationalDetails.batteryUsage
                                      .consumptionRate
                                  }
                                  %/hr
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 bg-muted/30 rounded-lg">
                            <h5 className="font-medium mb-3">
                              Environmental Conditions
                            </h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Temperature:</span>
                                <span className="font-medium">
                                  {
                                    detailData.operationalDetails
                                      .environmentalConditions.temperature
                                  }
                                  °C
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Humidity:</span>
                                <span className="font-medium">
                                  {
                                    detailData.operationalDetails
                                      .environmentalConditions.humidity
                                  }
                                  %
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Wind Speed:</span>
                                <span className="font-medium">
                                  {
                                    detailData.operationalDetails
                                      .environmentalConditions.windSpeed
                                  }{" "}
                                  km/h
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Irradiance:</span>
                                <span className="font-medium">
                                  {
                                    detailData.operationalDetails
                                      .environmentalConditions.irradiance
                                  }{" "}
                                  W/m²
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <h5 className="font-medium mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Navigation Path
                          </h5>
                          <div className="space-y-3">
                            {detailData.operationalDetails.navigationPath.map(
                              (step, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-3"
                                >
                                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                                    {index + 1}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium">
                                      {step.time}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {step.location}
                                    </div>
                                    <div className="text-xs">{step.action}</div>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 4. Results Analysis */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-base flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        Results Analysis
                      </h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Activity className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium">
                                Panels Processed
                              </span>
                            </div>
                            <div className="text-lg font-bold text-blue-700">
                              {detailData.resultsAnalysis.panelsProcessed}
                            </div>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Zap className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium">
                                Efficiency Improvement
                              </span>
                            </div>
                            <div className="text-lg font-bold text-green-700">
                              +
                              {detailData.resultsAnalysis.efficiencyImprovement}
                              %
                            </div>
                          </div>
                        </div>
                        {detailData.resultsAnalysis.issuesDetected.length >
                          0 && (
                          <div className="p-4 bg-yellow-50 rounded-lg">
                            <h5 className="font-medium mb-3 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-yellow-600" />
                              Issues Detected
                            </h5>
                            <div className="space-y-2">
                              {detailData.resultsAnalysis.issuesDetected.map(
                                (issue, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-2 bg-white rounded text-sm"
                                  >
                                    <div>
                                      <span className="font-medium">
                                        {issue.type}
                                      </span>
                                      <span className="text-muted-foreground">
                                        {" "}
                                        at {issue.location}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant={
                                          issue.severity === "High"
                                            ? "destructive"
                                            : issue.severity === "Medium"
                                              ? "warning"
                                              : "secondary"
                                        }
                                      >
                                        {issue.severity}
                                      </Badge>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <h5 className="font-medium mb-3">Recommendations</h5>
                          <div className="space-y-2">
                            {detailData.resultsAnalysis.recommendations.map(
                              (rec, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-2 text-sm"
                                >
                                  <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                                  {rec}
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 5. Activity Timeline Graph */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-base flex items-center gap-2">
                        <Timer className="w-4 h-4 text-primary" />
                        Activity Timeline
                      </h4>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={detailData.timelineData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="progress"
                              stroke="#F5C842"
                              strokeWidth={2}
                              name="Task Progress %"
                            />
                            <Line
                              type="monotone"
                              dataKey="batteryLevel"
                              stroke="#EF4444"
                              strokeWidth={2}
                              name="Battery Level %"
                            />
                            <Line
                              type="monotone"
                              dataKey="efficiency"
                              stroke="#10B981"
                              strokeWidth={2}
                              name="Efficiency %"
                            />
                          </LineChart>
                        </ResponsiveContainer>
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
                    onClick={handleExportActivityReport}
                    className="gap-2"
                  >
                    <FileDown className="w-3 h-3" />
                    Export PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportActivityReport}
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
    </div>
  );
}
