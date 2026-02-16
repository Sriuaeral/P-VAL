import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Users,
  Building,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Search,
  FileText,
  Eye,
  TrendingUp,
  MapPin,
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  numberOfSites: number;
  totalCapacity: number; // MW
  region: string;
  totalRevenue: number;
  slaCompliance: number; // %
  issuesLogged: number;
  contractStart: string;
  contractEnd: string;
  primaryContact: string;
  email: string;
  phone: string;
}

interface ClientDashboard {
  clientId: string;
  generationVsForecast: Array<{
    month: string;
    actual: number;
    forecast: number;
  }>;
  outstandingPayments: number;
  slaMetrics: {
    uptime: number;
    responseTime: number;
    resolutionTime: number;
  };
  recentIssues: Array<{
    date: string;
    issue: string;
    severity: "critical" | "high" | "medium" | "low";
    status: "open" | "resolved";
  }>;
}

interface BillingHistory {
  clientId: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  dueDate: string;
}



// Mock data generators
const generateClients = (): Client[] => [
  {
    id: "CLI-001",
    name: "Green Energy Corp",
    numberOfSites: 3,
    totalCapacity: 450,
    region: "North India",
    totalRevenue: 2850000,
    slaCompliance: 98.5,
    issuesLogged: 12,
    contractStart: "2022-01-15",
    contractEnd: "2027-01-14",
    primaryContact: "Rajesh Kumar",
    email: "rajesh.kumar@greenenergy.com",
    phone: "+91-11-4567-8901",
  },
  {
    id: "CLI-002",
    name: "Sustainable Power Ltd",
    numberOfSites: 2,
    totalCapacity: 300,
    region: "South India",
    totalRevenue: 1950000,
    slaCompliance: 96.8,
    issuesLogged: 8,
    contractStart: "2022-06-01",
    contractEnd: "2027-05-31",
    primaryContact: "Priya Sharma",
    email: "priya.sharma@sustainablepower.in",
    phone: "+91-44-9876-5432",
  },
  {
    id: "CLI-003",
    name: "Solar Ventures Inc",
    numberOfSites: 1,
    totalCapacity: 175,
    region: "South India",
    totalRevenue: 1125000,
    slaCompliance: 94.2,
    issuesLogged: 15,
    contractStart: "2023-03-10",
    contractEnd: "2028-03-09",
    primaryContact: "Amit Patel",
    email: "amit.patel@solarventures.com",
    phone: "+91-79-1234-5678",
  },
  {
    id: "CLI-004",
    name: "Renewable Energy Solutions",
    numberOfSites: 2,
    totalCapacity: 355,
    region: "West India",
    totalRevenue: 2320000,
    slaCompliance: 97.9,
    issuesLogged: 6,
    contractStart: "2021-09-20",
    contractEnd: "2026-09-19",
    primaryContact: "Kavita Singh",
    email: "kavita.singh@renewablesolutions.in",
    phone: "+91-22-8765-4321",
  },
  {
    id: "CLI-005",
    name: "Clean Power Alliance",
    numberOfSites: 1,
    totalCapacity: 125,
    region: "South India",
    totalRevenue: 650000,
    slaCompliance: 89.5,
    issuesLogged: 22,
    contractStart: "2023-01-01",
    contractEnd: "2028-12-31",
    primaryContact: "Suresh Reddy",
    email: "suresh.reddy@cleanpower.in",
    phone: "+91-40-5555-6666",
  },
];

const generateClientDashboard = (clientId: string): ClientDashboard => ({
  clientId,
  generationVsForecast: [
    { month: "Jan", actual: 285, forecast: 280 },
    { month: "Feb", actual: 320, forecast: 315 },
    { month: "Mar", actual: 365, forecast: 370 },
    { month: "Apr", actual: 390, forecast: 385 },
    { month: "May", actual: 375, forecast: 380 },
    { month: "Jun", actual: 340, forecast: 350 },
  ],
  outstandingPayments: 125000,
  slaMetrics: {
    uptime: 98.5,
    responseTime: 3.2,
    resolutionTime: 18.5,
  },
  recentIssues: [
    {
      date: "2024-01-15",
      issue: "Inverter efficiency below threshold",
      severity: "medium",
      status: "resolved",
    },
    {
      date: "2024-01-12",
      issue: "Grid connection intermittent",
      severity: "high",
      status: "open",
    },
    {
      date: "2024-01-08",
      issue: "Weather station calibration required",
      severity: "low",
      status: "resolved",
    },
  ],
});

