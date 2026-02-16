import { useState, useEffect } from "react";
import { Plant } from "@shared/interface";
//import PlantNavigation from '@/components/PlantNavigation';
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
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Navigation,
  RotateCcw,
  Zap,
  AlertTriangle,
  CheckCircle,
  Settings,
  Calendar,
  Download,
  Eye,
  TrendingUp,
  Clock,
} from "lucide-react";
import PlantNavigation from "@/components/PlantNavigation";

interface Tracker {
  id: string;
  name: string;
  zone: string;
  currentTiltAngle: number;
  optimalTiltAngle: number;
  azimuthAngle: number;
  status: "operational" | "maintenance" | "fault" | "calibrating";
  lastCalibration: string;
  operationalHours: number;
  motorHealth: number; // percentage
  sensorHealth: number; // percentage
  weatherResponse: "active" | "stowed" | "manual";
  powerGeneration: number; // kW
  efficiencyRating: number; // percentage
  maintenanceDue: string;
  faultDescription?: string;
}

interface TrackerPerformance {
  trackerId: string;
  trackerName: string;
  hour: number;
  tiltAngle: number;
  azimuthAngle: number;
  irradiance: number;
  powerOutput: number;
  efficiency: number;
}

interface TrackerZone {
  zoneId: string;
  zoneName: string;
  trackerCount: number;
  operationalTrackers: number;
  avgEfficiency: number;
  totalPowerOutput: number;
  maintenanceRequired: number;
}

interface CalibrationEvent {
  id: string;
  trackerId: string;
  trackerName: string;
  eventType: "Auto Calibration" | "Manual Calibration" | "Fault Recovery";
  timestamp: string;
  duration: number; // minutes
  status: "completed" | "failed" | "in-progress";
  technician?: string;
  notes: string;
}

// Mock data generators
const generateTrackers = (plantId: string): Tracker[] => [
  {
    id: "tracker-001",
    name: "Tracker Block A-01",
    zone: "Zone A",
    currentTiltAngle: 25.5,
    optimalTiltAngle: 26.2,
    azimuthAngle: 145.8,
    status: "operational",
    lastCalibration: "2024-01-10T08:00:00Z",
    operationalHours: 3240,
    motorHealth: 95,
    sensorHealth: 98,
    weatherResponse: "active",
    powerGeneration: 125.6,
    efficiencyRating: 94.2,
    maintenanceDue: "2024-03-15T10:00:00Z",
  },
  {
    id: "tracker-002",
    name: "Tracker Block A-02",
    zone: "Zone A",
    currentTiltAngle: 24.8,
    optimalTiltAngle: 26.2,
    azimuthAngle: 146.1,
    status: "operational",
    lastCalibration: "2024-01-08T09:30:00Z",
    operationalHours: 3156,
    motorHealth: 89,
    sensorHealth: 92,
    weatherResponse: "active",
    powerGeneration: 118.3,
    efficiencyRating: 91.8,
    maintenanceDue: "2024-02-28T11:00:00Z",
  },
  {
    id: "tracker-003",
    name: "Tracker Block B-01",
    zone: "Zone B",
    currentTiltAngle: 0,
    optimalTiltAngle: 26.5,
    azimuthAngle: 180,
    status: "fault",
    lastCalibration: "2024-01-05T07:45:00Z",
    operationalHours: 2987,
    motorHealth: 45,
    sensorHealth: 78,
    weatherResponse: "stowed",
    powerGeneration: 0,
    efficiencyRating: 0,
    maintenanceDue: "2024-01-20T09:00:00Z",
    faultDescription: "Motor drive failure - replacement required",
  },
  {
    id: "tracker-004",
    name: "Tracker Block B-02",
    zone: "Zone B",
    currentTiltAngle: 28.1,
    optimalTiltAngle: 26.5,
    azimuthAngle: 147.2,
    status: "calibrating",
    lastCalibration: "2024-01-15T14:00:00Z",
    operationalHours: 3401,
    motorHealth: 92,
    sensorHealth: 95,
    weatherResponse: "manual",
    powerGeneration: 105.2,
    efficiencyRating: 89.4,
    maintenanceDue: "2024-04-10T12:00:00Z",
  },
  {
    id: "tracker-005",
    name: "Tracker Block C-01",
    zone: "Zone C",
    currentTiltAngle: 26.7,
    optimalTiltAngle: 26.3,
    azimuthAngle: 144.9,
    status: "operational",
    lastCalibration: "2024-01-12T06:20:00Z",
    operationalHours: 3298,
    motorHealth: 97,
    sensorHealth: 99,
    weatherResponse: "active",
    powerGeneration: 132.8,
    efficiencyRating: 96.1,
    maintenanceDue: "2024-05-05T08:00:00Z",
  },
  {
    id: "tracker-006",
    name: "Tracker Block C-02",
    zone: "Zone C",
    currentTiltAngle: 25.9,
    optimalTiltAngle: 26.3,
    azimuthAngle: 145.4,
    status: "maintenance",
    lastCalibration: "2024-01-01T10:00:00Z",
    operationalHours: 3145,
    motorHealth: 78,
    sensorHealth: 88,
    weatherResponse: "manual",
    powerGeneration: 0,
    efficiencyRating: 0,
    maintenanceDue: "2024-01-18T13:00:00Z",
  },
];

