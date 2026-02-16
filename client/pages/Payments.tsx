import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
} from "recharts";
import {
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Download,
  Search,
  FileText,
  CreditCard,
  TrendingUp,
} from "lucide-react";

interface ClientPayment {
  id: string;
  clientName: string;
  siteNames: string[];
  paymentStatus: "received" | "pending" | "overdue" | "scheduled";
  amount: number;
  dueDate: string;
  invoiceNumber: string;
  paymentMethod: "bank-transfer" | "check" | "wire" | "ach";
  receivedDate?: string;
  daysPastDue?: number;
}

interface PaymentCalendar {
  date: string;
  clientName: string;
  amount: number;
  type: "payment" | "milestone" | "penalty";
}

interface MonthlyRevenue {
  month: string;
  received: number;
  pending: number;
  target: number;
}

interface AgingBracket {
  bracket: string;
  amount: number;
  count: number;
}



// Mock data generators
const generateClientPayments = (): ClientPayment[] => [
  {
    id: "PAY-001",
    clientName: "Green Energy Corp",
    siteNames: ["Rajasthan Solar Park A", "Gujarat Solar Farm B"],
    paymentStatus: "received",
    amount: 285000,
    dueDate: "2024-01-15",
    invoiceNumber: "INV-2024-001",
    paymentMethod: "bank-transfer",
    receivedDate: "2024-01-14",
  },
  {
    id: "PAY-002",
    clientName: "Sustainable Power Ltd",
    siteNames: ["Tamil Nadu Solar Unit C"],
    paymentStatus: "pending",
    amount: 125000,
    dueDate: "2024-01-20",
    invoiceNumber: "INV-2024-002",
    paymentMethod: "wire",
  },
  {
    id: "PAY-003",
    clientName: "Solar Ventures Inc",
    siteNames: ["Karnataka Solar Plant D"],
    paymentStatus: "overdue",
    amount: 175000,
    dueDate: "2024-01-10",
    invoiceNumber: "INV-2024-003",
    paymentMethod: "check",
    daysPastDue: 5,
  },
  {
    id: "PAY-004",
    clientName: "Renewable Energy Solutions",
    siteNames: ["Maharashtra Solar Hub F"],
    paymentStatus: "scheduled",
    amount: 195000,
    dueDate: "2024-01-25",
    invoiceNumber: "INV-2024-004",
    paymentMethod: "ach",
  },
  {
    id: "PAY-005",
    clientName: "Clean Power Alliance",
    siteNames: ["Andhra Pradesh Solar Farm E"],
    paymentStatus: "overdue",
    amount: 85000,
    dueDate: "2024-01-05",
    invoiceNumber: "INV-2024-005",
    paymentMethod: "bank-transfer",
    daysPastDue: 10,
  },
  {
    id: "PAY-006",
    clientName: "Eco Energy Partners",
    siteNames: ["Multiple Sites"],
    paymentStatus: "received",
    amount: 420000,
    dueDate: "2024-01-12",
    invoiceNumber: "INV-2024-006",
    paymentMethod: "wire",
    receivedDate: "2024-01-11",
  },
  {
    id: "PAY-007",
    clientName: "Future Solar Group",
    siteNames: ["Karnataka Solar Plant D", "Tamil Nadu Solar Unit C"],
    paymentStatus: "pending",
    amount: 310000,
    dueDate: "2024-01-22",
    invoiceNumber: "INV-2024-007",
    paymentMethod: "bank-transfer",
  },
];

const generatePaymentCalendar = (): PaymentCalendar[] => [
  {
    date: "2024-01-18",
    clientName: "Green Energy Corp",
    amount: 150000,
    type: "payment",
  },
  {
    date: "2024-01-20",
    clientName: "Sustainable Power Ltd",
    amount: 125000,
    type: "payment",
  },
  {
    date: "2024-01-22",
    clientName: "Future Solar Group",
    amount: 310000,
    type: "payment",
  },
  {
    date: "2024-01-25",
    clientName: "Renewable Energy Solutions",
    amount: 195000,
    type: "milestone",
  },
  {
    date: "2024-01-28",
    clientName: "Solar Ventures Inc",
    amount: 8750,
    type: "penalty",
  },
];

const generateMonthlyRevenue = (): MonthlyRevenue[] => [
  { month: "Jan", received: 1250000, pending: 465000, target: 1800000 },
  { month: "Feb", received: 1480000, pending: 320000, target: 1850000 },
  { month: "Mar", received: 1620000, pending: 280000, target: 1900000 },
  { month: "Apr", received: 1580000, pending: 390000, target: 1950000 },
  { month: "May", received: 1720000, pending: 180000, target: 2000000 },
  { month: "Jun", received: 1650000, pending: 525000, target: 2100000 },
];

const generateAgingReport = (): AgingBracket[] => [
  { bracket: "0-30 days", amount: 465000, count: 3 },
  { bracket: "31-60 days", amount: 260000, count: 2 },
  { bracket: "61-90 days", amount: 125000, count: 1 },
  { bracket: "90+ days", amount: 85000, count: 1 },
];