const generateBillingHistory = (clientId: string): BillingHistory[] => [
  {
    clientId,
    invoiceNumber: "INV-2024-001",
    date: "2024-01-01",
    amount: 185000,
    status: "paid",
    dueDate: "2024-01-15",
  },
  {
    clientId,
    invoiceNumber: "INV-2023-012",
    date: "2023-12-01",
    amount: 175000,
    status: "paid",
    dueDate: "2023-12-15",
  },
  {
    clientId,
    invoiceNumber: "INV-2024-002",
    date: "2024-01-15",
    amount: 125000,
    status: "pending",
    dueDate: "2024-01-30",
  },
];

const generateRevenueByClient = () =>
  generateClients().map((client) => ({
    name: client.name.split(" ")[0],
    revenue: client.totalRevenue / 1000000,
    capacity: client.totalCapacity,
    sites: client.numberOfSites,
  }));

const generateSLACompliance = () =>
  generateClients().map((client) => ({
    name: client.name.split(" ")[0],
    compliance: client.slaCompliance,
    issues: client.issuesLogged,
  }));

const COLORS = [
  "#F5C842",
  "#10B981",
  "#3B82F6",
  "#EF4444",
  "#8B5CF6",
  "#F59E0B",
];

export default function Clients() {
  const alert = useAlert();
  const [clients] = useState(generateClients());
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");

  const revenueByClient = generateRevenueByClient();
  const slaCompliance = generateSLACompliance();
  const handleClientReport = () => {
    alert.featureUnderConstruction('Client report');
  };
  
  const handleExportData = () => {
    alert.featureUnderConstruction('Data export');
  };
  
  const handleViewClient = (clientId: string) => {
    alert.featureUnderConstruction('Client view');
  };
  // Calculate KPIs
  const totalClients = clients.length;
  const totalRevenue = clients.reduce(
    (sum, client) => sum + client.totalRevenue,
    0,
  );
  const totalGeneration = clients.reduce(
    (sum, client) => sum + client.totalCapacity * 2000,
    0,
  ); // Approx MWh
  const underperformingClients = clients.filter(
    (client) => client.slaCompliance < 95,
  ).length;

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch = client.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesRegion =
        regionFilter === "all" || client.region === regionFilter;
      return matchesSearch && matchesRegion;
    });
  }, [clients, searchQuery, regionFilter]);

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 98) return "success";
    if (compliance >= 95) return "warning";
    return "destructive";
  };

  const regions = Array.from(new Set(clients.map((client) => client.region)));

  const selectedClientData = selectedClient
    ? generateClientDashboard(selectedClient)
    : null;
  const selectedClientBilling = selectedClient
    ? generateBillingHistory(selectedClient)
    : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Client Management
          </h1>
          <p className="text-muted-foreground">
            Centralized hub for managing all clients and their assets
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => handleClientReport()}>
            <FileText className="w-4 h-4" />
            Client Report
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExportData()}>
            <Download className="w-4 h-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Client Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Total Clients
                </div>
                <div className="text-2xl font-bold">{totalClients}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <img src="/assets/UAE_Dirham_Symbol.svg" alt="UAE Dirham" className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Total Revenue
                </div>
                <div className="text-2xl font-bold text-success">
                  {(totalRevenue / 1000000).toFixed(2)}M AED
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
                  Generation Delivered
                </div>
                <div className="text-2xl font-bold text-info">
                  {(totalGeneration / 1000).toFixed(1)} GWh
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
                  Underperforming
                </div>
                <div className="text-2xl font-bold text-destructive">
                  {underperformingClients}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Client */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Client</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={revenueByClient}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}M AED`, "Revenue"]} />
                <Bar dataKey="revenue" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* SLA Compliance */}
        <Card>
          <CardHeader>
            <CardTitle>SLA Compliance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={slaCompliance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[85, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="compliance"
                  stroke="#F5C842"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Client Portfolio Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Client Portfolio Overview</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-sm">
                    Client Name
                  </th>
                  <th className="text-left p-4 font-medium text-sm">Sites</th>
                  <th className="text-left p-4 font-medium text-sm">
                    Capacity (MW)
                  </th>
                  <th className="text-left p-4 font-medium text-sm">Region</th>
                  <th className="text-left p-4 font-medium text-sm">Revenue</th>
                  <th className="text-left p-4 font-medium text-sm">
                    SLA Compliance
                  </th>
                  <th className="text-left p-4 font-medium text-sm">
                    Issues (30d)
                  </th>
                  <th className="text-left p-4 font-medium text-sm">
                    Contract
                  </th>
                  <th className="text-left p-4 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-t hover:bg-muted/30">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {client.primaryContact}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium">{client.numberOfSites}</td>
                    <td className="p-4 font-medium">{client.totalCapacity}</td>
                    <td className="p-4 text-sm">{client.region}</td>
                    <td className="p-4 font-medium text-success">
                      {(client.totalRevenue / 1000000).toFixed(2)}M AED
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            getComplianceColor(client.slaCompliance) as any
                          }
                        >
                          {client.slaCompliance}%
                        </Badge>
                        <div className="w-16">
                          <Progress
                            value={client.slaCompliance}
                            className="h-2"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {client.issuesLogged}
                        </span>
                        {client.issuesLogged > 15 && (
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      <div>
                        <div>
                          Start:{" "}
                          {new Date(client.contractStart).toLocaleDateString()}
                        </div>
                        <div className="text-muted-foreground">
                          End:{" "}
                          {new Date(client.contractEnd).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleViewClient(client.id)}
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Client-Specific Dashboard */}
      {selectedClient && selectedClientData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                Client Dashboard -{" "}
                {clients.find((c) => c.id === selectedClient)?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Generation vs Forecast */}
                <div>
                  <h4 className="font-medium mb-4">Generation vs Forecast</h4>
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={selectedClientData.generationVsForecast}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#10B981"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="forecast"
                        stroke="#6B7280"
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* SLA Metrics */}
                <div>
                  <h4 className="font-medium mb-4">SLA Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Uptime</span>
                      <span className="font-medium">
                        {selectedClientData.slaMetrics.uptime}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Response Time</span>
                      <span className="font-medium">
                        {selectedClientData.slaMetrics.responseTime}h
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Resolution Time</span>
                      <span className="font-medium">
                        {selectedClientData.slaMetrics.resolutionTime}h
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Outstanding Payments</span>
                      <span className="font-medium text-warning">
                
                        {selectedClientData.outstandingPayments.toLocaleString()} AED
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Issues */}
              <div className="mt-6">
                <h4 className="font-medium mb-4">Recent Issues</h4>
                <div className="space-y-2">
                  {selectedClientData.recentIssues.map((issue, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium">{issue.issue}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(issue.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            issue.severity === "critical"
                              ? "destructive"
                              : issue.severity === "high"
                                ? "warning"
                                : ("secondary" as any)
                          }
                        >
                          {issue.severity.toUpperCase()}
                        </Badge>
                        <Badge
                          variant={
                            issue.status === "resolved"
                              ? "success"
                              : ("secondary" as any)
                          }
                        >
                          {issue.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Billing History */}
              <div className="mt-6">
                <h4 className="font-medium mb-4">Billing History</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium text-sm">
                          Invoice
                        </th>
                        <th className="text-left p-3 font-medium text-sm">
                          Date
                        </th>
                        <th className="text-left p-3 font-medium text-sm">
                          Amount
                        </th>
                        <th className="text-left p-3 font-medium text-sm">
                          Due Date
                        </th>
                        <th className="text-left p-3 font-medium text-sm">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedClientBilling.map((bill, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3 font-mono text-sm">
                            {bill.invoiceNumber}
                          </td>
                          <td className="p-3 text-sm">
                            {new Date(bill.date).toLocaleDateString()}
                          </td>
                          <td className="p-3 font-medium">
                            {bill.amount.toLocaleString()} AED
                          </td>
                          <td className="p-3 text-sm">
                            {new Date(bill.dueDate).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <Badge
                              variant={
                                bill.status === "paid"
                                  ? "success"
                                  : bill.status === "pending"
                                    ? "secondary"
                                    : ("destructive" as any)
                              }
                            >
                              {bill.status.toUpperCase()}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
