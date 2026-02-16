import { useState, useEffect } from "react";
import { Plant } from "@shared/interface";
import KPIService, { TechnicalKPI, FinancialKPI, CommercialKPI, PlantKPIResponse } from "@/lib/kpiService";
import PlantNavigation from '@/components/PlantNavigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAlert } from "@/hooks/use-alert";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import StandardChart from "@/components/ui/StandardChart";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Zap,
  Activity,
  Target,
  Download,
  Calendar,
  Bot,
  CheckCircle,
  Eye,
  UserPlus,
  Info,
  ArrowRight,
} from "lucide-react";
import WorkOrderCreateDialog from "@/components/WorkOrderCreateDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// KPI types are imported from kpiService

const generateTechnicalKPIs = (): TechnicalKPI[] => [
  {
    id: "pr",
    name: "Performance Ratio",
    value: 86.5,
    unit: "%",
    target: 85,
    trend: "up",
    change: 2.1,
    chartType: "line",
    chartData: [
      { name: "Jan", value: 84.2, target: 85 },
      { name: "Feb", value: 85.1, target: 85 },
      { name: "Mar", value: 86.8, target: 85 },
      { name: "Apr", value: 87.2, target: 85 },
      { name: "May", value: 86.5, target: 85 },
      { name: "Jun", value: 85.9, target: 85 },
    ],
  },
  {
    id: "cuf",
    name: "Capacity Utilization Factor",
    value: 23.8,
    unit: "%",
    trend: "up",
    change: 1.2,
    chartType: "area",
    chartData: [
      { name: "Jan", value: 22.1 },
      { name: "Feb", value: 22.8 },
      { name: "Mar", value: 24.2 },
      { name: "Apr", value: 25.1 },
      { name: "May", value: 23.8 },
      { name: "Jun", value: 22.9 },
    ],
  },
  {
    id: "availability",
    name: "System Availability",
    value: 98.7,
    unit: "%",
    target: 98,
    trend: "stable",
    change: 0.1,
    chartType: "line",
    chartData: [
      { name: "Jan", value: 98.2, target: 98 },
      { name: "Feb", value: 98.5, target: 98 },
      { name: "Mar", value: 98.9, target: 98 },
      { name: "Apr", value: 98.7, target: 98 },
      { name: "May", value: 98.8, target: 98 },
      { name: "Jun", value: 98.7, target: 98 },
    ],
  },
  {
    id: "energy-yield",
    name: "Specific Energy Yield",
    value: 1456,
    unit: "kWh/kWp",
    trend: "up",
    change: 3.2,
    chartType: "bar",
    chartData: [
      { name: "Jan", value: 1280 },
      { name: "Feb", value: 1350 },
      { name: "Mar", value: 1420 },
      { name: "Apr", value: 1480 },
      { name: "May", value: 1456 },
      { name: "Jun", value: 1390 },
    ],
  },
  {
    id: "irradiation",
    name: "Plane of Array Irradiation",
    value: 1689,
    unit: "kWh/m²",
    trend: "up",
    change: 2.8,
    chartType: "area",
    chartData: [
      { name: "Jan", value: 1520 },
      { name: "Feb", value: 1580 },
      { name: "Mar", value: 1650 },
      { name: "Apr", value: 1720 },
      { name: "May", value: 1689 },
      { name: "Jun", value: 1610 },
    ],
  },
  {
    id: "degradation",
    name: "Performance Degradation",
    value: 0.45,
    unit: "%/year",
    target: 0.5,
    trend: "stable",
    change: 0.02,
    chartType: "line",
    chartData: [
      { name: "Year 1", value: 0.42, target: 0.5 },
      { name: "Year 2", value: 0.44, target: 0.5 },
      { name: "Year 3", value: 0.46, target: 0.5 },
      { name: "Year 4", value: 0.45, target: 0.5 },
      { name: "Year 5", value: 0.45, target: 0.5 },
    ],
  },
];

