import { useState, useEffect } from "react";
import { Plant } from "@shared/interface";
import { getPlants } from "@shared/api";
import { useParams } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAlert } from "@/hooks/use-alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  FileBarChart,
  Download,
  Calendar,
  FileText,
  DollarSign,
  Settings,
  AlertTriangle,
  Clock,
  TrendingDown,
  Shield,
  Heart,
  Activity,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import PlantNavigation from "@/components/PlantNavigation";

interface ReportConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  type: "operational" | "financial" | "maintenance" | "compliance";
  dataPoints: number;
  estimatedTime: string;
}

interface MaintenanceActivity {
  task: string;
  component: string;
  scheduled: string;
  completed: string | null;
  status: "completed" | "pending" | "overdue";
  cost: number;
}

interface SLAMetric {
  metric: string;
  target: number;
  actual: number;
  unit: string;
  status: "compliant" | "warning" | "breach";
}

const reportConfigs: ReportConfig[] = [
  {
    id: "plant-health",
    name: "Plant Health Report",
    description:
      "Comprehensive health assessment with component status and maintenance tracking",
    icon: Heart,
    type: "operational",
    dataPoints: 45,
    estimatedTime: "2-3 min",
  },
  {
    id: "performance",
    name: "Performance Report",
    description:
      "Generation vs forecast analysis with downtime and energy loss tracking",
    icon: Activity,
    type: "operational",
    dataPoints: 38,
    estimatedTime: "2-3 min",
  },
  {
    id: "financial",
    name: "Financial Report",
    description:
      "Revenue analysis, O&M expenses, and ROI tracking with cost breakdown",
    icon: DollarSign,
    type: "financial",
    dataPoints: 32,
    estimatedTime: "3-4 min",
  },
  {
    id: "maintenance",
    name: "Preventive Maintenance Report",
    description:
      "PM task tracking, completion efficiency, and maintenance cost analysis",
    icon: Settings,
    type: "maintenance",
    dataPoints: 28,
    estimatedTime: "2-3 min",
  },
  {
    id: "underperformance",
    name: "Underperformance Analysis Report",
    description:
      "Underperforming assets identification with fault correlation analysis",
    icon: TrendingDown,
    type: "operational",
    dataPoints: 25,
    estimatedTime: "2-3 min",
  },
  {
    id: "sla-compliance",
    name: "SLA Compliance Report",
    description:
      "Service level agreement metrics with compliance tracking and penalty analysis",
    icon: Shield,
    type: "compliance",
    dataPoints: 22,
    estimatedTime: "1-2 min",
  },
  {
    id: "warranty",
    name: "Warranty Status Report",
    description:
      "Warranty tracking, expiration timeline, and claims management overview",
    icon: FileText,
    type: "compliance",
    dataPoints: 18,
    estimatedTime: "1-2 min",
  },
];

// Mock data generators for reports
const generatePlantHealthData = () => ({
  overallScore: 87.5,
  components: [
    { name: "Solar Panels", health: 92, status: "healthy", issues: 0 },
    { name: "Inverters", health: 85, status: "warning", issues: 2 },
    { name: "Tracking System", health: 78, status: "warning", issues: 3 },
    { name: "DC Combiners", health: 94, status: "healthy", issues: 1 },
    { name: "Transformers", health: 96, status: "healthy", issues: 0 },
    { name: "Grid Connection", health: 89, status: "healthy", issues: 0 },
  ],
  faultsSummary: { critical: 1, high: 3, medium: 8, low: 12 },
  degradationTrend: [
    { month: "Jan", score: 89.2 },
    { month: "Feb", score: 88.8 },
    { month: "Mar", score: 88.5 },
    { month: "Apr", score: 87.9 },
    { month: "May", score: 87.5 },
    { month: "Jun", score: 87.2 },
  ],
});

