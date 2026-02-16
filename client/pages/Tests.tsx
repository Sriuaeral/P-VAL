import { useState, useEffect } from "react";
import { plantsService } from "@shared/api";
import { getPlantWeatherData } from "@shared/api";
import { WeatherData } from "@shared/interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DatePicker } from "@/components/ui/date-picker";
import {
  ClipboardCheck,
  Zap,
  Shield,
  TrendingUp,
  Plus,
  User,
  Calendar as CalendarIcon,
  Upload,
  Download,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  FileText,
  Bot,
  Activity,
  Target,
  BarChart3,
  Clock,
  Filter,
  Search,
  RefreshCw,
  Camera,
  FileSpreadsheet,
  Thermometer,
  Battery,
  Settings,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import WorkOrderCreateDialog from "@/components/WorkOrderCreateDialog";
import ApiService from "@/lib/api";

interface TestTemplate {
  id: string;
  name: string;
  description: string;
  category: "electrical" | "performance" | "safety" | "environmental";
  duration: number; // in minutes
  icon: React.ComponentType<{ className?: string }>;
  parameters: string[];
  equipment: string[];
  compliance: string[];
}

interface TestWorkOrder {
  id: string;
  templateId: string;
  templateName: string;
  siteId: string;
  siteName: string;
  assignedTo: {
    id: string;
    name: string;
    role: string;
  };
  createdBy: string;
  createdDate: string;
  dueDate: string;
  status: "pending" | "in_progress" | "data_uploaded" | "analyzed" | "completed" | "failed";
  priority: "low" | "medium" | "high" | "urgent";
  resultsUploaded: boolean;
  analysisCompleted: boolean;
  testResults?: TestResults;
  followUpWorkOrders?: string[];
}

interface TestResults {
  uploadDate: string;
  fileName: string;
  fileSize: string;
  passFailStatus: "pass" | "fail" | "inconclusive";
  compliance: number; // percentage
  anomalies: Array<{
    parameter: string;
    expected: string;
    actual: string;
    deviation: number;
    severity: "low" | "medium" | "high" | "critical";
  }>;
  aiInsights: {
    summary: string;
    confidence: number;
    recommendations: string[];
    followUpRequired: boolean;
  };
}



const testTemplates: TestTemplate[] = [
  {
    id: "voltage-test",
    name: "Voltage Test",
    description: "DC and AC voltage measurements across PV strings and inverters",
    category: "electrical",
    duration: 120,
    icon: Zap,
    parameters: ["Voc", "Vmp", "Isc", "Imp", "Fill Factor"],
    equipment: ["Digital Multimeter", "IV Curve Tracer", "Insulation Tester"],
    compliance: ["IEC 61215", "IEC 61730", "UL 1703"],
  },
  {
    id: "interface-protection",
    name: "Interface Protection Test",
    description: "Grid interconnection safety and protection system verification",
    category: "safety",
    duration: 180,
    icon: Shield,
    parameters: ["Over/Under Voltage", "Over/Under Frequency", "Islanding", "Ground Fault"],
    equipment: ["Protection Tester", "Grid Simulator", "Oscilloscope"],
    compliance: ["IEEE 1547", "UL 1741", "IEC 62116"],
  },
  {
    id: "string-iv",
    name: "String IV Check",
    description: "Current-voltage characteristic analysis of PV strings",
    category: "performance",
    duration: 90,
    icon: TrendingUp,
    parameters: ["IV Curve", "Power Output", "String Matching", "Mismatch Loss"],
    equipment: ["IV Curve Tracer", "Pyranometer", "Temperature Sensor"],
    compliance: ["IEC 61853", "ASTM E973", "IEC 60904-1"],
  },
  {
    id: "thermal-imaging",
    name: "Thermal Imaging Test",
    description: "Infrared thermography for hotspot and component analysis",
    category: "performance",
    duration: 60,
    icon: Thermometer,
    parameters: ["Hot Spots", "Temperature Differential", "Thermal Anomalies"],
    equipment: ["Thermal Camera", "Drone (optional)", "Temperature Logger"],
    compliance: ["IEC TS 62446-3", "ASTM E1934", "IEC 61215"],
  },
  {
    id: "insulation-test",
    name: "Insulation Resistance Test",
    description: "DC and AC insulation resistance measurements",
    category: "safety",
    duration: 45,
    icon: Settings,
    parameters: ["DC Insulation", "AC Insulation", "Ground Continuity"],
    equipment: ["Insulation Tester", "Megohmmeter", "Ground Tester"],
    compliance: ["IEC 61215", "IEC 60364-6", "NEC Article 690"],
  },
  {
    id: "energy-yield",
    name: "Energy Yield Assessment",
    description: "Performance ratio and energy yield verification",
    category: "performance",
    duration: 240,
    icon: Battery,
    parameters: ["Performance Ratio", "Energy Yield", "Availability", "Capacity Factor"],
    equipment: ["Data Logger", "Revenue Meter", "Weather Station"],
    compliance: ["IEC 61724", "IEC 61853", "ASTM E2848"],
  },
];



const handleSyncTests = () => {
  window.location.reload();
};

const generateMockTestWorkOrders = (): TestWorkOrder[] => [
  {
    id: "TEST-2024-001",
    templateId: "voltage-test",
    templateName: "Voltage Test",
    siteId: "1",
    siteName: "Rajasthan Solar Park A",
    assignedTo: {
      id: "se-1",
      name: "Sarah Chen",
      role: "Senior Engineer",
    },
    createdBy: "Plant Manager",
    createdDate: "2024-01-15T08:00:00Z",
    dueDate: "2024-01-17T17:00:00Z",
    status: "completed",
    priority: "medium",
    resultsUploaded: true,
    analysisCompleted: true,
    testResults: {
      uploadDate: "2024-01-16T14:30:00Z",
      fileName: "voltage_test_rajasthan_A.csv",
      fileSize: "2.4 MB",
      passFailStatus: "pass",
      compliance: 96.8,
      anomalies: [
        {
          parameter: "String 12 Voc",
          expected: "780-820V",
          actual: "775V",
          deviation: -0.6,
          severity: "low",
        },
      ],
      aiInsights: {
        summary: "Overall system voltage parameters within acceptable range. Minor deviation in String 12 suggests potential module aging.",
        confidence: 94,
        recommendations: [
          "Monitor String 12 performance over next 30 days",
          "Consider module-level performance analysis",
          "Schedule follow-up IV curve testing",
        ],
        followUpRequired: false,
      },
    },
  },
  {
    id: "TEST-2024-002",
    templateId: "interface-protection",
    templateName: "Interface Protection Test",
    siteId: "2",
    siteName: "Gujarat Solar Farm B",
    assignedTo: {
      id: "je-1",
      name: "Priya Sharma",
      role: "Junior Engineer",
    },
    createdBy: "Site Manager",
    createdDate: "2024-01-14T10:00:00Z",
    dueDate: "2024-01-16T18:00:00Z",
    status: "failed",
    priority: "high",
    resultsUploaded: true,
    analysisCompleted: true,
    testResults: {
      uploadDate: "2024-01-15T16:45:00Z",
      fileName: "protection_test_gujarat_B.csv",
      fileSize: "1.8 MB",
      passFailStatus: "fail",
      compliance: 73.2,
      anomalies: [
        {
          parameter: "Under-frequency Protection",
          expected: "59.3Hz trip",
          actual: "58.8Hz trip",
          deviation: -0.8,
          severity: "critical",
        },
        {
          parameter: "Islanding Detection",
          expected: "<2 seconds",
          actual: "2.8 seconds",
          deviation: 40.0,
          severity: "high",
        },
      ],
      aiInsights: {
        summary: "Critical protection system failures detected. Under-frequency and islanding protection settings require immediate calibration.",
        confidence: 98,
        recommendations: [
          "URGENT: Recalibrate protection relay settings",
          "Update anti-islanding detection algorithm",
          "Perform complete protection system audit",
          "Re-test after corrections implemented",
        ],
        followUpRequired: true,
      },
    },
    followUpWorkOrders: ["WO-2024-FU-001", "WO-2024-FU-002"],
  },
  {
    id: "TEST-2024-003",
    templateId: "string-iv",
    templateName: "String IV Check",
    siteId: "3",
    siteName: "Tamil Nadu Solar Unit C",
    assignedTo: {
      id: "ft-1",
      name: "Mohamed Ali",
      role: "Field Technician",
    },
    createdBy: "O&M Manager",
    createdDate: "2024-01-16T09:30:00Z",
    dueDate: "2024-01-18T15:00:00Z",
    status: "in_progress",
    priority: "medium",
    resultsUploaded: false,
    analysisCompleted: false,
  },
];

export default function Tests() {
  const alert = useAlert();
  //// get data from api
  const handleExportResults = () => {
    alert.featureUnderConstruction('Test results export');
  };
  const [plants, setPlants] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const result = await plantsService.fetchPlants();
        if (active) setPlants((result || []).map((plant: any) => ({ id: plant.id.toString(), name: plant.name })));
      } catch (e) {
        if (active) setPlants([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  const [testWorkOrders, setTestWorkOrders] = useState(generateMockTestWorkOrders());
  const [selectedTemplate, setSelectedTemplate] = useState<TestTemplate | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<TestWorkOrder | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isWorkOrderDialogOpen, setIsWorkOrderDialogOpen] = useState(false);
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Create Test Work Order form data
  const [testFormData, setTestFormData] = useState({
    siteId: "",
    assignedRole: "",
    dueDate: undefined as Date | undefined,
    priority: "medium" as TestWorkOrder["priority"],
    notes: "",
    checklist: [] as Array<{
      id: string;
      task: string;
      photoRequired: boolean;
    }>,
  });

  const filteredWorkOrders = testWorkOrders.filter((order) => {
    const matchesSearch = 
      order.templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.assignedTo.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const template = testTemplates.find(t => t.id === order.templateId);
    const matchesCategory = categoryFilter === "all" || template?.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: TestWorkOrder["status"]) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "in_progress":
        return "default";
      case "data_uploaded":
        return "warning";
      case "analyzed":
        return "info";
      case "completed":
        return "success";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: TestWorkOrder["status"]) => {
    switch (status) {
      case "pending":
        return Clock;
      case "in_progress":
        return Activity;
      case "data_uploaded":
        return Upload;
      case "analyzed":
        return BarChart3;
      case "completed":
        return CheckCircle;
      case "failed":
        return XCircle;
      default:
        return Clock;
    }
  };

  const getCategoryIcon = (category: TestTemplate["category"]) => {
    switch (category) {
      case "electrical":
        return Zap;
      case "performance":
        return TrendingUp;
      case "safety":
        return Shield;
      case "environmental":
        return Thermometer;
      default:
        return ClipboardCheck;
    }
  };

  const handleCreateTestWorkOrder = async () => {
    if (!selectedTemplate || !testFormData.siteId || !testFormData.assignedRole || !testFormData.dueDate) {
      alert.validationError("Please fill in all required fields");
      return;
    }

    try {
      const plant = plants.find(p => p.id === testFormData.siteId);

      const requestBody = {
        Id: `TEST-${Date.now()}`,
        AlertId: "",
        Title: `${selectedTemplate.name} Test`,
        Description: `${selectedTemplate.description}${testFormData.notes ? "\n\nNotes: " + testFormData.notes : ""}`,
        Component: Number(testFormData.siteId),
        Type: "test",
        Severity: testFormData.priority === "urgent" ? "high" : (testFormData.priority === "high" ? "high" : (testFormData.priority === "medium" ? "medium" : "low")),
        Status: "InProgress",
        AssignedTo: {
          Id: testFormData.assignedRole,
          Name: testFormData.assignedRole === "se-1" ? "Sarah Chen" : 
                testFormData.assignedRole === "je-1" ? "Priya Sharma" : "Mohamed Ali",
          Title: testFormData.assignedRole.startsWith("se") ? "Senior Engineer" :
                 testFormData.assignedRole.startsWith("je") ? "Junior Engineer" : "Field Technician",
          Avatar: "",
          Phone: "",
        },
        CreatedBy: "Test Admin",
        CreatedDate: new Date().toISOString(),
        TargetCompletionDate: testFormData.dueDate.toISOString(),
        EstimatedDuration: selectedTemplate.duration,
        ChecklistProgress: {
          Completed: 0,
          Total: (testFormData.checklist || []).length,
        },
        Priority: testFormData.priority === "urgent" ? "Urgent" : 
                  testFormData.priority === "high" ? "High" : 
                  testFormData.priority === "medium" ? "Normal" : "Low",
        FaultType: selectedTemplate.category,
        Location: plant?.name || "Plant Site",
        Uploads: [],
        Comments: [],
        Checklist: (testFormData.checklist || []).map((item, index) => ({
          Id: item.id || `cl-${Date.now()}-${index}`,
          Task: item.task,
          Completed: false,
          CompletedBy: null,
          CompletedAt: null,
          Notes: null,
          PhotoRequired: item.photoRequired,
          PhotoUploaded: null,
        })),
        PlantId: Number(testFormData.siteId) || 1,
      };

      const response = await ApiService.post("/workorders", requestBody);

      // Optimistically add to local list for UI feedback
      const newWorkOrder: TestWorkOrder = {
        id: requestBody.Id,
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name,
        siteId: testFormData.siteId,
        siteName: plant?.name || "Unknown Site",
        assignedTo: {
          id: requestBody.AssignedTo.Id,
          name: requestBody.AssignedTo.Name,
          role: requestBody.AssignedTo.Title,
        },
        createdBy: requestBody.CreatedBy,
        createdDate: requestBody.CreatedDate,
        dueDate: requestBody.TargetCompletionDate,
        status: "pending",
        priority: testFormData.priority,
        resultsUploaded: false,
        analysisCompleted: false,
      };
      setTestWorkOrders(prev => [newWorkOrder, ...prev]);

      setIsCreateDialogOpen(false);
      setSelectedTemplate(null);
      setTestFormData({
        siteId: "",
        assignedRole: "",
        dueDate: undefined,
        priority: "medium",
        notes: "",
        checklist: [],
      });

      alert.success && alert.success("Test work order created");
    } catch (e) {
      console.error("Error creating test work order:", e);
      alert.workOrderError ? alert.workOrderError('create') : alert.validationError("Failed to create work order");
    }
  };

  const handleUploadResults = (workOrderId: string) => {
    // Simulate CSV upload and analysis
    setTestWorkOrders(prev => prev.map(order => 
      order.id === workOrderId 
        ? { 
            ...order, 
            status: "data_uploaded" as const,
            resultsUploaded: true,
          }
        : order
    ));
    setIsUploadDialogOpen(false);
  };

  const summaryStats = {
    totalTests: testWorkOrders.length,
    pendingTests: testWorkOrders.filter(t => t.status === "pending").length,
    inProgressTests: testWorkOrders.filter(t => t.status === "in_progress").length,
    completedTests: testWorkOrders.filter(t => t.status === "completed").length,
    failedTests: testWorkOrders.filter(t => t.status === "failed").length,
    complianceRate: Math.round(
      (testWorkOrders.filter(t => t.testResults?.passFailStatus === "pass").length / 
       testWorkOrders.filter(t => t.testResults).length) * 100
    ) || 0,
  };

  // Add weather API test section
  const WeatherAPITest = () => {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const testWeatherAPI = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPlantWeatherData('1'); // Test with plant ID 1
        setWeatherData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    return (
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Weather API Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testWeatherAPI} disabled={loading}>
            {loading ? 'Testing...' : 'Test Weather API'}
          </Button>
          
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              Error: {error}
            </div>
          )}
          
          {weatherData && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              <h4 className="font-bold">Weather Data Retrieved:</h4>
              <pre className="mt-2 text-sm">{JSON.stringify(weatherData, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <ClipboardCheck className="w-8 h-8 text-primary" />
            Solar Field Tests
          </h1>
          <p className="text-muted-foreground">
            Schedule, execute, and analyze standard solar field testing procedures
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExportResults()}>
            <Download className="w-4 h-4" />
            Export Results
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => handleSyncTests()}>
            <RefreshCw className="w-4 h-4" />
            Sync Tests
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{summaryStats.totalTests}</div>
            <div className="text-xs text-muted-foreground">Total Tests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{summaryStats.pendingTests}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{summaryStats.inProgressTests}</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{summaryStats.completedTests}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{summaryStats.failedTests}</div>
            <div className="text-xs text-muted-foreground">Failed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{summaryStats.complianceRate}%</div>
            <div className="text-xs text-muted-foreground">Compliance Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Test Templates</TabsTrigger>
          <TabsTrigger value="work-orders">Active Tests</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
        </TabsList>

        {/* Test Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Standard Test Templates</CardTitle>
              <p className="text-sm text-muted-foreground">
                Industry-standard testing procedures for solar field validation
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {testTemplates.map((template) => {
                  const CategoryIcon = getCategoryIcon(template.category);
                  return (
                    <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              template.category === "electrical" ? "bg-yellow-100" :
                              template.category === "performance" ? "bg-green-100" :
                              template.category === "safety" ? "bg-red-100" : "bg-blue-100"
                            }`}>
                              <template.icon className={`w-6 h-6 ${
                                template.category === "electrical" ? "text-yellow-600" :
                                template.category === "performance" ? "text-green-600" :
                                template.category === "safety" ? "text-red-600" : "text-blue-600"
                              }`} />
                            </div>
                            <div>
                              <CardTitle className="text-base">{template.name}</CardTitle>
                              <Badge variant="outline" className="text-xs mt-1 capitalize">
                                {template.category}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {template.duration} min
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                        
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">
                            Test Parameters:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {template.parameters.slice(0, 3).map((param, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {param}
                              </Badge>
                            ))}
                            {template.parameters.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{template.parameters.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        <Button 
                          className="w-full gap-2"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setIsCreateDialogOpen(true);
                          }}
                        >
                          <Plus className="w-4 h-4" />
                          Create Test Work Order
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Tests Tab */}
        <TabsContent value="work-orders" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="data_uploaded">Data Uploaded</SelectItem>
                    <SelectItem value="analyzed">Analyzed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="environmental">Environmental</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Work Orders List */}
          <Card>
            <CardHeader>
              <CardTitle>Active Test Work Orders ({filteredWorkOrders.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {filteredWorkOrders.map((workOrder) => {
                  const StatusIcon = getStatusIcon(workOrder.status);
                  const template = testTemplates.find(t => t.id === workOrder.templateId);
                  
                  return (
                    <div
                      key={workOrder.id}
                      className="border-b last:border-b-0 p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedWorkOrder(workOrder);
                        setIsWorkOrderDialogOpen(true);
                      }}
                    >
                      <div className="flex items-start gap-4">
                        {/* Status Icon */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          workOrder.status === "completed" ? "bg-green-100" :
                          workOrder.status === "failed" ? "bg-red-100" :
                          workOrder.status === "in_progress" ? "bg-blue-100" : "bg-gray-100"
                        }`}>
                          <StatusIcon className={`w-5 h-5 ${
                            workOrder.status === "completed" ? "text-green-600" :
                            workOrder.status === "failed" ? "text-red-600" :
                            workOrder.status === "in_progress" ? "text-blue-600" : "text-gray-600"
                          }`} />
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold">{workOrder.templateName}</h3>
                              <p className="text-sm text-muted-foreground">
                                {workOrder.siteName} • {workOrder.id}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getStatusColor(workOrder.status) as any}>
                                {workOrder.status.replace("_", " ").toUpperCase()}
                              </Badge>
                              {template && (
                                <Badge variant="outline" className="capitalize">
                                  {template.category}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Assigned to:</span>
                              <div className="flex items-center gap-2 mt-1">
                                <User className="w-3 h-3 text-muted-foreground" />
                                <span>{workOrder.assignedTo.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {workOrder.assignedTo.role}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <span className="font-medium">Due Date:</span>
                              <div className="flex items-center gap-2 mt-1">
                                <CalendarIcon className="w-3 h-3 text-muted-foreground" />
                                <span>{new Date(workOrder.dueDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div>
                              <span className="font-medium">Priority:</span>
                              <div className="mt-1">
                                <Badge 
                                  variant={
                                    workOrder.priority === "urgent" ? "destructive" :
                                    workOrder.priority === "high" ? "warning" : "secondary"
                                  }
                                  className="text-xs capitalize"
                                >
                                  {workOrder.priority}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-2">
                            {workOrder.status === "pending" && (
                              <Button size="sm" variant="outline">
                                Start Test
                              </Button>
                            )}
                            {workOrder.status === "in_progress" && (
                              <Button 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedWorkOrder(workOrder);
                                  setIsUploadDialogOpen(true);
                                }}
                              >
                                <Upload className="w-3 h-3 mr-1" />
                                Upload Results
                              </Button>
                            )}
                            {workOrder.resultsUploaded && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedWorkOrder(workOrder);
                                  setIsResultsDialogOpen(true);
                                }}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View Results
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Results Tab */}
        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Results Analysis</CardTitle>
              <p className="text-sm text-muted-foreground">
                Completed test results with AI-powered analysis and insights
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testWorkOrders
                  .filter(order => order.testResults)
                  .map((workOrder) => (
                    <Card key={workOrder.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{workOrder.templateName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {workOrder.siteName} • {workOrder.testResults?.uploadDate && 
                                new Date(workOrder.testResults.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={
                                workOrder.testResults?.passFailStatus === "pass" ? "success" :
                                workOrder.testResults?.passFailStatus === "fail" ? "destructive" : "warning"
                              }
                            >
                              {workOrder.testResults?.passFailStatus?.toUpperCase()}
                            </Badge>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {workOrder.testResults?.compliance}% Compliance
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Confidence: {workOrder.testResults?.aiInsights.confidence}%
                              </div>
                            </div>
                          </div>
                        </div>

                        {workOrder.testResults?.aiInsights && (
                          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                            <div className="flex items-start gap-2">
                              <Bot className="w-4 h-4 text-blue-600 mt-0.5" />
                              <div className="flex-1">
                                <div className="text-sm font-medium text-blue-900 mb-1">
                                  AI Analysis Summary
                                </div>
                                <p className="text-sm text-blue-700">
                                  {workOrder.testResults.aiInsights.summary}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {workOrder.testResults?.anomalies && workOrder.testResults.anomalies.length > 0 && (
                          <div className="mt-3">
                            <div className="text-sm font-medium mb-2">Detected Anomalies:</div>
                            <div className="space-y-1">
                              {workOrder.testResults.anomalies.map((anomaly, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle className={`w-4 h-4 ${
                                      anomaly.severity === "critical" ? "text-red-600" :
                                      anomaly.severity === "high" ? "text-orange-600" :
                                      anomaly.severity === "medium" ? "text-yellow-600" : "text-gray-600"
                                    }`} />
                                    <span className="text-sm font-medium">{anomaly.parameter}</span>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Expected: {anomaly.expected} | Actual: {anomaly.actual}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-4 pt-3 border-t">
                          <div className="text-xs text-muted-foreground">
                            File: {workOrder.testResults?.fileName} ({workOrder.testResults?.fileSize})
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Download className="w-3 h-3 mr-1" />
                              Download CSV
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => {
                                setSelectedWorkOrder(workOrder);
                                setIsResultsDialogOpen(true);
                              }}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Full Analysis
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Test Work Order Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-primary" />
              Create Test Work Order - {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              Schedule and assign a test execution work order with automated checklist generation and role assignment.
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <Tabs defaultValue="details" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 h-12 bg-gray-50/50">
                <TabsTrigger value="details" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700">
                  Test Details
                </TabsTrigger>
                <TabsTrigger value="assignment" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700">
                  Role Assignment
                </TabsTrigger>
                <TabsTrigger value="checklist" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700">
                  Test Checklist
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                {/* Template Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <selectedTemplate.icon className="w-5 h-5 text-primary" />
                      {selectedTemplate.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {selectedTemplate.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Category:</span> {selectedTemplate.category}
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span> {selectedTemplate.duration} minutes
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="font-medium text-sm">Test Parameters:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedTemplate.parameters.map((param, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {param}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="font-medium text-sm">Required Equipment:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedTemplate.equipment.map((equipment, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {equipment}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Form Fields */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="site" className="text-sm font-semibold text-gray-700">Select Site *</Label>
                    <Select value={testFormData.siteId} onValueChange={(value) => 
                      setTestFormData(prev => ({ ...prev, siteId: value }))
                    }>
                      <SelectTrigger className="h-11 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200">
                        <SelectValue placeholder="Choose site" />
                      </SelectTrigger>
                      <SelectContent>
                        {plants.map((plant) => (
                          <SelectItem key={plant.id} value={plant.id}>
                            {plant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="priority" className="text-sm font-semibold text-gray-700">Priority Level</Label>
                    <Select value={testFormData.priority} onValueChange={(value: TestWorkOrder["priority"]) => 
                      setTestFormData(prev => ({ ...prev, priority: value }))
                    }>
                      <SelectTrigger className="h-11 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <DatePicker
                    value={testFormData.dueDate}
                    onChange={(date) => setTestFormData(prev => ({ ...prev, dueDate: date }))}
                    placeholder="Pick a date"
                    label="Due Date"
                    required
                    variant="default"
                    size="md"
                    minDate={new Date()}
                  />

                  <div className="space-y-3">
                    <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Special instructions or requirements for this test..."
                      value={testFormData.notes}
                      onChange={(e) => setTestFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="min-h-[100px] border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="assignment" className="space-y-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">Available Test Personnel</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        id: "se-1",
                        name: "Sarah Chen",
                        title: "Senior Engineer",
                        competencyLevel: 95,
                        activeWorkOrders: 2,
                        maxCapacity: 8,
                        contactPhone: "+91 98765 43210",
                        availability: { today: true, tomorrow: true, thisWeek: 5 },
                        specialties: ["High Voltage Systems", "Grid Integration", "Safety Protocols"],
                        avatar: "SC",
                      },
                      {
                        id: "je-1",
                        name: "Priya Sharma",
                        title: "Junior Engineer",
                        competencyLevel: 78,
                        activeWorkOrders: 1,
                        maxCapacity: 6,
                        contactPhone: "+91 98765 43212",
                        availability: { today: true, tomorrow: true, thisWeek: 5 },
                        specialties: ["Data Analysis", "Test Execution", "Documentation"],
                        avatar: "PS",
                      },
                      {
                        id: "ft-1",
                        name: "Mohamed Ali",
                        title: "Field Technician",
                        competencyLevel: 88,
                        activeWorkOrders: 0,
                        maxCapacity: 4,
                        contactPhone: "+91 98765 43214",
                        availability: { today: true, tomorrow: true, thisWeek: 6 },
                        specialties: ["Field Testing", "Equipment Setup", "Safety Compliance"],
                        avatar: "MA",
                      },
                    ].map((person) => {
                      const workloadPercentage = (person.activeWorkOrders / person.maxCapacity) * 100;
                      const isSelected = testFormData.assignedRole === person.id;
                      const isRecommended = person.availability.today && person.activeWorkOrders < person.maxCapacity;

                      return (
                        <Card
                          key={person.id}
                          className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                            isSelected ? "ring-2 ring-blue-500 border-blue-500 bg-blue-50/50" : "border-gray-200 hover:border-gray-300"
                          } ${isRecommended ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200" : "bg-white"}`}
                          onClick={() => setTestFormData(prev => ({ ...prev, assignedRole: person.id }))}
                        >
                          <CardContent className="p-5">
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-full border-2 border-gray-200 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                    <span className="text-blue-700 font-semibold text-sm">{person.avatar}</span>
                                  </div>
                                  <div>
                                    <div className="font-semibold flex items-center gap-2 text-gray-900">
                                      {person.name}
                                      {isRecommended && (
                                        <Badge
                                          variant="default"
                                          className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                                        >
                                          <Target className="w-3 h-3 mr-1" />
                                          Recommended
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-600 font-medium">
                                      {person.title}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xs text-gray-500 font-medium">
                                    Competency
                                  </div>
                                  <div className="font-bold text-xl text-blue-600">
                                    {person.competencyLevel}%
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-600 font-medium">Competency Level</span>
                                  <span className="font-semibold text-gray-900">{person.competencyLevel}%</span>
                                </div>
                                <Progress
                                  value={person.competencyLevel}
                                  className="h-3 bg-gray-200 rounded-full overflow-hidden"
                                />
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-600 font-medium">Current Workload</span>
                                  <span className="font-semibold text-gray-900">
                                    {person.activeWorkOrders}/{person.maxCapacity} orders
                                  </span>
                                </div>
                                <Progress
                                  value={workloadPercentage}
                                  className={`h-3 rounded-full overflow-hidden ${
                                    workloadPercentage > 80 
                                      ? "bg-gradient-to-r from-red-100 to-red-200" 
                                      : workloadPercentage > 60 
                                        ? "bg-gradient-to-r from-yellow-100 to-yellow-200" 
                                        : "bg-gradient-to-r from-green-100 to-green-200"
                                  }`}
                                />
                              </div>

                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-600 font-medium">Available:</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={person.availability.today ? "default" : "destructive"}
                                    className="text-xs px-2 py-1 rounded-full font-semibold"
                                  >
                                    Today: {person.availability.today ? "Yes" : "No"}
                                  </Badge>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2">
                                <User className="w-4 h-4 text-blue-600" />
                                <span className="text-gray-700 font-medium">{person.contactPhone}</span>
                              </div>

                              <div className="space-y-2">
                                <div className="text-xs font-medium text-muted-foreground">
                                  Specialties:
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {person.specialties.map((specialty, index) => (
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
              </TabsContent>

              <TabsContent value="checklist" className="space-y-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-gray-900">Test Execution Checklist</h4>
                    </div>
                    <Button size="sm" onClick={() => {
                      const newItem = {
                        id: `custom-${Date.now()}`,
                        task: "",
                        photoRequired: false,
                      };
                      setTestFormData(prev => ({
                        ...prev,
                        checklist: [...(prev.checklist || []), newItem]
                      }));
                    }} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="w-4 h-4" />
                      Add Item
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {(testFormData.checklist || []).map((item, index) => (
                      <Card key={item.id} className="border-gray-200 hover:border-gray-300 transition-colors duration-200">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full border-2 border-blue-200 bg-blue-50 flex items-center justify-center mt-1">
                              <span className="text-sm font-semibold text-blue-700">
                                {index + 1}
                              </span>
                            </div>
                            <div className="flex-1 space-y-3">
                              <Input
                                placeholder="Enter checklist task..."
                                value={item.task}
                                onChange={(e) => {
                                  setTestFormData(prev => ({
                                    ...prev,
                                    checklist: (prev.checklist || []).map(checklistItem =>
                                      checklistItem.id === item.id 
                                        ? { ...checklistItem, task: e.target.value }
                                        : checklistItem
                                    )
                                  }));
                                }}
                                className="border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                              />
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  id={`photo-${item.id}`}
                                  checked={item.photoRequired}
                                  onChange={(e) => {
                                    setTestFormData(prev => ({
                                      ...prev,
                                      checklist: (prev.checklist || []).map(checklistItem =>
                                        checklistItem.id === item.id 
                                          ? { ...checklistItem, photoRequired: e.target.checked }
                                          : checklistItem
                                      )
                                    }));
                                  }}
                                  className="w-4 h-4 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <Label
                                  htmlFor={`photo-${item.id}`}
                                  className="text-sm text-gray-700 font-medium cursor-pointer"
                                >
                                  Photo required for this task
                                </Label>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setTestFormData(prev => ({
                                  ...prev,
                                  checklist: (prev.checklist || []).filter(checklistItem => checklistItem.id !== item.id)
                                }));
                              }}
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {(testFormData.checklist || []).length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No checklist items yet</h3>
                      <p className="text-sm text-gray-500">
                        Add test execution steps manually or use the auto-generate feature.
                      </p>
                    </div>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const autoChecklist = [
                        { id: `auto-1-${Date.now()}`, task: "Pre-test safety inspection", photoRequired: true },
                        { id: `auto-2-${Date.now()}`, task: "Equipment setup and calibration", photoRequired: true },
                        { id: `auto-3-${Date.now()}`, task: `Execute ${selectedTemplate.name} test procedure`, photoRequired: true },
                        { id: `auto-4-${Date.now()}`, task: "Data collection and recording", photoRequired: false },
                        { id: `auto-5-${Date.now()}`, task: "Post-test equipment shutdown", photoRequired: false },
                        { id: `auto-6-${Date.now()}`, task: "Test report preparation", photoRequired: false },
                      ];
                      setTestFormData(prev => ({
                        ...prev,
                        checklist: [...(prev.checklist || []), ...autoChecklist]
                      }));
                    }}
                    className="gap-2"
                  >
                    <Bot className="w-4 h-4" />
                    Auto-generate Test Checklist
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter className="bg-gray-50/50 border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-gray-600">
                {selectedTemplate && (
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-700">
                      Estimated duration: {selectedTemplate.duration} minutes
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)} 
                  className="h-10 px-6 border-2 border-gray-200 hover:border-gray-300 transition-colors duration-200"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateTestWorkOrder}
                  className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors duration-200"
                >
                  Create Test Work Order
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Upload Test Results
            </DialogTitle>
            <DialogDescription>
              Upload CSV file containing test measurement data for automated analysis
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-600 mb-2">
                Drag & drop your CSV file here or click to browse
              </p>
              <p className="text-xs text-gray-400">
                Supports CSV files from PV checkers, multimeters, and data loggers
              </p>
              <Button variant="outline" className="mt-3">
                Choose File
              </Button>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-blue-900 mb-1">
                    Expected CSV Format
                  </div>
                  <p className="text-xs text-blue-700">
                    Headers: Timestamp, Parameter, Value, Unit, Status
                    <br />
                    Example: 2024-01-15 14:30:00, Voc, 785.2, V, Normal
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => selectedWorkOrder && handleUploadResults(selectedWorkOrder.id)}>
              Upload & Analyze
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Results Detail Dialog */}
      <Dialog open={isResultsDialogOpen} onOpenChange={setIsResultsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Test Results Analysis - {selectedWorkOrder?.templateName}
            </DialogTitle>
            <DialogDescription>
              Comprehensive test results with AI-powered analysis and recommendations
            </DialogDescription>
          </DialogHeader>

          {selectedWorkOrder?.testResults && (
            <div className="space-y-6">
              {/* Results Summary */}
              <Card className={`${
                selectedWorkOrder.testResults.passFailStatus === "pass" ? "bg-green-50 border-green-200" :
                selectedWorkOrder.testResults.passFailStatus === "fail" ? "bg-red-50 border-red-200" :
                "bg-yellow-50 border-yellow-200"
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {selectedWorkOrder.testResults.passFailStatus === "pass" ? (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      ) : selectedWorkOrder.testResults.passFailStatus === "fail" ? (
                        <XCircle className="w-8 h-8 text-red-600" />
                      ) : (
                        <AlertTriangle className="w-8 h-8 text-yellow-600" />
                      )}
                      <div>
                        <div className="text-lg font-semibold">
                          Test {selectedWorkOrder.testResults.passFailStatus.toUpperCase()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {selectedWorkOrder.siteName} • {new Date(selectedWorkOrder.testResults.uploadDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {selectedWorkOrder.testResults.compliance}%
                      </div>
                      <div className="text-sm text-muted-foreground">Compliance</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Insights */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Bot className="w-5 h-5 text-blue-600" />
                    AI Analysis & Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Analysis Summary</span>
                      <Badge variant="outline">
                        {selectedWorkOrder.testResults.aiInsights.confidence}% Confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-blue-700">
                      {selectedWorkOrder.testResults.aiInsights.summary}
                    </p>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">AI Recommendations:</div>
                    <div className="space-y-1">
                      {selectedWorkOrder.testResults.aiInsights.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedWorkOrder.testResults.aiInsights.followUpRequired && (
                    <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">
                          Follow-up Action Required
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Anomalies Details */}
              {selectedWorkOrder.testResults.anomalies.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Detected Anomalies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedWorkOrder.testResults.anomalies.map((anomaly, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className={`w-4 h-4 ${
                                anomaly.severity === "critical" ? "text-red-600" :
                                anomaly.severity === "high" ? "text-orange-600" :
                                anomaly.severity === "medium" ? "text-yellow-600" : "text-gray-600"
                              }`} />
                              <span className="font-medium">{anomaly.parameter}</span>
                            </div>
                            <Badge 
                              variant={
                                anomaly.severity === "critical" ? "destructive" :
                                anomaly.severity === "high" ? "warning" : "secondary"
                              }
                              className="capitalize"
                            >
                              {anomaly.severity}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Expected:</span>
                              <div className="font-medium">{anomaly.expected}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Actual:</span>
                              <div className="font-medium">{anomaly.actual}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Deviation:</span>
                              <div className="font-medium">{anomaly.deviation.toFixed(1)}%</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* File Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Upload Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">File Name:</span>
                      <div className="font-medium">{selectedWorkOrder.testResults.fileName}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">File Size:</span>
                      <div className="font-medium">{selectedWorkOrder.testResults.fileSize}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Upload Date:</span>
                      <div className="font-medium">
                        {new Date(selectedWorkOrder.testResults.uploadDate).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Follow-up Work Orders */}
              {selectedWorkOrder.followUpWorkOrders && selectedWorkOrder.followUpWorkOrders.length > 0 && (
                <Card className="bg-orange-50 border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="w-5 h-5 text-orange-600" />
                      Generated Follow-up Work Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedWorkOrder.followUpWorkOrders.map((woId, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                          <span className="font-medium">{woId}</span>
                          <Button size="sm" variant="outline">
                            View Work Order
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResultsDialogOpen(false)}>
              Close
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
            {selectedWorkOrder?.testResults?.aiInsights.followUpRequired && (
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Remediation Work Order
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