const generateFinancialKPIs = (): FinancialKPI[] => [
  {
    id: "revenue",
    name: "Monthly Revenue",
    value: 2.45,
    unit: "M AED",
    target: 2.3,
    trend: "up",
    change: 6.5,
    chartType: "bar",
    chartData: [
      { name: "Jan", value: 2.1, target: 2.3 },
      { name: "Feb", value: 2.3, target: 2.3 },
      { name: "Mar", value: 2.5, target: 2.3 },
      { name: "Apr", value: 2.7, target: 2.3 },
      { name: "May", value: 2.45, target: 2.3 },
      { name: "Jun", value: 2.2, target: 2.3 },
    ],
  },
  {
    id: "opex",
    name: "Operating Expenses",
    value: 0.28,
    unit: "M AED",
    target: 0.35,
    trend: "down",
    change: -8.2,
    chartType: "line",
    chartData: [
      { name: "Jan", value: 0.32, target: 0.35 },
      { name: "Feb", value: 0.31, target: 0.35 },
      { name: "Mar", value: 0.29, target: 0.35 },
      { name: "Apr", value: 0.27, target: 0.35 },
      { name: "May", value: 0.28, target: 0.35 },
      { name: "Jun", value: 0.3, target: 0.35 },
    ],
  },
  {
    id: "ebitda",
    name: "EBITDA Margin",
    value: 68.5,
    unit: "%",
    target: 65,
    trend: "up",
    change: 3.2,
    chartType: "area",
    chartData: [
      { name: "Jan", value: 65.2, target: 65 },
      { name: "Feb", value: 66.8, target: 65 },
      { name: "Mar", value: 67.9, target: 65 },
      { name: "Apr", value: 69.1, target: 65 },
      { name: "May", value: 68.5, target: 65 },
      { name: "Jun", value: 67.3, target: 65 },
    ],
  },
  {
    id: "lcoe",
    name: "Levelized Cost of Energy",
    value: 0.042,
    unit: "AED/kWh",
    target: 0.045,
    trend: "down",
    change: -2.3,
    chartType: "line",
    chartData: [
      { name: "Jan", value: 0.046, target: 0.045 },
      { name: "Feb", value: 0.044, target: 0.045 },
      { name: "Mar", value: 0.043, target: 0.045 },
      { name: "Apr", value: 0.041, target: 0.045 },
      { name: "May", value: 0.042, target: 0.045 },
      { name: "Jun", value: 0.043, target: 0.045 },
    ],
  },
  {
    id: "tariff",
    name: "Average Selling Price",
    value: 0.068,
    unit: "AED/kWh",
    trend: "stable",
    change: 0.5,
    chartType: "bar",
    chartData: [
      { name: "Jan", value: 0.067 },
      { name: "Feb", value: 0.068 },
      { name: "Mar", value: 0.069 },
      { name: "Apr", value: 0.068 },
      { name: "May", value: 0.068 },
      { name: "Jun", value: 0.067 },
    ],
  },
  {
    id: "roi",
    name: "Return on Investment",
    value: 12.8,
    unit: "%",
    target: 12,
    trend: "up",
    change: 1.1,
    chartType: "area",
    chartData: [
      { name: "Q1", value: 11.5, target: 12 },
      { name: "Q2", value: 12.1, target: 12 },
      { name: "Q3", value: 12.6, target: 12 },
      { name: "Q4", value: 12.8, target: 12 },
    ],
  },
];

// CommercialKPI interface is now imported from kpiService

const generateCommercialKPIs = (): CommercialKPI[] => [
  { name: "Net Present Value (NPV)", value: "AED 47.2M" },
  { name: "Levelized Cost of Energy (LCOE)", value: "AED 0.155/kWh" },
  { name: "Internal Rate of Return (IRR)", value: "14.8%" },
  { name: "Profit Margin", value: "32.6%" },
  { name: "Debt Service Coverage Ratio", value: "1.42x" },
  { name: "Operating Expense Ratio (OpEx)", value: "18.5%" },
  { name: "Power Purchase Agreement (PPA) Rate", value: "AED 0.195/kWh" },
  { name: "Payback Period", value: "8.3 Years" },
];

interface AIInsight {
  id: string;
  optimization: string;
  kpiImpacted: string;
  kpiCategory: "technical" | "financial";
  currentValue: number;
  targetValue: number;
  confidenceScore: number;
  insight: string;
  expectedGain: string;
  impactType: "energy" | "revenue" | "cost" | "efficiency";
  priority: "high" | "medium" | "low";
}

