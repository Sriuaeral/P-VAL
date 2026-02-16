import { useState, useEffect } from "react";
import { Plant } from "@shared/interface";
import PlantNavigation from '@/components/PlantNavigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Play,
  Pause,
  Square,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Zap,
  CloudSun,
  Thermometer,
  Wind,
  AlertTriangle,
  TrendingUp,
  Activity,
} from "lucide-react";

interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  duration: number; // hours
  status: "idle" | "running" | "completed" | "paused";
  createdAt: string;
  lastRun?: string;
  parameters: SimulationParameters;
  results?: SimulationResults;
}

interface SimulationParameters {
  weatherCondition: "sunny" | "cloudy" | "rainy" | "variable";
  temperature: number; // Celsius
  irradiance: number; // W/m²
  windSpeed: number; // m/s
  humidity: number; // percentage
  faultInjection: FaultInjection[];
  performanceReduction: number; // percentage
  startTime: string;
  endTime: string;
}

interface FaultInjection {
  componentType: "inverter" | "panel" | "tracker" | "combiner";
  componentId: string;
  faultType: "total_failure" | "performance_degradation" | "intermittent";
  severity: "low" | "medium" | "high";
  startHour: number;
  durationHours: number;
  description: string;
}

interface SimulationResults {
  totalGeneration: number; // kWh
  peakPower: number; // kW
  avgEfficiency: number; // percentage
  faultImpact: number; // kWh lost
  revenue: number; // USD
  dataPoints: SimulationDataPoint[];
  faultEvents: FaultEvent[];
}

interface SimulationDataPoint {
  timestamp: string;
  hour: number;
  irradiance: number;
  temperature: number;
  windSpeed: number;
  powerOutput: number;
  efficiency: number;
  faultsActive: number;
}

interface FaultEvent {
  id: string;
  timestamp: string;
  componentType: string;
  componentId: string;
  faultType: string;
  severity: string;
  description: string;
  powerLoss: number; // kW
  duration: number; // hours
}

interface WeatherProfile {
  id: string;
  name: string;
  description: string;
  avgIrradiance: number;
  avgTemperature: number;
  avgWindSpeed: number;
  avgHumidity: number;
}

// Mock data generators
const generateSimulationScenarios = (): SimulationScenario[] => [
  {
    id: "sim-001",
    name: "Sunny Day Performance",
    description:
      "Optimal conditions with maximum irradiance and ideal temperature",
    duration: 12,
    status: "completed",
    createdAt: "2024-01-10T10:00:00Z",
    lastRun: "2024-01-15T09:00:00Z",
    parameters: {
      weatherCondition: "sunny",
      temperature: 25,
      irradiance: 1000,
      windSpeed: 5,
      humidity: 45,
      faultInjection: [],
      performanceReduction: 0,
      startTime: "06:00",
      endTime: "18:00",
    },
    results: {
      totalGeneration: 8450,
      peakPower: 850,
      avgEfficiency: 94.2,
      faultImpact: 0,
      revenue: 843.5,
      dataPoints: [],
      faultEvents: [],
    },
  },
  {
    id: "sim-002",
    name: "Inverter Failure Impact",
    description: "Analyzing impact of inverter failure during peak hours",
    duration: 8,
    status: "completed",
    createdAt: "2024-01-12T14:00:00Z",
    lastRun: "2024-01-14T11:30:00Z",
    parameters: {
      weatherCondition: "sunny",
      temperature: 28,
      irradiance: 950,
      windSpeed: 3,
      humidity: 50,
      faultInjection: [
        {
          componentType: "inverter",
          componentId: "INV-003",
          faultType: "total_failure",
          severity: "high",
          startHour: 4,
          durationHours: 2,
          description: "Complete inverter shutdown during peak generation",
        },
      ],
      performanceReduction: 0,
      startTime: "10:00",
      endTime: "18:00",
    },
    results: {
      totalGeneration: 5240,
      peakPower: 720,
      avgEfficiency: 88.5,
      faultImpact: 480,
      revenue: 524.0,
      dataPoints: [],
      faultEvents: [],
    },
  },
  {
    id: "sim-003",
    name: "Variable Weather Conditions",
    description: "Mixed weather with cloud cover and temperature variations",
    duration: 24,
    status: "running",
    createdAt: "2024-01-15T08:00:00Z",
    parameters: {
      weatherCondition: "variable",
      temperature: 22,
      irradiance: 600,
      windSpeed: 8,
      humidity: 65,
      faultInjection: [],
      performanceReduction: 15,
      startTime: "00:00",
      endTime: "23:59",
    },
  },
  {
    id: "sim-004",
    name: "Degradation Study",
    description: "Long-term performance with 15% panel degradation",
    duration: 12,
    status: "idle",
    createdAt: "2024-01-13T16:00:00Z",
    parameters: {
      weatherCondition: "sunny",
      temperature: 26,
      irradiance: 900,
      windSpeed: 4,
      humidity: 55,
      faultInjection: [],
      performanceReduction: 15,
      startTime: "06:00",
      endTime: "18:00",
    },
  },
];

