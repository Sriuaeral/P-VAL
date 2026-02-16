import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Plant } from "@shared/interface";
import PlantNavigation from '@/components/PlantNavigation';
import { plantsService } from "@shared/api";
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
  ComposedChart,
} from "recharts";
import {
  Battery,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Thermometer,
  Activity,
  Clock,
  DollarSign,
  Download,
  Settings,
  Play,
  Pause,
  Square,
} from "lucide-react";

interface BatterySystem {
  id: string;
  name: string;
  capacity: number; // MWh
  availableCapacity: number; // MWh
  soc: number; // %
  soh: number; // %
  status: "charging" | "discharging" | "idle" | "maintenance";
  temperature: number; // °C
  cycleCount: number;
  voltage: number; // V
  current: number; // A
}

interface BatteryEvent {
  timestamp: string;
  event: string;
  type: "charging" | "discharging" | "maintenance" | "alert";
  duration: number; // minutes
  energyTransfer: number; // MWh
}

interface BatteryAlert {
  id: string;
  timestamp: string;
  severity: "critical" | "high" | "medium" | "low";
  message: string;
  component: string;
  status: "active" | "resolved";
}

// Mock data generators
const generateBatterySystem = (): BatterySystem => ({
  id: "BESS-001",
  name: "Main Battery Storage",
  capacity: 50, // 50 MWh
  availableCapacity: 47.5,
  soc: 68.5,
  soh: 94.2,
  status: "charging",
  temperature: 28.5,
  cycleCount: 1247,
  voltage: 800.2,
  current: 125.6,
});

const generateSOCTrend = () => {
  const now = new Date();
  const data = [];
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const baseSOC = 50 + 30 * Math.sin((i * Math.PI) / 12);
    data.push({
      time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      soc: Math.max(10, Math.min(90, baseSOC + Math.random() * 10 - 5)),
      charging: i > 12 ? baseSOC * 0.8 : 0,
      discharging: i <= 12 ? baseSOC * 0.6 : 0,
    });
  }
  return data;
};

const generateSOHTrend = () => [
  { month: "Jan", soh: 95.8, cycles: 1180 },
  { month: "Feb", soh: 95.5, cycles: 1200 },
  { month: "Mar", soh: 95.1, cycles: 1220 },
  { month: "Apr", soh: 94.8, cycles: 1235 },
  { month: "May", soh: 94.5, cycles: 1247 },
  { month: "Jun", soh: 94.2, cycles: 1260 },
];

const generateDailyEnergyFlow = () => [
  { date: "Mon", charged: 35.2, discharged: 28.7, net: 6.5 },
  { date: "Tue", charged: 42.1, discharged: 38.9, net: 3.2 },
  { date: "Wed", charged: 38.5, discharged: 35.2, net: 3.3 },
  { date: "Thu", charged: 45.8, discharged: 41.2, net: 4.6 },
  { date: "Fri", charged: 41.2, discharged: 39.5, net: 1.7 },
  { date: "Sat", charged: 39.7, discharged: 33.1, net: 6.6 },
  { date: "Sun", charged: 37.8, discharged: 31.4, net: 6.4 },
];

const generateTemperatureData = () => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  return hours.map((hour) => ({
    hour: `${hour}:00`,
    batteryTemp: 25 + 8 * Math.sin((hour * Math.PI) / 12) + Math.random() * 2,
    ambientTemp:
      20 + 12 * Math.sin(((hour - 6) * Math.PI) / 12) + Math.random() * 2,
    threshold: 35,
  }));
};

const generateBatteryEvents = (): BatteryEvent[] => [
  {
    timestamp: "2024-01-15T09:30:00Z",
    event: "Charging cycle started",
    type: "charging",
    duration: 180,
    energyTransfer: 12.5,
  },
  {
    timestamp: "2024-01-15T06:45:00Z",
    event: "Peak shaving discharge",
    type: "discharging",
    duration: 90,
    energyTransfer: -8.2,
  },
  {
    timestamp: "2024-01-15T02:15:00Z",
    event: "Scheduled maintenance completed",
    type: "maintenance",
    duration: 120,
    energyTransfer: 0,
  },
  {
    timestamp: "2024-01-14T18:20:00Z",
    event: "Evening peak discharge",
    type: "discharging",
    duration: 240,
    energyTransfer: -15.8,
  },
  {
    timestamp: "2024-01-14T11:30:00Z",
    event: "Solar excess charging",
    type: "charging",
    duration: 300,
    energyTransfer: 18.9,
  },
];

const generateBatteryAlerts = (): BatteryAlert[] => [
  {
    id: "alert-1",
    timestamp: "2024-01-15T08:45:00Z",
    severity: "medium",
    message: "Battery temperature approaching upper threshold",
    component: "Thermal Management",
    status: "active",
  },
  {
    id: "alert-2",
    timestamp: "2024-01-15T03:20:00Z",
    severity: "low",
    message: "Cell voltage variance detected in Pack 3",
    component: "Battery Pack 3",
    status: "resolved",
  },
  {
    id: "alert-3",
    timestamp: "2024-01-14T19:15:00Z",
    severity: "high",
    message: "Rapid SOC decline during discharge cycle",
    component: "BMS Controller",
    status: "resolved",
  },
];

