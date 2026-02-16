import { useState } from "react";
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
  Heart,
  TrendingDown,
  AlertTriangle,
  Calendar,
  Download,
  Settings,
  Zap,
  Sun,
  Activity,
  RefreshCw,
  Layers,
} from "lucide-react";
import DigitalTwinOperationsCenter from "@/components/DigitalTwinOperationsCenter";
import { useAlert } from "@/hooks/use-alert";

interface AssetHealthData {
  id: string;
  name: string;
  type: "inverter" | "panel" | "tracker" | "combiner" | "transformer";
  healthScore: number;
  status: "healthy" | "warning" | "critical" | "maintenance";
  faultFrequency: number;
  lastMaintenance: string;
  nextMaintenance: string;
  replacementDate?: string;
  plant: string;
}

const generateAssetHealthData = (): AssetHealthData[] => [
  {
    id: "inv-001",
    name: "Inverter Unit 1",
    type: "inverter",
    healthScore: 92,
    status: "healthy",
    faultFrequency: 0.2,
    lastMaintenance: "2024-01-10",
    nextMaintenance: "2024-04-10",
    plant: "Plant 1",
  },
  {
    id: "inv-005",
    name: "Inverter Unit 5",
    type: "inverter",
    healthScore: 67,
    status: "warning",
    faultFrequency: 1.8,
    lastMaintenance: "2023-12-15",
    nextMaintenance: "2024-03-15",
    replacementDate: "2024-08-15",
    plant: "Plant 2",
  },
  {
    id: "trk-012",
    name: "Tracker Unit 12",
    type: "tracker",
    healthScore: 45,
    status: "critical",
    faultFrequency: 3.2,
    lastMaintenance: "2023-11-20",
    nextMaintenance: "2024-02-20",
    replacementDate: "2024-05-01",
    plant: "Plant 2",
  },
  {
    id: "pnl-section-a",
    name: "Panel Section A",
    type: "panel",
    healthScore: 88,
    status: "healthy",
    faultFrequency: 0.1,
    lastMaintenance: "2024-01-05",
    nextMaintenance: "2024-07-05",
    plant: "Plant 1",
  },
  {
    id: "cmb-008",
    name: "Combiner Box 8",
    type: "combiner",
    healthScore: 73,
    status: "warning",
    faultFrequency: 1.5,
    lastMaintenance: "2023-12-20",
    nextMaintenance: "2024-06-20",
    plant: "Plant 2",
  },
  {
    id: "tfm-main",
    name: "Main Transformer",
    type: "transformer",
    healthScore: 95,
    status: "healthy",
    faultFrequency: 0.05,
    lastMaintenance: "2024-01-08",
    nextMaintenance: "2024-07-08",
    plant: "Plant 1",
  },
];

const generateFaultTrendData = () => [
  { month: "Jan", inverters: 2, panels: 1, trackers: 3, combiners: 2 },
  { month: "Feb", inverters: 1, panels: 0, trackers: 2, combiners: 1 },
  { month: "Mar", inverters: 3, panels: 2, trackers: 4, combiners: 3 },
  { month: "Apr", inverters: 2, panels: 1, trackers: 1, combiners: 2 },
  { month: "May", inverters: 1, panels: 0, trackers: 2, combiners: 1 },
  { month: "Jun", inverters: 4, panels: 1, trackers: 3, combiners: 2 },
];

const generateReplacementForecast = () => [
  { month: "Jan 2024", count: 2 },
  { month: "Feb 2024", count: 1 },
  { month: "Mar 2024", count: 3 },
  { month: "Apr 2024", count: 1 },
  { month: "May 2024", count: 4 },
  { month: "Jun 2024", count: 2 },
  { month: "Jul 2024", count: 3 },
  { month: "Aug 2024", count: 5 },
];

const COLORS = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"];