const generateWeatherProfiles = (): WeatherProfile[] => [
  {
    id: "weather-001",
    name: "Optimal Sunny",
    description: "Perfect conditions for maximum generation",
    avgIrradiance: 1000,
    avgTemperature: 25,
    avgWindSpeed: 5,
    avgHumidity: 45,
  },
  {
    id: "weather-002",
    name: "Partially Cloudy",
    description: "Variable irradiance with cloud coverage",
    avgIrradiance: 650,
    avgTemperature: 23,
    avgWindSpeed: 7,
    avgHumidity: 60,
  },
  {
    id: "weather-003",
    name: "Hot Summer",
    description: "High temperature impact on efficiency",
    avgIrradiance: 950,
    avgTemperature: 35,
    avgWindSpeed: 3,
    avgHumidity: 40,
  },
  {
    id: "weather-004",
    name: "Winter Conditions",
    description: "Lower irradiance with cooler temperatures",
    avgIrradiance: 400,
    avgTemperature: 15,
    avgWindSpeed: 8,
    avgHumidity: 70,
  },
];

const generateSimulationTrends = () => [
  { month: "Jul", simulations: 12, avgGeneration: 7200, faultTests: 3 },
  { month: "Aug", simulations: 8, avgGeneration: 7450, faultTests: 2 },
  { month: "Sep", simulations: 15, avgGeneration: 6800, faultTests: 4 },
  { month: "Oct", simulations: 10, avgGeneration: 6200, faultTests: 2 },
  { month: "Nov", simulations: 6, avgGeneration: 5800, faultTests: 1 },
  { month: "Dec", simulations: 9, avgGeneration: 5400, faultTests: 3 },
];

const generateLiveSimulationData = () => {
  const data = [];
  for (let hour = 0; hour < 24; hour++) {
    const irradiance =
      hour >= 6 && hour <= 18
        ? Math.sin(((hour - 6) * Math.PI) / 12) * 800 + 200
        : 0;

    data.push({
      hour,
      irradiance: Math.round(irradiance),
      temperature:
        15 + Math.sin(((hour - 6) * Math.PI) / 12) * 10 + Math.random() * 3,
      powerOutput: Math.round((irradiance * 0.85) / 10) * 10,
      efficiency: irradiance > 0 ? 88 + Math.random() * 8 : 0,
    });
  }
  return data;
};

const COLORS = ["#F5C842", "#10B981", "#3B82F6", "#EF4444"];