const generateTrackerPerformance = (): TrackerPerformance[] => {
  const data: TrackerPerformance[] = [];
  const trackers = ["tracker-001", "tracker-002", "tracker-005"];

  for (let hour = 6; hour <= 18; hour++) {
    trackers.forEach((trackerId, index) => {
      const irradiance = Math.sin(((hour - 6) * Math.PI) / 12) * 900 + 100;
      const baseEfficiency = 90 + Math.random() * 8;

      data.push({
        trackerId,
        trackerName: `Tracker ${String.fromCharCode(65 + index)}-01`,
        hour,
        tiltAngle: 15 + (hour - 6) * 2 + Math.random() * 2,
        azimuthAngle: 120 + (hour - 6) * 3 + Math.random() * 5,
        irradiance: Math.round(irradiance),
        powerOutput: Math.round(((irradiance * baseEfficiency) / 100) * 0.15),
        efficiency: Math.round(baseEfficiency * 10) / 10,
      });
    });
  }

  return data;
};

const generateTrackerZones = (trackers: Tracker[]): TrackerZone[] => {
  const zones = ["Zone A", "Zone B", "Zone C"];

  return zones.map((zoneName) => {
    const zoneTrackers = trackers.filter((t) => t.zone === zoneName);
    const operationalTrackers = zoneTrackers.filter(
      (t) => t.status === "operational",
    ).length;
    const maintenanceRequired = zoneTrackers.filter(
      (t) => t.status === "maintenance" || t.status === "fault",
    ).length;

    return {
      zoneId: zoneName.toLowerCase().replace(" ", "-"),
      zoneName,
      trackerCount: zoneTrackers.length,
      operationalTrackers,
      avgEfficiency:
        Math.round(
          (zoneTrackers.reduce((sum, t) => sum + t.efficiencyRating, 0) /
            zoneTrackers.length) *
            10,
        ) / 10,
      totalPowerOutput:
        Math.round(
          zoneTrackers.reduce((sum, t) => sum + t.powerGeneration, 0) * 10,
        ) / 10,
      maintenanceRequired,
    };
  });
};

const generateCalibrationEvents = (): CalibrationEvent[] => [
  {
    id: "cal-001",
    trackerId: "tracker-004",
    trackerName: "Tracker Block B-02",
    eventType: "Manual Calibration",
    timestamp: "2024-01-15T14:00:00Z",
    duration: 45,
    status: "in-progress",
    technician: "Mike Wilson",
    notes: "Adjusting azimuth alignment after wind event",
  },
  {
    id: "cal-002",
    trackerId: "tracker-001",
    trackerName: "Tracker Block A-01",
    eventType: "Auto Calibration",
    timestamp: "2024-01-15T06:00:00Z",
    duration: 15,
    status: "completed",
    notes: "Daily sunrise calibration sequence",
  },
  {
    id: "cal-003",
    trackerId: "tracker-003",
    trackerName: "Tracker Block B-01",
    eventType: "Fault Recovery",
    timestamp: "2024-01-14T16:30:00Z",
    duration: 120,
    status: "failed",
    technician: "Sarah Johnson",
    notes: "Motor drive fault - manual intervention required",
  },
  {
    id: "cal-004",
    trackerId: "tracker-005",
    trackerName: "Tracker Block C-01",
    eventType: "Auto Calibration",
    timestamp: "2024-01-14T12:00:00Z",
    duration: 12,
    status: "completed",
    notes: "Midday tracking optimization",
  },
];