export default function Payments() {
  const alert = useAlert();
  const [payments] = useState(generateClientPayments());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");

  const paymentCalendar = generatePaymentCalendar();
  const monthlyRevenue = generateMonthlyRevenue();
  const agingReport = generateAgingReport();
  const handleFinancialReport = () => {
    alert.featureUnderConstruction('Financial report');
  };
  
  const handleExportCSV = () => {
    alert.featureUnderConstruction('CSV export');
  };

  // Calculate payment KPIs
  const totalReceived = payments
    .filter((p) => p.paymentStatus === "received")
    .reduce((sum, p) => sum + p.amount, 0);
  const outstandingPayments = payments
    .filter((p) => p.paymentStatus !== "received")
    .reduce((sum, p) => sum + p.amount, 0);
  const overdueCount = payments.filter(
    (p) => p.paymentStatus === "overdue",
  ).length;
  const scheduledPayments = payments
    .filter((p) => p.paymentStatus === "scheduled")
    .reduce((sum, p) => sum + p.amount, 0);

  // Filter payments
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch =
        payment.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || payment.paymentStatus === statusFilter;
      const matchesClient =
        clientFilter === "all" || payment.clientName === clientFilter;

      return matchesSearch && matchesStatus && matchesClient;
    });
  }, [payments, searchQuery, statusFilter, clientFilter]);

  const getStatusColor = (status: ClientPayment["paymentStatus"]) => {
    switch (status) {
      case "received":
        return "success";
      case "pending":
        return "info";
      case "scheduled":
        return "secondary";
      case "overdue":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: ClientPayment["paymentStatus"]) => {
    switch (status) {
      case "received":
        return CheckCircle;
      case "pending":
        return Clock;
      case "scheduled":
        return Calendar;
      case "overdue":
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  const getPaymentMethodIcon = (method: ClientPayment["paymentMethod"]) => {
    switch (method) {
      case "bank-transfer":
      case "wire":
      case "ach":
        return "🏦";
      case "check":
        return "📄";
      default:
        return "💳";
    }
  };

  const getCalendarTypeColor = (type: PaymentCalendar["type"]) => {
    switch (type) {
      case "payment":
        return "success";
      case "milestone":
        return "info";
      case "penalty":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const clients = Array.from(new Set(payments.map((p) => p.clientName)));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Payments Management
          </h1>
          <p className="text-muted-foreground">
            Track revenue inflows and client payment status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => handleFinancialReport()}>
            <FileText className="w-4 h-4" />
            Financial Report
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExportCSV()}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Payment Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <img src="/assets/UAE_Dirham_Symbol.svg" alt="UAE Dirham" className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Revenue Received
                </div>
                <div className="text-2xl font-bold text-success">
                  {(totalReceived / 1000000).toFixed(2)}M AED
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Outstanding Payments
                </div>
                <div className="text-2xl font-bold text-warning">
                  {(outstandingPayments / 1000000).toFixed(2)}M AED
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
                  Overdue Payments
                </div>
                <div className="text-2xl font-bold text-destructive">
                  {overdueCount}
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
                  Payments Scheduled
                </div>
                <div className="text-2xl font-bold text-info">
                  {(scheduledPayments / 1000000).toFixed(2)}M AED
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `${Number(value).toLocaleString()} AED`,
                    "",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="received"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Received"
                />
                <Line
                  type="monotone"
                  dataKey="pending"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  name="Pending"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#6B7280"
                  strokeDasharray="5 5"
                  name="Target"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Accounts Aging */}
        <Card>
          <CardHeader>
            <CardTitle>Accounts Aging Report</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={agingReport}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bracket" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `$${Number(value).toLocaleString()}`,
                    "Amount",
                  ]}
                />
                <Bar dataKey="amount" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Payment Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Upcoming Payment Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentCalendar.map((event, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={getCalendarTypeColor(event.type) as any}>
                    {event.type.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="font-medium">{event.clientName}</div>
                <div className="text-lg font-bold text-success">
                  {event.amount.toLocaleString()} AED
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Client Payment Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Client Payment Tracking</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client} value={client}>
                      {client}
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
                  <th className="text-left p-4 font-medium text-sm">Client</th>
                  <th className="text-left p-4 font-medium text-sm">Site(s)</th>
                  <th className="text-left p-4 font-medium text-sm">Amount</th>
                  <th className="text-left p-4 font-medium text-sm">
                    Due Date
                  </th>
                  <th className="text-left p-4 font-medium text-sm">
                    Invoice #
                  </th>
                  <th className="text-left p-4 font-medium text-sm">Method</th>
                  <th className="text-left p-4 font-medium text-sm">Status</th>
                  <th className="text-left p-4 font-medium text-sm">
                    Days Past Due
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => {
                  const StatusIcon = getStatusIcon(payment.paymentStatus);
                  return (
                    <tr key={payment.id} className="border-t hover:bg-muted/30">
                      <td className="p-4 font-medium">{payment.clientName}</td>
                      <td className="p-4 text-sm">
                        {payment.siteNames.length > 1
                          ? `${payment.siteNames[0]} +${payment.siteNames.length - 1} more`
                          : payment.siteNames[0]}
                      </td>
                      <td className="p-4 font-bold text-success">
                        {payment.amount.toLocaleString()} AED
                      </td>
                      <td className="p-4 text-sm">
                        {new Date(payment.dueDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm font-mono">
                        {payment.invoiceNumber}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span>
                            {getPaymentMethodIcon(payment.paymentMethod)}
                          </span>
                          <span className="text-sm capitalize">
                            {payment.paymentMethod.replace("-", " ")}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={getStatusColor(payment.paymentStatus) as any}
                          className="gap-1 capitalize"
                        >
                          <StatusIcon className="w-3 h-3" />
                          {payment.paymentStatus}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {payment.daysPastDue ? (
                          <span className="text-destructive font-medium">
                            {payment.daysPastDue} days
                          </span>
                        ) : payment.receivedDate ? (
                          <span className="text-success text-sm">Received</span>
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
    </div>
  );
}