const generateAIInsights = (): AIInsight[] => [
  {
    id: "dust-cleaning",
    optimization: "Clean modules at Site B",
    kpiImpacted: "Energy Yield (%)",
    kpiCategory: "technical",
    currentValue: 87,
    targetValue: 95,
    confidenceScore: 92,
    insight:
      "Dust accumulation detected by inverter performance drift. Cleaning predicted to recover 8% yield.",
    expectedGain: "+8% energy output improvement estimated in next 10 days",
    impactType: "energy",
    priority: "high",
  },
  {
    id: "tracker-optimization",
    optimization: "Adjust tracker algorithm parameters",
    kpiImpacted: "Performance Ratio",
    kpiCategory: "technical",
    currentValue: 86.5,
    targetValue: 89.2,
    confidenceScore: 88,
    insight:
      "Sub-optimal tracking patterns identified during morning hours. Algorithm tuning can improve capture.",
    expectedGain: "+2.7% performance ratio increase within 5 days",
    impactType: "efficiency",
    priority: "high",
  },
  {
    id: "maintenance-schedule",
    optimization: "Optimize preventive maintenance schedule",
    kpiImpacted: "Operating Expenses",
    kpiCategory: "financial",
    currentValue: 0.28,
    targetValue: 0.24,
    confidenceScore: 84,
    insight:
      "Current maintenance frequency exceeds optimal intervals. Condition-based approach reduces costs.",
    expectedGain: "-$40K monthly OpEx reduction with same reliability",
    impactType: "cost",
    priority: "medium",
  },
  {
    id: "string-replacement",
    optimization: "Replace degraded string #47 at Block C",
    kpiImpacted: "System Availability",
    kpiCategory: "technical",
    currentValue: 98.7,
    targetValue: 99.3,
    confidenceScore: 91,
    insight:
      "String shows 15% underperformance. Replacement prevents cascading failures and improves availability.",
    expectedGain: "+0.6% availability improvement, prevents $25K revenue loss",
    impactType: "revenue",
    priority: "high",
  },
  {
    id: "tariff-optimization",
    optimization: "Renegotiate power purchase agreement terms",
    kpiImpacted: "Average Selling Price",
    kpiCategory: "financial",
    currentValue: 0.068,
    targetValue: 0.072,
    confidenceScore: 75,
    insight:
      "Market rates have increased 8% since contract signing. Renegotiation opportunity identified.",
    expectedGain: "+$180K annual revenue increase potential",
    impactType: "revenue",
    priority: "medium",
  },
  {
    id: "inverter-firmware",
    optimization: "Update inverter firmware to v2.3.1",
    kpiImpacted: "Capacity Utilization Factor",
    kpiCategory: "technical",
    currentValue: 23.8,
    targetValue: 25.1,
    confidenceScore: 89,
    insight:
      "New firmware includes MPP tracking improvements and reactive power optimization features.",
    expectedGain: "+1.3% capacity utilization improvement in 2 weeks",
    impactType: "efficiency",
    priority: "medium",
  },
  {
    id: "grid-compliance",
    optimization: "Install additional grid compliance equipment",
    kpiImpacted: "EBITDA Margin",
    kpiCategory: "financial",
    currentValue: 68.5,
    targetValue: 71.2,
    confidenceScore: 82,
    insight:
      "Grid code compliance upgrades unlock higher capacity factor limits and reduce curtailment.",
    expectedGain: "+2.7% EBITDA margin through reduced curtailment",
    impactType: "revenue",
    priority: "low",
  },
];

const COLORS = ["#F5C842", "#10B981", "#3B82F6", "#EF4444", "#8B5CF6"];

