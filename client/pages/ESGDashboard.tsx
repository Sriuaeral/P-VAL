import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAlert } from "@/hooks/use-alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Leaf,
  Trees,
  Car,
  Factory,
  Target,
  TrendingUp,
  Users,
  Shield,
  FileText,
  Calendar,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Award,
  Heart,
  Settings,
  Bell,
  Bot,
  MapPin,
  Zap,
  GraduationCap,
  UserCheck,
  Eye,
  Plus,
} from "lucide-react";

export default function ESGDashboard() {
  const alert = useAlert();
  const [selectedTimeRange, setSelectedTimeRange] = useState("12m");
  const [selectedReportType, setSelectedReportType] = useState("comprehensive");

  // Mock carbon metrics
  const carbonMetrics = {
    totalCO2Avoided: 12547,
    monthlyAvoidance: 1083,
    treesEquivalent: 162345,
    carsOffRoadEquivalent: 2847,
    dieselOffsetLiters: 4893402,
  };

  // Mock data for charts
  const carbonTrendData = [
    { month: "Jan", carbonAvoided: 150, target: 200, cumulative: 1800 },
    { month: "Feb", carbonAvoided: 180, target: 200, cumulative: 1980 },
    { month: "Mar", carbonAvoided: 165, target: 200, cumulative: 2145 },
    { month: "Apr", carbonAvoided: 190, target: 200, cumulative: 2335 },
    { month: "May", carbonAvoided: 175, target: 200, cumulative: 2510 },
    { month: "Jun", carbonAvoided: 210, target: 200, cumulative: 2720 },
    { month: "Jul", carbonAvoided: 195, target: 200, cumulative: 2915 },
    { month: "Aug", carbonAvoided: 185, target: 200, cumulative: 3100 },
    { month: "Sep", carbonAvoided: 200, target: 200, cumulative: 3300 },
    { month: "Oct", carbonAvoided: 205, target: 200, cumulative: 3505 },
    { month: "Nov", carbonAvoided: 190, target: 200, cumulative: 3695 },
    { month: "Dec", carbonAvoided: 215, target: 200, cumulative: 3910 },
  ];

  const siteComparisonData = [
    { site: "Plant A", carbonAvoided: 2450, target: 2500, efficiency: 98 },
    { site: "Plant B", carbonAvoided: 1890, target: 2000, efficiency: 94.5 },
    { site: "Plant C", carbonAvoided: 3120, target: 3000, efficiency: 104 },
    { site: "Plant D", carbonAvoided: 1654, target: 1800, efficiency: 91.9 },
  ];

  const energyMixData = [
    { name: "Solar PV", value: 92, color: "#10B981" },
    { name: "Grid Backup", value: 6, color: "#F59E0B" },
    { name: "Diesel Offset", value: 2, color: "#EF4444" },
  ];

  const sustainabilityTargets = [
    {
      id: "carbon-2030",
      title: "CO₂ Reduction by 2030",
      targetYear: 2030,
      currentProgress: 12500,
      targetValue: 18000,
      unit: "tonnes CO₂",
      category: "carbon",
    },
    {
      id: "renewable-2025",
      title: "100% Renewable Energy",
      targetYear: 2025,
      currentProgress: 94,
      targetValue: 100,
      unit: "% renewable",
      category: "energy",
    },
    {
      id: "waste-2027",
      title: "Zero Waste to Landfill",
      targetYear: 2027,
      currentProgress: 78,
      targetValue: 100,
      unit: "% recycled",
      category: "waste",
    },
    {
      id: "water-2026",
      title: "Water Consumption Reduction",
      targetYear: 2026,
      currentProgress: 23,
      targetValue: 40,
      unit: "% reduction",
      category: "water",
    },
  ];

  const socialTrendData = [
    { month: "Jan", employment: 45, training: 120, community: 8, safety: 0 },
    { month: "Feb", employment: 47, training: 135, community: 9, safety: 1 },
    { month: "Mar", employment: 48, training: 145, community: 10, safety: 0 },
    { month: "Apr", employment: 50, training: 160, community: 12, safety: 2 },
    { month: "May", employment: 52, training: 140, community: 11, safety: 0 },
    { month: "Jun", employment: 51, training: 155, community: 13, safety: 1 },
  ];

  const esgAlerts = [
    {
      id: "esg-001",
      type: "environmental",
      priority: "high",
      title: "Carbon reduction below baseline",
      description:
        "Monthly carbon avoidance dropped 15% below target due to reduced generation",
      status: "pending",
    },
    {
      id: "esg-002",
      type: "governance",
      priority: "critical",
      title: "Annual ESG audit due",
      description:
        "ISO 14001 certification audit scheduled in 15 days - documentation review required",
      dueDate: "2024-01-30",
      status: "acknowledged",
    },
    {
      id: "esg-003",
      type: "social",
      priority: "medium",
      title: "Safety training overdue",
      description:
        "12 technicians require safety refresher training within next 30 days",
      dueDate: "2024-02-15",
      status: "pending",
    },
  ];

  const aiRecommendations = [
    {
      id: "ai-esg-001",
      category: "environmental",
      priority: "high",
      title: "Optimize cleaning schedule for carbon impact",
      description:
        "Increase panel cleaning frequency at Plant A to recover 2% energy loss and improve carbon savings",
      estimatedImpact: "Additional 45 tonnes CO₂ avoided annually",
      timeframe: "2 weeks",
      confidence: 87,
    },
    {
      id: "ai-esg-002",
      category: "governance",
      priority: "medium",
      title: "ESG policy document update needed",
      description:
        "Environmental policy documents last updated 18 months ago - regulatory changes require updates",
      estimatedImpact: "Compliance risk mitigation",
      timeframe: "30 days",
      confidence: 92,
    },
  ];

  const complianceDocuments = [
    {
      id: "doc-001",
      name: "ISO 14001 Certificate",
      type: "Certificate",
      uploadDate: "2023-08-15",
      status: "valid",
      expiryDate: "2026-08-15",
    },
    {
      id: "doc-002",
      name: "Environmental Policy",
      type: "Policy",
      uploadDate: "2023-06-10",
      status: "review_needed",
      expiryDate: "2024-06-10",
    },
  ];

  const getTargetCategoryColor = (category: string) => {
    switch (category) {
      case "carbon":
        return "bg-green-50 text-green-700 border-green-200";
      case "energy":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "waste":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "water":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getAlertPriorityColor = (priority: string) => {
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

  const getPriorityColor = (priority: string) => {
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

  const handleExportESGReport = () => {
    alert.featureUnderConstruction('ESG report export');
  };

  const pendingAlerts = esgAlerts.filter(
    (alert) => alert.status === "pending",
  ).length;
  const overdueDocuments = complianceDocuments.filter(
    (doc) => doc.status === "review_needed",
  ).length;
  const avgCarbonMonthly =
    carbonTrendData.reduce((sum, item) => sum + item.carbonAvoided, 0) /
    carbonTrendData.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/20 to-blue-50/30 dark:from-slate-950 dark:via-slate-900/95 dark:to-green-950/30">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/30 shadow-2xl shadow-green-500/5 rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-blue-500/5"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-blue-800 bg-clip-text text-transparent flex items-center gap-3">
                  <Leaf className="w-8 h-8 text-green-600" />
                  ESG Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                  Environmental, Social, and Governance reporting and compliance monitoring
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Select
                  value={selectedTimeRange}
                  onValueChange={setSelectedTimeRange}
                >
                  <SelectTrigger className="w-40 bg-white/50 backdrop-blur-sm border-white/30 rounded-xl h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3m">Last 3 months</SelectItem>
                    <SelectItem value="6m">Last 6 months</SelectItem>
                    <SelectItem value="12m">Last 12 months</SelectItem>
                    <SelectItem value="24m">Last 24 months</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-3 text-sm px-6 py-3 border-2 border-green-200 hover:border-green-300 hover:bg-green-50/50 transition-all duration-200 shadow-lg hover:shadow-xl rounded-xl"
                  onClick={handleExportESGReport}
                >
                  <Download className="w-4 h-4" />
                  Export ESG Report
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shadow-lg">
                  <Leaf className="w-6 h-6 text-green-600" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground font-medium">CO₂ Avoided</div>
                  <div className="text-2xl font-bold text-green-600">
                    {carbonMetrics.totalCO2Avoided.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    tonnes total
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shadow-lg">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground font-medium">ESG Score</div>
                  <div className="text-2xl font-bold text-blue-600">94</div>
                  <div className="text-xs text-muted-foreground">
                    % compliance
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground font-medium">Local Jobs</div>
                  <div className="text-2xl font-bold text-yellow-600">47</div>
                  <div className="text-xs text-muted-foreground">employees</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground font-medium">
                    Safety Record
                  </div>
                  <div className="text-2xl font-bold text-purple-600">2</div>
                  <div className="text-xs text-muted-foreground">
                    incidents YTD
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shadow-lg">
                  <Bell className="w-6 h-6 text-orange-600" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground font-medium">
                    Pending Alerts
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {pendingAlerts}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    require action
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-red-600" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground font-medium">Doc Reviews</div>
                  <div className="text-2xl font-bold text-red-600">
                    {overdueDocuments}
                  </div>
                  <div className="text-xs text-muted-foreground">overdue</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Banner */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-green-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  AI ESG Performance Insights
                </h3>
                <div className="text-sm mb-3">
                  <strong>Portfolio Performance:</strong> Carbon savings on track
                  for 70% of 2030 target. Monthly carbon avoidance averaging{" "}
                  {avgCarbonMonthly.toFixed(0)} tonnes. Predicted 6% decline next
                  quarter requires immediate intervention at underperforming
                  sites.
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    Optimize cleaning at Plant A (+2% efficiency)
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    ESG audit due in 15 days
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-yellow-50 text-yellow-700 border-yellow-200"
                  >
                    Update environmental policies
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="environmental" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger
              value="environmental"
              className="flex items-center gap-2"
            >
              <Leaf className="w-4 h-4" />
              Environmental
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Social
            </TabsTrigger>
            <TabsTrigger value="governance" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Governance
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Environmental Tab */}
          <TabsContent value="environmental" className="space-y-6">
            {/* Carbon Emissions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-green-600" />
                    Carbon Emissions Avoided
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={carbonTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      
                      <Area
                        type="monotone"
                        dataKey="carbonAvoided"
                        stroke="#10B981"
                        fill="#10B98120"
                        name="CO₂ Avoided (tonnes)"
                      />
                      <Area
                        type="monotone"
                        dataKey="target"
                        stroke="#F59E0B"
                        fill="transparent"
                        strokeDasharray="5 5"
                        name="Target"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Trees className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">
                        {carbonMetrics.treesEquivalent.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Trees Planted Equivalent
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Car className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">
                        {carbonMetrics.carsOffRoadEquivalent.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Cars Off Road Equivalent
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Factory className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-orange-600">
                        {(carbonMetrics.dieselOffsetLiters / 1000).toFixed(0)}k
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Liters Diesel Offset
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Site Comparison & Energy Mix */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Site-wise Carbon Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={siteComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="site" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="carbonAvoided"
                        fill="#10B981"
                        name="CO₂ Avoided"
                      />
                      <Bar dataKey="target" fill="#E5E7EB" name="Target" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Energy Mix Contribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={energyMixData}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          label={false}
                        >
                          {energyMixData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, ""]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {energyMixData.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-sm font-medium">
                            {entry.name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({entry.value}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sustainability Targets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Sustainability Targets Tracker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sustainabilityTargets.map((target) => {
                    const progressPercentage =
                      (target.currentProgress / target.targetValue) * 100;
                    return (
                      <div
                        key={target.id}
                        className={`p-4 border rounded-lg ${getTargetCategoryColor(target.category)}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{target.title}</div>
                          <Badge variant="outline">{target.targetYear}</Badge>
                        </div>
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>
                              {target.currentProgress.toLocaleString()}{" "}
                              {target.unit}
                            </span>
                            <span>{progressPercentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                          <div className="text-xs text-muted-foreground mt-1">
                            Target: {target.targetValue.toLocaleString()}{" "}
                            {target.unit}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Local Employment
                      </div>
                      <div className="text-2xl font-bold">47</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Heart className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Community Initiatives
                      </div>
                      <div className="text-2xl font-bold">12</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Training Hours
                      </div>
                      <div className="text-2xl font-bold">1,456</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Safety Incidents
                      </div>
                      <div className="text-2xl font-bold">2</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Social Responsibility Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={socialTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    
                    <Line
                      type="monotone"
                      dataKey="employment"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      name="Local Employment"
                    />
                    <Line
                      type="monotone"
                      dataKey="training"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Training Hours"
                    />
                    <Line
                      type="monotone"
                      dataKey="community"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      name="Community Initiatives"
                    />
                    <Line
                      type="monotone"
                      dataKey="safety"
                      stroke="#EF4444"
                      strokeWidth={2}
                      name="Safety Incidents"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Governance Tab */}
          <TabsContent value="governance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Completed Audits
                      </div>
                      <div className="text-2xl font-bold">8</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Upcoming Deadlines
                      </div>
                      <div className="text-2xl font-bold">3</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        ESG Responsible
                      </div>
                      <div className="text-2xl font-bold">5</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Compliance Score
                      </div>
                      <div className="text-2xl font-bold">94%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Document Repository
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {complianceDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{doc.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {doc.type} • Uploaded{" "}
                          {new Date(doc.uploadDate).toLocaleDateString()}
                        </div>
                        {doc.expiryDate && (
                          <div className="text-xs text-muted-foreground">
                            Expires:{" "}
                            {new Date(doc.expiryDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={doc.status === "valid" ? "success" : "warning"}
                        >
                          {doc.status.replace("_", " ").toUpperCase()}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Document
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ESG Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    ESG Alerts & Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {esgAlerts.map((alert) => (
                      <div key={alert.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            variant={getAlertPriorityColor(alert.priority) as any}
                          >
                            {alert.priority.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {alert.type.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>
                        <div className="font-medium mb-1">{alert.title}</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {alert.description}
                        </div>
                        {alert.dueDate && (
                          <div className="text-xs text-muted-foreground mb-2">
                            Due: {new Date(alert.dueDate).toLocaleDateString()}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <Badge
                            variant={
                              alert.status === "resolved"
                                ? "success"
                                : alert.status === "acknowledged"
                                  ? "warning"
                                  : "secondary"
                            }
                          >
                            {alert.status.toUpperCase()}
                          </Badge>
                          {alert.status === "pending" && (
                            <Button variant="outline" size="sm">
                              Acknowledge
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

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
                    {aiRecommendations.map((rec) => (
                      <div key={rec.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={getPriorityColor(rec.priority) as any}>
                            {rec.priority.toUpperCase()}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {rec.confidence}% confidence
                          </div>
                        </div>
                        <div className="font-medium mb-1">{rec.title}</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {rec.description}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          <div>
                            <span className="text-muted-foreground">Impact:</span>{" "}
                            {rec.estimatedImpact}
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Timeframe:
                            </span>{" "}
                            {rec.timeframe}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          <Plus className="w-3 h-3 mr-1" />
                          Create Action Plan
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Report Generator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-primary" />
                  ESG Report Generator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Report Type
                    </label>
                    <Select
                      value={selectedReportType}
                      onValueChange={setSelectedReportType}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="comprehensive">
                          Comprehensive ESG Report
                        </SelectItem>
                        <SelectItem value="carbon">Carbon Impact Only</SelectItem>
                        <SelectItem value="social">
                          Social Responsibility
                        </SelectItem>
                        <SelectItem value="governance">
                          Governance Overview
                        </SelectItem>
                        <SelectItem value="investor">Investor Summary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Time Period
                    </label>
                    <Select
                      value={selectedTimeRange}
                      onValueChange={setSelectedTimeRange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3m">Last 3 Months</SelectItem>
                        <SelectItem value="6m">Last 6 Months</SelectItem>
                        <SelectItem value="12m">Last 12 Months</SelectItem>
                        <SelectItem value="24m">Last 24 Months</SelectItem>
                        <SelectItem value="ytd">Year to Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Format
                    </label>
                    <Select defaultValue="pdf">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Report</SelectItem>
                        <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                        <SelectItem value="powerpoint">
                          PowerPoint Presentation
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg mb-4">
                  <h4 className="font-medium mb-2">Report Preview</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      • Cumulative carbon savings:{" "}
                      {carbonMetrics.totalCO2Avoided.toLocaleString()} tonnes CO₂
                    </div>
                    <div>• Monthly sustainability performance trends</div>
                    <div>• Social responsibility KPIs and community impact</div>
                    <div>• Governance compliance scores and audit logs</div>
                    <div>
                      • AI-generated executive summary and recommendations
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleExportESGReport} className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Generate ESG Report
                  </Button>
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Customize
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