const generateFinancialData = () => ({
  energyArbitrage: {
    monthly: [
      { month: "Jan", revenue: 15200 },
      { month: "Feb", revenue: 18500 },
      { month: "Mar", revenue: 21800 },
      { month: "Apr", revenue: 19200 },
      { month: "May", revenue: 17600 },
      { month: "Jun", revenue: 16800 },
    ],
    total: 109100,
  },
  peakShaving: {
    costAvoided: 28500,
    demandChargeReduction: 12300,
  },
  operationalCosts: {
    maintenance: 5800,
    insurance: 2400,
    monitoring: 1200,
  },
  paybackProgress: 67.8,
});

const generateWarrantyData = () => [
  {
    component: "Battery Pack 1",
    warrantyStatus: "Active",
    expiryDate: "2029-03-15",
    coverage: "Full",
    remainingValue: 125000,
  },
  {
    component: "Battery Pack 2",
    warrantyStatus: "Active",
    expiryDate: "2029-03-15",
    coverage: "Full",
    remainingValue: 125000,
  },
  {
    component: "BMS System",
    warrantyStatus: "Active",
    expiryDate: "2027-08-20",
    coverage: "Components",
    remainingValue: 45000,
  },
  {
    component: "Cooling System",
    warrantyStatus: "Active",
    expiryDate: "2026-11-10",
    coverage: "Limited",
    remainingValue: 15000,
  },
];

const COLORS = ["#F5C842", "#10B981", "#3B82F6", "#EF4444", "#8B5CF6"];