const generatePerformanceData = () => ({
  generationSummary: {
    actual: 8750,
    forecast: 8500,
    variance: 2.9,
  },
  monthlyGeneration: [
    { month: "Jan", actual: 1250, forecast: 1200 },
    { month: "Feb", actual: 1380, forecast: 1400 },
    { month: "Mar", actual: 1520, forecast: 1480 },
    { month: "Apr", actual: 1680, forecast: 1650 },
    { month: "May", actual: 1590, forecast: 1620 },
    { month: "Jun", actual: 1330, forecast: 1350 },
  ],
  kpis: {
    pr: 86.5,
    cuf: 23.8,
    availability: 98.2,
  },
  downtimeSummary: {
    totalHours: 142,
    energyLost: 385,
    revenuelost: 15400,
  },
});

const generateFinancialData = () => ({
  revenue: {
    total: 2450000,
    monthly: [
      { month: "Jan", revenue: 385000 },
      { month: "Feb", revenue: 420000 },
      { month: "Mar", revenue: 465000 },
      { month: "Apr", revenue: 485000 },
      { month: "May", revenue: 445000 },
      { month: "Jun", revenue: 350000 },
    ],
  },
  expenses: {
    om: 185000,
    maintenance: 125000,
    replacement: 45000,
    insurance: 35000,
  },
  roi: {
    current: 12.8,
    target: 12.0,
    paybackProgress: 68.5,
  },
});

const generateMaintenanceData = (): MaintenanceActivity[] => [
  {
    task: "Inverter Annual Service",
    component: "INV-001",
    scheduled: "2024-01-15",
    completed: "2024-01-16",
    status: "completed",
    cost: 2500,
  },
  {
    task: "Panel Cleaning",
    component: "Block A",
    scheduled: "2024-01-20",
    completed: "2024-01-20",
    status: "completed",
    cost: 1200,
  },
  {
    task: "Tracker Calibration",
    component: "TRK-005",
    scheduled: "2024-02-01",
    completed: null,
    status: "overdue",
    cost: 800,
  },
  {
    task: "Weather Station Service",
    component: "WS-001",
    scheduled: "2024-02-15",
    completed: null,
    status: "pending",
    cost: 600,
  },
];

const generateSLAData = (): SLAMetric[] => [
  {
    metric: "System Uptime",
    target: 98.0,
    actual: 98.7,
    unit: "%",
    status: "compliant",
  },
  {
    metric: "Response Time",
    target: 4.0,
    actual: 3.2,
    unit: "hours",
    status: "compliant",
  },
  {
    metric: "Resolution Time",
    target: 24.0,
    actual: 18.5,
    unit: "hours",
    status: "compliant",
  },
  {
    metric: "Availability",
    target: 97.5,
    actual: 96.8,
    unit: "%",
    status: "warning",
  },
  {
    metric: "PR Achievement",
    target: 85.0,
    actual: 86.5,
    unit: "%",
    status: "compliant",
  },
];

const generateUnderperformanceData = () => ({
  underperformingAssets: [
    { asset: "Inverter INV-005", performance: 87.2, expected: 95.8, loss: 8.6 },
    { asset: "String STR-012", performance: 82.1, expected: 88.5, loss: 6.4 },
    { asset: "Tracker TRK-008", performance: 79.5, expected: 85.0, loss: 5.5 },
  ],
  totalRevenueLoss: 28500,
  faultCorrelation: [
    { fault: "DC Isolation Issues", occurrences: 8, impactScore: 7.2 },
    { fault: "Tracking Errors", occurrences: 5, impactScore: 6.8 },
    { fault: "Grid Voltage Variations", occurrences: 3, impactScore: 8.9 },
  ],
});

const generateWarrantyData = () => ({
  componentsUnderWarranty: [
    {
      component: "Inverter INV-001",
      warranty: "Active",
      expires: "2025-08-15",
      value: 25000,
    },
    {
      component: "Panel Block A",
      warranty: "Active",
      expires: "2029-12-31",
      value: 180000,
    },
    {
      component: "Tracker TRK-001",
      warranty: "Expiring",
      expires: "2024-06-30",
      value: 15000,
    },
  ],
  claimsValue: { claimed: 45000, remaining: 220000 },
  expiringWarranties: 3,
});