export default function PlantKPI() {
  const alert = useAlert();
  const plant = JSON.parse(localStorage.getItem('selectedPlant') || '{}');
  const plantName = localStorage.getItem('selectedPlant');
  const [kpiData, setKpiData] = useState<PlantKPIResponse | null>(null);
  const [technicalKPIs, setTechnicalKPIs] = useState<TechnicalKPI[]>([]);
  const [financialKPIs, setFinancialKPIs] = useState<FinancialKPI[]>([]);
  const [commercialKPIs, setCommercialKPIs] = useState<CommercialKPI[]>([]);
  const [aiInsights] = useState(generateAIInsights());
  const [isCreateWorkOrderOpen, setIsCreateWorkOrderOpen] = useState(false);
  const [isDataDialogOpen, setIsDataDialogOpen] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(
    null,
  );
  const [acknowledgedInsights, setAcknowledgedInsights] = useState<Set<string>>(
    new Set(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlantData = async () => {
      if (!plant?.id) return;

      try {
        setLoading(true);
        setError(null);

        // Load KPI data from API
        // const kpiResponse = await KPIService.getPlantKPIs(plant.id);
        // setKpiData(kpiResponse);
        // setTechnicalKPIs(kpiResponse.technicalKPIs);
        // setFinancialKPIs(kpiResponse.financialKPIs);
        // setCommercialKPIs(kpiResponse.commercialKPIs);

        setTechnicalKPIs(generateTechnicalKPIs());
        setFinancialKPIs(generateFinancialKPIs());
        setCommercialKPIs(generateCommercialKPIs());

      } catch (err) {
        console.error('Error loading plant KPI data:', err);
        setError('Failed to load KPI data. Please try again.');
        
        // Fallback to mock data on error
        setTechnicalKPIs(generateTechnicalKPIs());
        setFinancialKPIs(generateFinancialKPIs());
        setCommercialKPIs(generateCommercialKPIs());
      } finally {
        setLoading(false);
      }
    };

    loadPlantData();
  }, [plant?.id]);

  if (!plant) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-2xl font-semibold text-slate-600 mb-2">Plant not found</div>
          <div className="text-slate-500">The requested plant could not be found.</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-slate-50/50 via-white to-blue-50/30">
        <PlantNavigation />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-lg font-semibold text-slate-600 mb-2">Loading KPI Data</div>
              <div className="text-slate-500">Fetching performance metrics...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-slate-50/50 via-white to-blue-50/30">
        <PlantNavigation />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 text-red-600">⚠️</div>
              </div>
              <div className="text-lg font-semibold text-slate-600 mb-2">Error Loading Data</div>
              <div className="text-slate-500 mb-4">{error}</div>
              <Button 
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  // Reload the component data
                  const loadPlantData = async () => {
                    if (!plant?.id) return;
                    try {
                      const kpiResponse = await KPIService.getPlantKPIs(plant.id);
                      setKpiData(kpiResponse);
                      setTechnicalKPIs(kpiResponse.technicalKPIs);
                      setFinancialKPIs(kpiResponse.financialKPIs);
                      setCommercialKPIs(kpiResponse.commercialKPIs);
                    } catch (err) {
                      console.error('Error loading plant KPI data:', err);
                      setError('Failed to load KPI data. Please try again.');
                      // Fallback to mock data on error
                      setTechnicalKPIs(generateTechnicalKPIs());
                      setFinancialKPIs(generateFinancialKPIs());
                      setCommercialKPIs(generateCommercialKPIs());
                    } finally {
                      setLoading(false);
                    }
                  };
                  loadPlantData();
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderChart = (
    kpi: TechnicalKPI | FinancialKPI,
    color: string = "#F5C842",
  ) => {
    // For charts with targets, we need to use the original implementation
    if (kpi.target) {
      switch (kpi.chartType) {
        case "line":
          return (
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={kpi.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#94A3B8"
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          );
        case "area":
          return (
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={kpi.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  fill={color}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#94A3B8"
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          );
        case "bar":
          return (
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={kpi.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={color} />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#94A3B8"
                  strokeDasharray="5 5"
                />
              </BarChart>
            </ResponsiveContainer>
          );
        default:
          return null;
      }
    }

    // Use StandardChart for charts without targets
    switch (kpi.chartType) {
      case "line":
        return (
          <StandardChart
            data={kpi.chartData}
            type="line"
            dataKey="value"
            xAxisKey="name"
            color={color}
            height={120}
            showLegend={false}
            showGrid={true}
            strokeWidth={2}
          />
        );
      case "area":
        return (
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={kpi.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                fill={color}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={kpi.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill={color} />
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        console.warn('Unknown chart type:', kpi.chartType, 'for KPI:', kpi.name);
        return (
          <div className="flex items-center justify-center h-24 text-slate-500">
            Chart not available
          </div>
        );
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? TrendingUp : TrendingDown;
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-success";
      case "down":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getConfidenceBadgeVariant = (score: number) => {
    if (score >= 80) return "success";
    if (score >= 50) return "warning";
    return "destructive";
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getKPIIcon = (category: string) => {
    return category === "financial" ? DollarSign : Zap;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500";
      case "medium":
        return "border-l-yellow-500";
      default:
        return "border-l-green-500";
    }
  };

  const handleAssignTask = (insight: AIInsight) => {
    setSelectedInsight(insight);
    setIsCreateWorkOrderOpen(true);
  };

  const handleViewData = (insight: AIInsight) => {
    setSelectedInsight(insight);
    setIsDataDialogOpen(true);
  };

  const handleAcknowledge = (insightId: string) => {
    setAcknowledgedInsights((prev) => new Set([...prev, insightId]));
    alert.success('Insight Acknowledged', 'This insight has been marked as acknowledged.');
  };

  const generateRelatedData = (insight: AIInsight) => {
    // Generate synthetic related data based on the insight
    const baseData = {
      lastUpdated: new Date().toISOString(),
      dataPoints: Math.floor(Math.random() * 1000) + 500,
      timeRange: "Last 30 days",
    };

    switch (insight.impactType) {
      case "energy":
        return {
          ...baseData,
          energyProduction: {
            current: `${(Math.random() * 500 + 1000).toFixed(1)} MWh`,
            expected: `${(Math.random() * 500 + 1200).toFixed(1)} MWh`,
            deviation: `-${(Math.random() * 10 + 5).toFixed(1)}%`,
          },
          affectedComponents: ["Inverter 5", "String 12-15", "Module Block C"],
          performanceMetrics: {
            efficiency: `${(85 + Math.random() * 10).toFixed(1)}%`,
            capacity: `${(90 + Math.random() * 8).toFixed(1)}%`,
            availability: `${(95 + Math.random() * 4).toFixed(1)}%`,
          },
        };
      case "efficiency":
        return {
          ...baseData,
          performanceRatio: {
            current: `${insight.currentValue}%`,
            target: `${insight.targetValue}%`,
            benchmark: `${(insight.targetValue + Math.random() * 5).toFixed(1)}%`,
          },
          systemComponents: {
            inverters: `${(Math.random() * 95 + 90).toFixed(1)}% efficiency`,
            trackers: `${(Math.random() * 98 + 95).toFixed(1)}% accuracy`,
            strings: `${Math.floor(Math.random() * 5 + 2)} underperforming`,
          },
          recommendations: [
            "Optimize tracking algorithm parameters",
            "Schedule preventive maintenance",
            "Update firmware to latest version",
          ],
        };
      case "cost":
        return {
          ...baseData,
          costAnalysis: {
            currentOpEx: `$${(Math.random() * 50000 + 250000).toLocaleString()}`,
            targetOpEx: `$${(Math.random() * 40000 + 200000).toLocaleString()}`,
            potentialSavings: `$${(Math.random() * 30000 + 20000).toLocaleString()}`,
          },
          costBreakdown: {
            maintenance: "45%",
            personnel: "30%",
            materials: "15%",
            other: "10%",
          },
          optimizationAreas: [
            "Predictive maintenance scheduling",
            "Inventory management efficiency",
            "Remote monitoring capabilities",
          ],
        };
      case "revenue":
        return {
          ...baseData,
          revenueMetrics: {
            currentRevenue: `$${(Math.random() * 100000 + 800000).toLocaleString()}`,
            projectedIncrease: `$${(Math.random() * 50000 + 100000).toLocaleString()}`,
            roi: `${(Math.random() * 15 + 10).toFixed(1)}%`,
          },
          marketData: {
            gridPrice: `$${(0.06 + Math.random() * 0.02).toFixed(3)}/kWh`,
            contractPrice: `$${(0.065 + Math.random() * 0.015).toFixed(3)}/kWh`,
            peakDemandBonus: `${(Math.random() * 5 + 8).toFixed(1)}%`,
          },
        };
      default:
        return baseData;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <PlantNavigation />
      <div className="flex-1 p-6 space-y-8">
        {/* Header */}
        {/* <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
                  {plant.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-slate-600">KPI Dashboard</span>
                </div>
              </div>
            </div>
            <p className="text-slate-600 ml-15">
              Real-time technical and financial performance indicators
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 shadow-sm">
              <Calendar className="w-4 h-4" />
              Last 6 Months
            </Button>
            <Button variant="outline" size="sm" className="gap-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 shadow-sm">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>
        </div> */}

        {/* KPI Tabs */}
        <Tabs defaultValue="technical" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 bg-white border border-slate-200 shadow-sm rounded-xl p-1 h-12">
            <TabsTrigger 
              value="technical" 
              className="gap-2 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 font-medium"
            >
              <Activity className="w-4 h-4" />
              Technical KPIs
            </TabsTrigger>
            <TabsTrigger 
              value="commercial" 
              className="gap-2 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 font-medium"
            >
              <DollarSign className="w-4 h-4" />
              Commercial KPIs
            </TabsTrigger>
          </TabsList>

          {/* Technical KPIs */}
          <TabsContent value="technical">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {technicalKPIs.map((kpi, index) => {
                const TrendIcon = getTrendIcon(kpi.trend);
                return (
                  <Card key={kpi.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:-translate-y-1">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
                          {kpi.name}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-slate-50 group-hover:bg-slate-100 transition-colors">
                            <TrendIcon
                              className={`w-4 h-4 ${getTrendColor(kpi.trend)}`}
                            />
                          </div>
                          <Badge
                            variant={
                              kpi.trend === "up"
                                ? "success"
                                : kpi.trend === "down"
                                  ? "destructive"
                                  : ("secondary" as any)
                            }
                            className="font-medium shadow-sm"
                          >
                            {kpi.change > 0 ? "+" : ""}
                            {kpi.change}%
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                            {kpi.value}
                            <span className="text-lg text-slate-500 ml-1 font-medium">
                              {kpi.unit}
                            </span>
                          </div>
                          {kpi.target && (
                            <div className="text-sm text-slate-500 flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              Target: {kpi.target}{kpi.unit}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="px-3 py-1.5 rounded-full text-xs font-semibold border">
                            <span className={`${getTrendColor(kpi.trend)}`}>
                              {kpi.trend === "up"
                                ? "Improving"
                                : kpi.trend === "down"
                                  ? "Declining"
                                  : "Stable"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-3 border border-slate-100 flex items-center justify-center" style={{ minHeight: '140px' }}>
                        {renderChart(kpi, COLORS[index % COLORS.length])}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Commercial KPIs */}
          <TabsContent value="commercial">
            <div className="space-y-6">
              {/* Financial Performance Charts */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Financial Performance Metrics</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {financialKPIs.map((kpi, index) => {
                    const TrendIcon = getTrendIcon(kpi.trend);
                    return (
                      <Card key={kpi.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:-translate-y-1">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
                              {kpi.name}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-slate-50 group-hover:bg-slate-100 transition-colors">
                                <TrendIcon
                                  className={`w-4 h-4 ${getTrendColor(kpi.trend)}`}
                                />
                              </div>
                              <Badge
                                variant={
                                  kpi.trend === "up"
                                    ? "success"
                                    : kpi.trend === "down"
                                      ? "destructive"
                                      : ("secondary" as any)
                                }
                                className="font-medium shadow-sm"
                              >
                                {kpi.change > 0 ? "+" : ""}
                                {kpi.change}%
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-5">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                {kpi.value}
                                <span className="text-lg text-slate-500 ml-1 font-medium">
                                  {kpi.unit}
                                </span>
                              </div>
                              {kpi.target && (
                                <div className="text-sm text-slate-500 flex items-center gap-1">
                                  <Target className="w-3 h-3" />
                                  Target: {kpi.target}{kpi.unit}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="px-3 py-1.5 rounded-full text-xs font-semibold border">
                                <span className={`${getTrendColor(kpi.trend)}`}>
                                  {kpi.trend === "up"
                                    ? "Improving"
                                    : kpi.trend === "down"
                                      ? "Declining"
                                      : "Stable"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-3 border border-slate-100 flex items-center justify-center" style={{ minHeight: '140px' }}>
                            {renderChart(kpi, COLORS[index % COLORS.length])}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Commercial Performance Summary */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl flex items-center justify-center shadow-lg">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Commercial Performance Summary</h3>
                </div>
                <div className="max-w-4xl">
                  <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-blue-50/50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                          <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                            Key Commercial Indicators
                          </CardTitle>
                          <p className="text-sm text-slate-600 mt-1 font-medium">
                            Core financial metrics for solar asset operations
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
                                <th className="text-left py-4 px-6 font-bold text-slate-800 text-sm uppercase tracking-wide">
                                  KPI Name
                                </th>
                                <th className="text-right py-4 px-6 font-bold text-slate-800 text-sm uppercase tracking-wide">
                                  Value
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {commercialKPIs.map((kpi, index) => (
                                <tr
                                  key={index}
                                  className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-slate-50 transition-all duration-200 group"
                                >
                                  <td className="py-4 px-6 text-sm font-semibold text-slate-700 group-hover:text-slate-900">
                                    {kpi.name}
                                  </td>
                                  <td className="py-4 px-6 text-sm font-bold text-slate-900 text-right group-hover:text-blue-700">
                                    {kpi.value}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200/60 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                            <Info className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-blue-900 mb-1">
                              Information Note
                            </div>
                            <div className="text-sm text-blue-700 font-medium">
                              These commercial performance indicators are provided for
                              comprehensive financial tracking. Values are updated
                              monthly based on asset performance and market conditions.
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/90 backdrop-blur-sm hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-slate-600 font-medium">
                    KPIs on Target
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    {kpiData ? `${kpiData.summary.onTarget}/${kpiData.summary.totalKPIs}` : '8/12'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/90 backdrop-blur-sm hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-slate-600 font-medium">Improving</div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    {kpiData?.summary.improving || 7}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/90 backdrop-blur-sm hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-slate-600 font-medium">Declining</div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    {kpiData?.summary.declining || 2}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/90 backdrop-blur-sm hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-slate-600 font-medium">
                    Overall Health
                  </div>
                  <div className="text-2xl font-bold text-emerald-600 capitalize">
                    {kpiData?.summary.overallHealth || 'Good'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights & Optimization Suggestions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
                  AI Insights & Optimization Suggestions
                </h2>
              </div>
              <p className="text-slate-600 font-medium ml-15">
                AI-powered recommendations to optimize your portfolio performance
              </p>
            </div>
          </div>

          {/* AI Summary Banner */}
          <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-0 shadow-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                    AI Analysis Summary
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-sm text-slate-700 font-medium leading-relaxed">
                    AI recommends <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md font-semibold">7 high-impact actions</span> to
                    optimize KPIs across your portfolio. Confidence levels
                    between <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-semibold">75%–92%</span>. Focus on{" "}
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md font-semibold">Sites B and C</span> for maximum ROI. Potential
                    monthly gains: <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-md font-semibold">+$156K revenue</span>,{" "}
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md font-semibold">-$40K OpEx</span>.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {aiInsights
              .sort((a, b) => b.confidenceScore - a.confidenceScore)
              .slice(0, 6)
              .map((insight) => {
                const KPIIcon = getKPIIcon(insight.kpiCategory);
                const progressPercentage =
                  (insight.currentValue / insight.targetValue) * 100;

                return (
                  <Card
                    key={insight.id}
                    className={`border-l-4 ${getPriorityColor(insight.priority)} hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm hover:-translate-y-1 shadow-lg border-0`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 rounded-lg bg-slate-100">
                              <KPIIcon className="w-4 h-4 text-slate-600" />
                            </div>
                            <Badge variant="outline" className="text-xs font-medium border-slate-200 text-slate-700">
                              {insight.kpiCategory === "financial"
                                ? "Financial"
                                : "Technical"}{" "}
                              KPI
                            </Badge>
                          </div>
                          <CardTitle className="text-base font-bold text-slate-800 leading-tight">
                            {insight.optimization}
                          </CardTitle>
                        </div>
                        <Badge
                          className={`ml-2 ${getConfidenceColor(insight.confidenceScore)} border-0 font-bold shadow-sm`}
                        >
                          {insight.confidenceScore}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      {/* KPI Progress */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-slate-800">
                            {insight.kpiImpacted}
                          </span>
                          <span className="text-slate-600 font-medium bg-slate-100 px-2 py-1 rounded-md">
                            {insight.currentValue}% → {insight.targetValue}%
                          </span>
                        </div>
                        <Progress
                          value={Math.min(progressPercentage, 100)}
                          className="h-2.5 bg-slate-200"
                        />
                      </div>

                      {/* AI Insight */}
                      <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-xl p-4 border border-slate-100">
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Info className="w-3 h-3 text-white" />
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed font-medium">
                            {insight.insight}
                          </p>
                        </div>
                      </div>

                      {/* Expected Gain */}
                      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm font-bold text-emerald-800">
                            Expected Gain:
                          </span>
                        </div>
                        <p className="text-sm text-emerald-700 font-semibold">
                          {insight.expectedGain}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-3">
                        <Button
                          size="sm"
                          className="flex-1 gap-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200"
                          onClick={() => handleAssignTask(insight)}
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Assign Task
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm transition-all duration-200"
                          onClick={() => handleViewData(insight)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Data
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 hover:bg-slate-100 transition-all duration-200"
                          onClick={() => handleAcknowledge(insight.id)}
                          disabled={acknowledgedInsights.has(insight.id)}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {acknowledgedInsights.has(insight.id)
                            ? "Acknowledged"
                            : "Acknowledge"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>

          {/* View All Insights Button */}
          <div className="flex justify-center pt-6">
            <Button 
              variant="outline" 
              className="gap-2 px-6 py-2.5 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
            >
              View All AI Insights
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Work Order Create Dialog */}
      <WorkOrderCreateDialog
        open={isCreateWorkOrderOpen}
        onOpenChange={setIsCreateWorkOrderOpen}
        defaultAssetId={plant?.id || ''}
        defaultTitle={selectedInsight ? `${selectedInsight.optimization}` : ""}
        defaultDescription={
          selectedInsight
            ? `${selectedInsight.insight}\n\nExpected Impact: ${selectedInsight.expectedGain}`
            : ""
        }
        onWorkOrderCreated={(workOrder) => {
          console.log("Work order created from AI insight:", workOrder);
          setIsCreateWorkOrderOpen(false);
        }}
      />

      {/* View Data Dialog */}
      <Dialog open={isDataDialogOpen} onOpenChange={setIsDataDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Related Data Analysis - {selectedInsight?.optimization}
            </DialogTitle>
            <DialogDescription>
              Detailed performance data and metrics related to this AI insight.
            </DialogDescription>
          </DialogHeader>

          {selectedInsight && (
            <div className="space-y-6">
              {/* Insight Summary */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-blue-900 mb-1">
                        {selectedInsight.kpiImpacted}
                      </div>
                      <div className="text-sm text-blue-700 space-y-1">
                        <div>
                          Current Value:{" "}
                          <strong>{selectedInsight.currentValue}%</strong>
                        </div>
                        <div>
                          Target Value:{" "}
                          <strong>{selectedInsight.targetValue}%</strong>
                        </div>
                        <div>
                          Confidence:{" "}
                          <strong>{selectedInsight.confidenceScore}%</strong>
                        </div>
                        <div>
                          Priority:{" "}
                          <strong className="capitalize">
                            {selectedInsight.priority}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Data */}
              {(() => {
                const relatedData = generateRelatedData(selectedInsight);

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Performance Metrics */}
                    {'performanceMetrics' in relatedData && relatedData.performanceMetrics && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">
                            Performance Metrics
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {Object.entries(('performanceMetrics' in relatedData ? relatedData.performanceMetrics : {})).map(
                            ([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="capitalize text-muted-foreground">
                                  {key}:
                                </span>
                                <span className="font-medium">
                                  {value as string}
                                </span>
                              </div>
                            ),
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Energy Production */}
                    {'energyProduction' in relatedData && relatedData.energyProduction && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">
                            Energy Production
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Current:
                            </span>
                            <span className="font-medium">
                              {'energyProduction' in relatedData ? relatedData.energyProduction.current : ''}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Expected:
                            </span>
                            <span className="font-medium">
                              {'energyProduction' in relatedData ? relatedData.energyProduction.expected : ''}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Deviation:
                            </span>
                            <span className="font-medium text-red-600">
                              {'energyProduction' in relatedData ? relatedData.energyProduction.deviation : ''}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Cost Analysis */}
                    {'costAnalysis' in relatedData && relatedData.costAnalysis && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">
                            Cost Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Current OpEx:
                            </span>
                            <span className="font-medium">
                              {'costAnalysis' in relatedData ? relatedData.costAnalysis.currentOpEx : ''}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Target OpEx:
                            </span>
                            <span className="font-medium">
                              {'costAnalysis' in relatedData ? relatedData.costAnalysis.targetOpEx : ''}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Potential Savings:
                            </span>
                            <span className="font-medium text-green-600">
                              {'costAnalysis' in relatedData ? relatedData.costAnalysis.potentialSavings : ''}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Revenue Metrics */}
                    {'revenueMetrics' in relatedData && relatedData.revenueMetrics && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">
                            Revenue Impact
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Current Revenue:
                            </span>
                            <span className="font-medium">
                              {'revenueMetrics' in relatedData ? relatedData.revenueMetrics.currentRevenue : ''}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Projected Increase:
                            </span>
                            <span className="font-medium text-green-600">
                              {'revenueMetrics' in relatedData ? relatedData.revenueMetrics.projectedIncrease : ''}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">ROI:</span>
                            <span className="font-medium">
                              {'revenueMetrics' in relatedData ? relatedData.revenueMetrics.roi : ''}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                );
              })()}

              {/* Affected Components */}
              {(() => {
                const relatedData = generateRelatedData(selectedInsight);
                return (
                  'affectedComponents' in relatedData && relatedData.affectedComponents && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Affected Components
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {('affectedComponents' in relatedData ? relatedData.affectedComponents : []).map(
                            (component: string, index: number) => (
                              <Badge key={index} variant="outline">
                                {component}
                              </Badge>
                            ),
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                );
              })()}

              {/* Recommendations */}
              {(() => {
                const relatedData = generateRelatedData(selectedInsight);
                return (
                  ('recommendations' in relatedData && relatedData.recommendations ||
                                         'optimizationAreas' in relatedData && relatedData.optimizationAreas) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          {('recommendations' in relatedData && relatedData.recommendations
                              ? "Recommendations"
                              : 'optimizationAreas' in relatedData && relatedData.optimizationAreas 
                              ? "Optimization Areas" 
                              : "")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {(
                            ('recommendations' in relatedData ? relatedData.recommendations : null) ||
                            ('optimizationAreas' in relatedData ? relatedData.optimizationAreas : null)
                          )?.map((item: string, index: number) => (
                            <div key={index} className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                              <span className="text-sm">{item}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                );
              })()}

              {/* Data Summary */}
              {(() => {
                const relatedData = generateRelatedData(selectedInsight);
                return (
                  <Card className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold">
                            {relatedData.dataPoints}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Data Points
                          </div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold">
                            {relatedData.timeRange}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Analysis Period
                          </div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold">
                            {new Date(
                              relatedData.lastUpdated,
                            ).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Last Updated
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