export default function PlantBESS() {
  const { plantId } = useParams<{ plantId: string }>();
  const [plant, setPlant] = useState<Plant | null>(JSON.parse(localStorage.getItem('selectedPlant') || 'null'));
  const [batterySystem] = useState(generateBatterySystem());
  const [timeRange, setTimeRange] = useState("24h");

  useEffect(() => {
    let mounted = true;
    if (plantId) {
      (async () => {
        try {
          const plants = await plantsService.fetchPlants();
          if (!mounted) return;
          const selectedPlant = (plants || []).find((p: any) => String(p.id) === String(plantId));
          setPlant(selectedPlant || null);
        } catch (e) {
          if (mounted) setPlant(null);
        }
      })();
    }
    return () => { mounted = false; };
  }, [plantId]);

  if (!plant) {
    return <div>Plant not found</div>;
  }

  const socData = generateSOCTrend();
  const sohData = generateSOHTrend();
  const energyFlowData = generateDailyEnergyFlow();
  const tempData = generateTemperatureData();
  const events = generateBatteryEvents();
  const alerts = generateBatteryAlerts();
  const financialData = generateFinancialData();
  const warrantyData = generateWarrantyData();

  const getStatusColor = (status: BatterySystem["status"]) => {
    switch (status) {
      case "charging":
        return "success";
      case "discharging":
        return "warning";
      case "idle":
        return "secondary";
      case "maintenance":
        return "info";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: BatterySystem["status"]) => {
    switch (status) {
      case "charging":
        return Play;
      case "discharging":
        return TrendingDown;
      case "idle":
        return Pause;
      case "maintenance":
        return Settings;
      default:
        return Square;
    }
  };

  const getAlertColor = (severity: BatteryAlert["severity"]) => {
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

  // Create circular progress component for SOC and SOH
  const CircularProgress = ({
    value,
    size = 120,
    strokeWidth = 8,
    color = "#F5C842",
    label,
    unit,
  }: {
    value: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    label: string;
    unit: string;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-muted"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-in-out"
          />
        </svg>
        <div className="absolute text-center">
          <div className="text-2xl font-bold">{value.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">{unit}</div>
          <div className="text-xs font-medium">{label}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <PlantNavigation />

      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        {/* <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="3m">Last 3 months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>
        </div> */}

        {/* Battery Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SOC & SOH Gauges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Battery className="w-5 h-5 text-primary" />
                Battery Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-around items-center">
                <div className="text-center">
                  <CircularProgress
                    value={batterySystem.soc}
                    color="#10B981"
                    label="SOC"
                    unit="%"
                  />
                </div>
                <div className="text-center">
                  <CircularProgress
                    value={batterySystem.soh}
                    color="#F5C842"
                    label="SOH"
                    unit="%"
                  />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available:</span>
                  <span className="font-medium">
                    {batterySystem.availableCapacity} / {batterySystem.capacity}{" "}
                    MWh
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cycles:</span>
                  <span className="font-medium">
                    {batterySystem.cycleCount.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operational Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Operational Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Mode:</span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getStatusColor(batterySystem.status) as any}
                      className="gap-1 capitalize"
                    >
                      {React.createElement(
                        getStatusIcon(batterySystem.status),
                        {
                          className: "w-3 h-3",
                        },
                      )}
                      {batterySystem.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Voltage:</span>
                  <span className="font-medium">
                    {batterySystem.voltage.toFixed(1)} V
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current:</span>
                  <span className="font-medium">
                    {batterySystem.current.toFixed(1)} A
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Power:</span>
                  <span className="font-medium text-primary">
                    {(
                      (batterySystem.voltage * batterySystem.current) /
                      1000
                    ).toFixed(1)}{" "}
                    MW
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Temperature:</span>
                  <span
                    className={`font-medium ${
                      batterySystem.temperature > 35
                        ? "text-destructive"
                        : batterySystem.temperature > 30
                          ? "text-warning"
                          : "text-success"
                    }`}
                  >
                    {batterySystem.temperature.toFixed(1)}°C
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.filter((alert) => alert.status === "active").length ===
                0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No active alerts
                  </div>
                ) : (
                  alerts
                    .filter((alert) => alert.status === "active")
                    .map((alert) => (
                      <div
                        key={alert.id}
                        className="p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={getAlertColor(alert.severity) as any}
                            className="text-xs"
                          >
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {alert.component}
                          </span>
                        </div>
                        <div className="text-sm">{alert.message}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charge/Discharge Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SOC Trend */}
          <Card>
            <CardHeader>
              <CardTitle>SOC Trend (24 Hours)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={socData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="soc"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Daily Energy Flow */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Energy Flow (7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <ComposedChart data={energyFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  {/* <Legend /> */}
                  <Bar
                    dataKey="charged"
                    fill="#10B981"
                    name="Energy Charged (MWh)"
                  />
                  <Bar
                    dataKey="discharged"
                    fill="#F59E0B"
                    name="Energy Discharged (MWh)"
                  />
                  <Line
                    type="monotone"
                    dataKey="net"
                    stroke="#F5C842"
                    strokeWidth={2}
                    name="Net Energy (MWh)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Health Monitoring */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SOH Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Battery Health Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={sohData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[90, 100]} />
                  <Tooltip />
                  {/* <Legend /> */}
                  <Line
                    type="monotone"
                    dataKey="soh"
                    stroke="#F5C842"
                    strokeWidth={2}
                    name="SOH (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Temperature Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle>Temperature Monitoring (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={tempData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  {/* <Legend /> */}
                  <Line
                    type="monotone"
                    dataKey="batteryTemp"
                    stroke="#EF4444"
                    strokeWidth={2}
                    name="Battery Temp (°C)"
                  />
                  <Line
                    type="monotone"
                    dataKey="ambientTemp"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Ambient Temp (°C)"
                  />
                  <Line
                    type="monotone"
                    dataKey="threshold"
                    stroke="#F59E0B"
                    strokeDasharray="5 5"
                    name="Threshold"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Events and Financial */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Operational Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Recent Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.slice(0, 5).map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${
                        event.type === "charging"
                          ? "bg-success"
                          : event.type === "discharging"
                            ? "bg-warning"
                            : event.type === "maintenance"
                              ? "bg-info"
                              : "bg-destructive"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{event.event}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()} • {" "}
                        {event.duration}min
                        {event.energyTransfer !== 0 && (
                          <>
                            {" "}
                            • {Math.abs(event.energyTransfer).toFixed(1)} MWh
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Financial Impact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {/* <DollarSign className="w-5 h-5 text-success" /> */}
                Financial Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-success/10 rounded-lg">
                    <div className="text-lg font-bold text-success">
                      {financialData.energyArbitrage.total.toLocaleString()} AED
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Energy Arbitrage YTD
                    </div>
                  </div>
                  <div className="text-center p-3 bg-primary/10 rounded-lg">
                    <div className="text-lg font-bold text-primary">
                      {financialData.peakShaving.costAvoided.toLocaleString()} AED
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Peak Shaving Savings
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Payback Progress:
                    </span>
                    <span className="font-medium">
                      {financialData.paybackProgress}%
                    </span>
                  </div>
                  <Progress
                    value={financialData.paybackProgress}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">O&M Costs:</span>
                    <span>
                      {financialData.operationalCosts.maintenance.toLocaleString()} AED
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Insurance:</span>
                    <span>
                      {financialData.operationalCosts.insurance.toLocaleString()} AED
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monitoring:</span>
                    <span>
                      {financialData.operationalCosts.monitoring.toLocaleString()} AED
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Warranty Status */}
        <Card>
          <CardHeader>
            <CardTitle>Warranty Status & Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Component</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Expiry Date</th>
                    <th className="text-left p-3 font-medium">Coverage</th>
                    <th className="text-left p-3 font-medium">
                      Remaining Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {warrantyData.map((item, index) => (
                    <tr key={index} className="border-t hover:bg-muted/30">
                      <td className="p-3 font-medium">{item.component}</td>
                      <td className="p-3">
                        <Badge
                          variant={
                            item.warrantyStatus === "Active"
                              ? "success"
                              : ("warning" as any)
                          }
                        >
                          {item.warrantyStatus}
                        </Badge>
                      </td>
                      <td className="p-3">{item.expiryDate}</td>
                      <td className="p-3">{item.coverage}</td>
                      <td className="p-3">
                        {item.remainingValue.toLocaleString()} AED
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