export default function AssetHealth() {
  const alert = useAlert();
  const [assets] = useState(generateAssetHealthData());
  const [selectedAssetType, setSelectedAssetType] = useState<string>("all");
  const [showDigitalTwin, setShowDigitalTwin] = useState(false);

  const faultTrendData = generateFaultTrendData();
  const replacementForecast = generateReplacementForecast();

  const filteredAssets =
    selectedAssetType === "all"
      ? assets
      : assets.filter((asset) => asset.type === selectedAssetType);

  const getHealthColor = (score: number) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "destructive";
  };

  const getStatusColor = (status: AssetHealthData["status"]) => {
    switch (status) {
      case "healthy":
        return "success";
      case "warning":
        return "warning";
      case "critical":
        return "destructive";
      case "maintenance":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getAssetIcon = (type: AssetHealthData["type"]) => {
    switch (type) {
      case "inverter":
        return Zap;
      case "panel":
        return Sun;
      case "tracker":
        return RefreshCw;
      case "combiner":
        return Settings;
      case "transformer":
        return Activity;
      default:
        return Settings;
    }
  };

  const healthDistribution = [
    {
      name: "Healthy (80-100%)",
      value: assets.filter((a) => a.healthScore >= 80).length,
      color: "#10B981",
    },
    {
      name: "Warning (60-79%)",
      value: assets.filter((a) => a.healthScore >= 60 && a.healthScore < 80)
        .length,
      color: "#F59E0B",
    },
    {
      name: "Critical (<60%)",
      value: assets.filter((a) => a.healthScore < 60).length,
      color: "#EF4444",
    },
  ];

  const averageHealthScore =
    assets.reduce((sum, asset) => sum + asset.healthScore, 0) / assets.length;

  const handleExportReport = () => {
    alert.featureUnderConstruction('Asset health report export');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Asset Health</h1>
          <p className="text-muted-foreground">
            Monitor component health scores and replacement forecasting
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDigitalTwin(true)}
            className="gap-2 bg-gradient-to-r from-primary/10 to-info/10 border-primary/20 hover:from-primary/20 hover:to-info/20"
          >
            <Layers className="w-4 h-4" />
            Digital Twin
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="w-4 h-4" />
            Last 6 Months
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportReport}>
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Avg Health Score
                </div>
                <div className="text-2xl font-bold">
                  {averageHealthScore.toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-success" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Healthy Assets
                </div>
                <div className="text-2xl font-bold text-success">
                  {assets.filter((a) => a.healthScore >= 80).length}
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
                <div className="text-sm text-muted-foreground">
                  Critical Assets
                </div>
                <div className="text-2xl font-bold text-destructive">
                  {assets.filter((a) => a.healthScore < 60).length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-warning" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Need Replacement
                </div>
                <div className="text-2xl font-bold text-warning">
                  {assets.filter((a) => a.replacementDate).length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Health Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={healthDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={false}
                  >
                    {healthDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {healthDistribution.map((entry, index) => (
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

        {/* Fault Frequency Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Fault Frequency Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={faultTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                
                <Bar dataKey="inverters" fill="#F5C842" />
                <Bar dataKey="panels" fill="#10B981" />
                <Bar dataKey="trackers" fill="#3B82F6" />
                <Bar dataKey="combiners" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Replacement Forecasting */}
      <Card>
        <CardHeader>
          <CardTitle>Replacement Forecasting Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={replacementForecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#F5C842"
                strokeWidth={3}
                dot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Asset Health Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Asset Health Overview</span>
            <div className="flex items-center gap-2">
              <select
                value={selectedAssetType}
                onChange={(e) => setSelectedAssetType(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">All Assets</option>
                <option value="inverter">Inverters</option>
                <option value="panel">Panels</option>
                <option value="tracker">Trackers</option>
                <option value="combiner">Combiners</option>
                <option value="transformer">Transformers</option>
              </select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-sm">Asset</th>
                  <th className="text-left p-4 font-medium text-sm">Type</th>
                  <th className="text-left p-4 font-medium text-sm">Plant</th>
                  <th className="text-left p-4 font-medium text-sm">
                    Health Score
                  </th>
                  <th className="text-left p-4 font-medium text-sm">Status</th>
                  <th className="text-left p-4 font-medium text-sm">
                    Fault Freq.
                  </th>
                  <th className="text-left p-4 font-medium text-sm">
                    Next Maintenance
                  </th>
                  <th className="text-left p-4 font-medium text-sm">
                    Replacement
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset) => {
                  const AssetIcon = getAssetIcon(asset.type);
                  return (
                    <tr key={asset.id} className="border-t hover:bg-muted/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                            <AssetIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium">{asset.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {asset.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm capitalize">{asset.type}</td>
                      <td className="p-4 text-sm">{asset.plant}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16">
                            <Progress
                              value={asset.healthScore}
                              className="h-2"
                            />
                          </div>
                          <Badge
                            variant={getHealthColor(asset.healthScore) as any}
                          >
                            {asset.healthScore}%
                          </Badge>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={getStatusColor(asset.status) as any}
                          className="capitalize"
                        >
                          {asset.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm">
                        {asset.faultFrequency}/month
                      </td>
                      <td className="p-4 text-sm">
                        {new Date(asset.nextMaintenance).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm">
                        {asset.replacementDate ? (
                          <span className="text-warning font-medium">
                            {new Date(
                              asset.replacementDate,
                            ).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Digital Twin Operations Center */}
      {showDigitalTwin && (
        <DigitalTwinOperationsCenter
          plantId="global-assets"
          onClose={() => setShowDigitalTwin(false)}
        />
      )}
    </div>
  );
}