export default function PlantSimulator() {
  const [plant, setPlant] = useState<Plant | null>(JSON.parse(localStorage.getItem('selectedPlant') || '{}'));
  const plantName = localStorage.getItem('selectedPlant');
  const [scenarios] = useState(generateSimulationScenarios());
  const [weatherProfiles] = useState(generateWeatherProfiles());
  const [selectedScenario, setSelectedScenario] = useState<string>("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [newScenario, setNewScenario] = useState({
    name: "",
    description: "",
    weatherCondition: "sunny",
    temperature: 25,
    irradiance: 1000,
    windSpeed: 5,
    humidity: 45,
    duration: 12,
  });

  const simulationTrends = generateSimulationTrends();
  const liveData = generateLiveSimulationData();

  useEffect(() => {
    if (plant?.id) {
      const selectedPlant = JSON.parse( localStorage.getItem('selectedPlant') || '{}');
      //const selectedPlant = plants.find((p) => p.id === plant.id);
      setPlant(selectedPlant || null);
    }
  }, [plant?.id]);

  if (!plant) {
    return <div>Plant not found</div>;
  }

  const runningScenarios = scenarios.filter(
    (s) => s.status === "running",
  ).length;
  const completedScenarios = scenarios.filter(
    (s) => s.status === "completed",
  ).length;
  const totalSimulations = scenarios.length;

  const getStatusColor = (status: SimulationScenario["status"]) => {
    switch (status) {
      case "running":
        return "info";
      case "completed":
        return "success";
      case "paused":
        return "warning";
      case "idle":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    // Simulate running for demo
    setTimeout(() => {
      setIsSimulating(false);
    }, 3000);
  };

  const handleCreateScenario = () => {
    // Handle scenario creation
    console.log("Creating scenario:", newScenario);
  };

  return (
    <div className="flex flex-col h-full">
      <PlantNavigation />

      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        {/* <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {plant.name} - Performance Simulator
            </h1>
            <p className="text-muted-foreground">
              Create and run synthetic performance scenarios with fault
              injection capabilities
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleRunSimulation}
              disabled={isSimulating}
            >
              {isSimulating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isSimulating ? "Running..." : "Run Simulation"}
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export Results
            </Button>
          </div>
        </div> */}

        {/* Simulation KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Total Scenarios
                  </div>
                  <div className="text-2xl font-bold">{totalSimulations}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                  <Play className="w-5 h-5 text-info" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Running</div>
                  <div className="text-2xl font-bold text-info">
                    {runningScenarios}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                  <div className="text-2xl font-bold text-success">
                    {completedScenarios}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <CloudSun className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Weather Profiles
                  </div>
                  <div className="text-2xl font-bold text-warning">
                    {weatherProfiles.length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Simulation Data */}
          <Card>
            <CardHeader>
              <CardTitle>Live Simulation Data</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={liveData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  {/* <Legend /> */}
                  <Area
                    type="monotone"
                    dataKey="powerOutput"
                    stroke="#F5C842"
                    fill="#F5C842"
                    fillOpacity={0.3}
                    name="Power Output (kW)"
                  />
                  <Area
                    type="monotone"
                    dataKey="irradiance"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.3}
                    name="Irradiance (W/m²)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Simulation Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Simulation Activity Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={simulationTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  {/* <Legend /> */}
                  <Bar
                    dataKey="simulations"
                    fill="#3B82F6"
                    name="Simulations Run"
                  />
                  <Bar dataKey="faultTests" fill="#EF4444" name="Fault Tests" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Create New Scenario */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Simulation Scenario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scenario-name">Scenario Name</Label>
                <Input
                  id="scenario-name"
                  placeholder="Enter scenario name"
                  value={newScenario.name}
                  onChange={(e) =>
                    setNewScenario({ ...newScenario, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weather-condition">Weather Condition</Label>
                <Select
                  value={newScenario.weatherCondition}
                  onValueChange={(value) =>
                    setNewScenario({ ...newScenario, weatherCondition: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunny">Sunny</SelectItem>
                    <SelectItem value="cloudy">Cloudy</SelectItem>
                    <SelectItem value="rainy">Rainy</SelectItem>
                    <SelectItem value="variable">Variable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the simulation scenario"
                value={newScenario.description}
                onChange={(e) =>
                  setNewScenario({
                    ...newScenario,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  value={newScenario.temperature}
                  onChange={(e) =>
                    setNewScenario({
                      ...newScenario,
                      temperature: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="irradiance">Irradiance (W/m²)</Label>
                <Input
                  id="irradiance"
                  type="number"
                  value={newScenario.irradiance}
                  onChange={(e) =>
                    setNewScenario({
                      ...newScenario,
                      irradiance: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wind-speed">Wind Speed (m/s)</Label>
                <Input
                  id="wind-speed"
                  type="number"
                  value={newScenario.windSpeed}
                  onChange={(e) =>
                    setNewScenario({
                      ...newScenario,
                      windSpeed: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="humidity">Humidity (%)</Label>
                <Input
                  id="humidity"
                  type="number"
                  value={newScenario.humidity}
                  onChange={(e) =>
                    setNewScenario({
                      ...newScenario,
                      humidity: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleCreateScenario} className="gap-2">
                <Play className="w-4 h-4" />
                Create & Run Scenario
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Weather Profiles */}
        <Card>
          <CardHeader>
            <CardTitle>Available Weather Profiles</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-sm">
                      Profile
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Irradiance
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Temperature
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Wind Speed
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Humidity
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {weatherProfiles.map((profile) => (
                    <tr key={profile.id} className="border-t hover:bg-muted/30">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{profile.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {profile.description}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium">
                        {profile.avgIrradiance} W/m²
                      </td>
                      <td className="p-4 font-medium">
                        {profile.avgTemperature}°C
                      </td>
                      <td className="p-4 font-medium">
                        {profile.avgWindSpeed} m/s
                      </td>
                      <td className="p-4 font-medium">
                        {profile.avgHumidity}%
                      </td>
                      <td className="p-4">
                        <Button variant="outline" size="sm">
                          Use Profile
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Simulation Scenarios */}
        <Card>
          <CardHeader>
            <CardTitle>Simulation Scenarios</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-sm">
                      Scenario
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Duration
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Weather
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Last Run
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Status
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Results
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scenarios.map((scenario) => (
                    <tr
                      key={scenario.id}
                      className="border-t hover:bg-muted/30"
                    >
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{scenario.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {scenario.description}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{scenario.duration}h</td>
                      <td className="p-4">
                        <Badge variant="secondary">
                          {scenario.parameters.weatherCondition}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm">
                        {scenario.lastRun
                          ? new Date(scenario.lastRun).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="p-4">
                        <Badge variant={getStatusColor(scenario.status) as any}>
                          {scenario.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {scenario.results ? (
                          <div className="text-sm">
                            <div>{scenario.results.totalGeneration} kWh</div>
                            <div className="text-muted-foreground">
                              {scenario.results.avgEfficiency}% efficiency
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
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