const generateTrackerTrends = () => [
  { month: "Jul", operational: 94, efficiency: 92.1, faults: 2 },
  { month: "Aug", operational: 96, efficiency: 93.5, faults: 1 },
  { month: "Sep", operational: 92, efficiency: 91.8, faults: 3 },
  { month: "Oct", operational: 98, efficiency: 94.2, faults: 0 },
  { month: "Nov", operational: 95, efficiency: 92.9, faults: 1 },
  { month: "Dec", operational: 93, efficiency: 91.4, faults: 2 },
];

const COLORS = ["#F5C842", "#10B981", "#3B82F6", "#EF4444"];

export default function PlantTrackers() {
  const [plant, setPlant] = useState<Plant | null>(JSON.parse(localStorage.getItem('selectedPlant') || '{}'));
  const plantName = localStorage.getItem('selectedPlant');
  const [trackers] = useState(generateTrackers(plant.id || ""));
  const [trackerPerformance] = useState(generateTrackerPerformance());
  const [calibrationEvents] = useState(generateCalibrationEvents());

  const trackerZones = generateTrackerZones(trackers);
  const trackerTrends = generateTrackerTrends();

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
  const totalTrackers = trackers.length;
  const operationalTrackers = trackers.filter(
    (t) => t.status === "operational",
  ).length;
  const faultedTrackers = trackers.filter((t) => t.status === "fault").length;
  const avgEfficiency =
    Math.round(
      (trackers
        .filter((t) => t.status === "operational")
        .reduce((sum, t) => sum + t.efficiencyRating, 0) /
        operationalTrackers) *
        10,
    ) / 10;
  const totalPowerOutput =
    Math.round(trackers.reduce((sum, t) => sum + t.powerGeneration, 0) * 10) /
    10;

  const getStatusColor = (status: Tracker["status"]) => {
    switch (status) {
      case "operational":
        return "success";
      case "calibrating":
        return "info";
      case "maintenance":
        return "warning";
      case "fault":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getCalibrationStatusColor = (status: CalibrationEvent["status"]) => {
    switch (status) {
      case "completed":
        return "success";
      case "in-progress":
        return "info";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getHealthColor = (percentage: number) => {
    if (percentage >= 90) return "text-success";
    if (percentage >= 70) return "text-warning";
    return "text-destructive";
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 95) return "text-success";
    if (efficiency >= 85) return "text-warning";
    return "text-destructive";
  };

  const statusDistribution = [
    { name: "Operational", value: operationalTrackers, color: COLORS[1] },
    {
      name: "Maintenance",
      value: trackers.filter((t) => t.status === "maintenance").length,
      color: COLORS[0],
    },
    {
      name: "Calibrating",
      value: trackers.filter((t) => t.status === "calibrating").length,
      color: COLORS[2],
    },
    { name: "Fault", value: faultedTrackers, color: COLORS[3] },
  ].filter((item) => item.value > 0);

  return (
    <div className="flex flex-col h-full">
      <PlantNavigation />

      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        {/* <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {plant.name} - Solar Trackers
            </h1>
            <p className="text-muted-foreground">
              Monitor tracker positioning, health status, and performance
              analytics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Calibrate All
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export Data
            </Button>
          </div>
        </div> */}

        {/* Tracker Fleet KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Total Trackers
                  </div>
                  <div className="text-2xl font-bold">{totalTrackers}</div>
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
                    {operationalTrackers}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Faulted</div>
                  <div className="text-2xl font-bold text-destructive">
                    {faultedTrackers}
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
                    Avg Efficiency
                  </div>
                  <div className="text-2xl font-bold text-info">
                    {avgEfficiency}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Power Output
                  </div>
                  <div className="text-2xl font-bold text-warning">
                    {totalPowerOutput} kW
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tracker Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Tracker Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={trackerTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  {/* <Legend /> */}
                  <Line
                    type="monotone"
                    dataKey="operational"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Operational %"
                  />
                  <Line
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#F5C842"
                    strokeWidth={2}
                    name="Efficiency %"
                  />
                  <Line
                    type="monotone"
                    dataKey="faults"
                    stroke="#EF4444"
                    strokeWidth={2}
                    name="Fault Count"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Tracker Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={false}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {statusDistribution.map((entry, index) => (
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

        {/* Zone Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Zone Performance Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-sm">Zone</th>
                    <th className="text-left p-4 font-medium text-sm">
                      Total Trackers
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Operational
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Avg Efficiency
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Power Output
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Maintenance Required
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {trackerZones.map((zone) => (
                    <tr
                      key={zone.zoneId}
                      className="border-t hover:bg-muted/30"
                    >
                      <td className="p-4 font-medium">{zone.zoneName}</td>
                      <td className="p-4">{zone.trackerCount}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {zone.operationalTrackers}
                          </span>
                          <Progress
                            value={
                              (zone.operationalTrackers / zone.trackerCount) *
                              100
                            }
                            className="w-16 h-2"
                          />
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`font-medium ${getEfficiencyColor(zone.avgEfficiency)}`}
                        >
                          {zone.avgEfficiency}%
                        </span>
                      </td>
                      <td className="p-4 font-medium">
                        {zone.totalPowerOutput} kW
                      </td>
                      <td className="p-4">
                        {zone.maintenanceRequired > 0 ? (
                          <Badge variant="warning">
                            {zone.maintenanceRequired} units
                          </Badge>
                        ) : (
                          <Badge variant="success">None</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Individual Tracker Status */}
        <Card>
          <CardHeader>
            <CardTitle>Individual Tracker Status</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-sm">
                      Tracker
                    </th>
                    <th className="text-left p-4 font-medium text-sm">Zone</th>
                    <th className="text-left p-4 font-medium text-sm">
                      Current Angle
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Optimal Angle
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Motor Health
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Sensor Health
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Power Output
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Efficiency
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {trackers.map((tracker) => (
                    <tr key={tracker.id} className="border-t hover:bg-muted/30">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{tracker.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {tracker.operationalHours}h operational
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">{tracker.zone}</Badge>
                      </td>
                      <td className="p-4 font-medium">
                        {tracker.currentTiltAngle}°
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {tracker.optimalTiltAngle}°
                      </td>
                      <td className="p-4">
                        <span
                          className={`font-medium ${getHealthColor(tracker.motorHealth)}`}
                        >
                          {tracker.motorHealth}%
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`font-medium ${getHealthColor(tracker.sensorHealth)}`}
                        >
                          {tracker.sensorHealth}%
                        </span>
                      </td>
                      <td className="p-4 font-medium">
                        {tracker.powerGeneration} kW
                      </td>
                      <td className="p-4">
                        <span
                          className={`font-medium ${getEfficiencyColor(tracker.efficiencyRating)}`}
                        >
                          {tracker.efficiencyRating}%
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge variant={getStatusColor(tracker.status) as any}>
                          {tracker.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Calibration Events */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Calibration Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {calibrationEvents.map((event) => (
                <div key={event.id} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{event.eventType}</Badge>
                      <span className="font-medium">{event.trackerName}</span>
                      <span className="text-sm text-muted-foreground">
                        {event.duration} min
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={getCalibrationStatusColor(event.status) as any}
                      >
                        {event.status.replace("-", " ").toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm mb-2">{event.notes}</div>
                  {event.technician && (
                    <div className="text-xs text-muted-foreground">
                      Technician: {event.technician}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