const COLORS = ["#F5C842", "#10B981", "#3B82F6", "#EF4444", "#8B5CF6"];

export default function PlantReports() {
  const alert = useAlert();
  const { plantId } = useParams<{ plantId: string }>();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("last-6-months");
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: plants = [] } = useQuery<Plant[]>({ queryKey: ['plants'], queryFn: () => getPlants() as Promise<Plant[]> });

  useEffect(() => {
    if (plantId) {
      const selectedPlant = JSON.parse( localStorage.getItem('selectedPlant') || '{}');
      setPlant(selectedPlant || null);
    }
  }, [plantId, plants]);

  if (!plant) {
    return <div>Plant not found</div>;
  }

  const getTypeColor = (type: ReportConfig["type"]) => {
    switch (type) {
      case "operational":
        return "primary";
      case "financial":
        return "success";
      case "maintenance":
        return "warning";
      case "compliance":
        return "info";
      default:
        return "secondary";
    }
  };

  const handleGenerateReport = (reportId: string) => {
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      setSelectedReport(reportId);
    }, 2000);
  };

  const handleExportReport = (reportId: string) => {
    alert.featureUnderConstruction('Report export');
  };

  const renderReportPreview = (reportId: string) => {
    switch (reportId) {
      case "plant-health":
        const healthData = generatePlantHealthData();
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {healthData.overallScore}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Overall Health Score
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-destructive mb-2">
                      {healthData.faultsSummary.critical +
                        healthData.faultsSummary.high}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Active Critical/High Faults
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-success mb-2">
                      {
                        healthData.components.filter(
                          (c) => c.status === "healthy",
                        ).length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Healthy Components
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Component Health Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthData.components.map((component, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="font-medium">{component.name}</div>
                        <Badge
                          variant={
                            component.status === "healthy"
                              ? "success"
                              : ("warning" as any)
                          }
                        >
                          {component.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32">
                          <Progress value={component.health} className="h-2" />
                        </div>
                        <div className="text-sm font-medium">
                          {component.health}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {component.issues} issues
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Health Degradation Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={healthData.degradationTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[85, 92]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#F5C842"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        );

      case "performance":
        const perfData = generatePerformanceData();
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {perfData.generationSummary.actual.toLocaleString()} MWh
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Generation
                    </div>
                    <div className="text-xs text-success mt-1">
                      +{perfData.generationSummary.variance}% vs Forecast
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {perfData.kpis.pr}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Performance Ratio
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-warning mb-2">
                      {perfData.downtimeSummary.totalHours}h
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Downtime
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Generation vs Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={perfData.monthlyGeneration}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="actual"
                      fill="#F5C842"
                      name="Actual Generation"
                    />
                    <Bar dataKey="forecast" fill="#10B981" name="Forecast" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        );

      case "financial":
        const finData = generateFinancialData();
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success mb-2">
                      ${(finData.revenue.total / 1000000).toFixed(2)}M
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Revenue
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning mb-2">
                      ${(finData.expenses.om / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-muted-foreground">
                      O&M Expenses
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-2">
                      {finData.roi.current}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Current ROI
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-info mb-2">
                      {finData.roi.paybackProgress}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Payback Progress
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={finData.revenue.monthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        `$${Number(value).toLocaleString()}`,
                        "Revenue",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10B981"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        );

      case "maintenance":
        const maintData = generateMaintenanceData();
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-success mb-2">
                      {maintData.filter((m) => m.status === "completed").length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Completed Tasks
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-warning mb-2">
                      {maintData.filter((m) => m.status === "pending").length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Pending Tasks
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-destructive mb-2">
                      {maintData.filter((m) => m.status === "overdue").length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Overdue Tasks
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Task</th>
                        <th className="text-left p-3 font-medium">Component</th>
                        <th className="text-left p-3 font-medium">Scheduled</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-left p-3 font-medium">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {maintData.map((activity, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3">{activity.task}</td>
                          <td className="p-3">{activity.component}</td>
                          <td className="p-3">
                            {new Date(activity.scheduled).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <Badge
                              variant={
                                activity.status === "completed"
                                  ? "success"
                                  : activity.status === "overdue"
                                    ? "destructive"
                                    : ("warning" as any)
                              }
                            >
                              {activity.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            ${activity.cost.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "sla-compliance":
        const slaData = generateSLAData();
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-success mb-2">
                      {slaData.filter((m) => m.status === "compliant").length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Compliant Metrics
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-warning mb-2">
                      {slaData.filter((m) => m.status === "warning").length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Warning Metrics
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-destructive mb-2">
                      {slaData.filter((m) => m.status === "breach").length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      SLA Breaches
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>SLA Metrics Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {slaData.map((metric, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="font-medium">{metric.metric}</div>
                        <Badge
                          variant={
                            metric.status === "compliant"
                              ? "success"
                              : metric.status === "warning"
                                ? "warning"
                                : ("destructive" as any)
                          }
                        >
                          {metric.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <span className="font-medium">{metric.actual}</span>
                          <span className="text-muted-foreground">
                            /{metric.target} {metric.unit}
                          </span>
                        </div>
                        <div
                          className={`text-sm font-medium ${
                            metric.actual >= metric.target
                              ? "text-success"
                              : "text-destructive"
                          }`}
                        >
                          {metric.actual >= metric.target ? "✓" : "✗"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <div className="text-muted-foreground">
              Report preview will appear here
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <PlantNavigation />

      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        {/* <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {plant.name} - Reports Hub
            </h1>
            <p className="text-muted-foreground">
              Generate comprehensive operational and financial reports
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="w-4 h-4" />
              Custom Range
            </Button>
          </div>
        </div> */}

        {/* Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {reportConfigs.map((report) => {
            const Icon = report.icon;
            return (
              <Card
                key={report.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 bg-${getTypeColor(report.type)}/10 rounded-lg flex items-center justify-center`}
                      >
                        <Icon
                          className={`w-5 h-5 text-${getTypeColor(report.type)}`}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{report.name}</CardTitle>
                        <Badge
                          variant={getTypeColor(report.type) as any}
                          className="mt-1"
                        >
                          {report.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {report.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{report.dataPoints} data points</span>
                      <span>{report.estimatedTime}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleGenerateReport(report.id)}
                            disabled={isGenerating}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {isGenerating ? "Generating..." : "Preview"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Icon className="w-5 h-5" />
                              {report.name} - {plant.name}
                            </DialogTitle>
                          </DialogHeader>
                          {selectedReport === report.id &&
                            renderReportPreview(report.id)}
                        </DialogContent>
                      </Dialog>

                      <Button variant="default" size="sm" className="gap-2" onClick={() => handleExportReport(report.id)}>
                        <Download className="w-4 h-4" />
                        PDF
                      </Button>

                      <Button variant="secondary" size="sm" className="gap-2" onClick={() => handleExportReport(report.id)}>
                        <Download className="w-4 h-4" />
                        CSV
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Report Generation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">7</div>
                <div className="text-sm text-muted-foreground">
                  Available Reports
                </div>
              </div>
              <div className="text-center p-4 bg-success/10 rounded-lg">
                <div className="text-2xl font-bold text-success">245</div>
                <div className="text-sm text-muted-foreground">
                  Total Data Points
                </div>
              </div>
              <div className="text-center p-4 bg-info/10 rounded-lg">
                <div className="text-2xl font-bold text-info">15-20</div>
                <div className="text-sm text-muted-foreground">
                  Avg. Generation Time (min)
                </div>
              </div>
              <div className="text-center p-4 bg-warning/10 rounded-lg">
                <div className="text-2xl font-bold text-warning">PDF/CSV</div>
                <div className="text-sm text-muted-foreground">
                  Export Formats
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
