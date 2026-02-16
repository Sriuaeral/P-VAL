import { useState, useMemo } from "react";
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
  BarChart,
  Bar,
  LineChart,
  Line,
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
  Truck,
  Building,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  Download,
  Search,
  Star,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

interface Vendor {
  id: string;
  name: string;
  category: "Components" | "Services" | "Logistics";
  country: string;
  contactEmail: string;
  contactPhone: string;
  activeContracts: number;
  rating: number;
  totalValue: number;
  onTimeDelivery: number;
  qualityScore: number;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  items: string;
  quantity: number;
  poValue: number;
  deliveryETA: string;
  status: "pending" | "shipped" | "delivered" | "delayed" | "cancelled";
  orderDate: string;
  deliveryProgress: number;
}

interface DeliveryTimeline {
  date: string;
  supplier: string;
  items: string;
  status: "on-track" | "delayed" | "delivered";
  value: number;
}


// Mock data generators
const generateVendors = (): Vendor[] => [
  {
    id: "VEN-001",
    name: "Huawei Technologies",
    category: "Components",
    country: "China",
    contactEmail: "solar@huawei.com",
    contactPhone: "+86-755-28780808",
    activeContracts: 3,
    rating: 4.8,
    totalValue: 2450000,
    onTimeDelivery: 95.2,
    qualityScore: 96.8,
  },
  {
    id: "VEN-002",
    name: "SMA Solar Technology",
    category: "Components",
    country: "Germany",
    contactEmail: "sales@sma.de",
    contactPhone: "+49-561-9522-0",
    activeContracts: 2,
    rating: 4.7,
    totalValue: 1850000,
    onTimeDelivery: 98.1,
    qualityScore: 98.2,
  },
  {
    id: "VEN-003",
    name: "Nextracker Inc",
    category: "Components",
    country: "USA",
    contactEmail: "info@nextracker.com",
    contactPhone: "+1-510-270-2500",
    activeContracts: 1,
    rating: 4.6,
    totalValue: 1200000,
    onTimeDelivery: 92.5,
    qualityScore: 94.1,
  },
  {
    id: "VEN-004",
    name: "Green Logistics Solutions",
    category: "Logistics",
    country: "India",
    contactEmail: "operations@greenlogistics.in",
    contactPhone: "+91-11-4567-8900",
    activeContracts: 5,
    rating: 4.3,
    totalValue: 650000,
    onTimeDelivery: 89.3,
    qualityScore: 91.5,
  },
  {
    id: "VEN-005",
    name: "Solar Maintenance Pro",
    category: "Services",
    country: "India",
    contactEmail: "service@solarmaintenance.in",
    contactPhone: "+91-22-9876-5432",
    activeContracts: 4,
    rating: 4.5,
    totalValue: 890000,
    onTimeDelivery: 94.7,
    qualityScore: 93.8,
  },
  {
    id: "VEN-006",
    name: "Schneider Electric",
    category: "Components",
    country: "France",
    contactEmail: "solar@schneider-electric.com",
    contactPhone: "+33-1-41-29-70-00",
    activeContracts: 2,
    rating: 4.9,
    totalValue: 1650000,
    onTimeDelivery: 97.8,
    qualityScore: 97.5,
  },
];

const generatePurchaseOrders = (): PurchaseOrder[] => [
  {
    id: "PO-001",
    poNumber: "PO-2024-001",
    supplier: "Huawei Technologies",
    items: "SUN2000-100KTL-M1 Inverters",
    quantity: 15,
    poValue: 225000,
    deliveryETA: "2024-01-25",
    status: "shipped",
    orderDate: "2024-01-10",
    deliveryProgress: 75,
  },
  {
    id: "PO-002",
    poNumber: "PO-2024-002",
    supplier: "Nextracker Inc",
    items: "NX Horizon Tracking Systems",
    quantity: 10,
    poValue: 250000,
    deliveryETA: "2024-02-15",
    status: "pending",
    orderDate: "2024-01-12",
    deliveryProgress: 25,
  },
  {
    id: "PO-003",
    poNumber: "PO-2024-003",
    supplier: "Schneider Electric",
    items: "String Combiner Boxes",
    quantity: 50,
    poValue: 40000,
    deliveryETA: "2024-01-20",
    status: "delayed",
    orderDate: "2024-01-08",
    deliveryProgress: 60,
  },
  {
    id: "PO-004",
    poNumber: "PO-2024-004",
    supplier: "SMA Solar Technology",
    items: "Central Inverters",
    quantity: 3,
    poValue: 255000,
    deliveryETA: "2024-02-05",
    status: "pending",
    orderDate: "2024-01-15",
    deliveryProgress: 15,
  },
  {
    id: "PO-005",
    poNumber: "PO-2024-005",
    supplier: "Green Logistics Solutions",
    items: "Transportation Services",
    quantity: 1,
    poValue: 25000,
    deliveryETA: "2024-01-22",
    status: "delivered",
    orderDate: "2024-01-14",
    deliveryProgress: 100,
  },
];

const generateDeliveryTimeline = (): DeliveryTimeline[] => [
  {
    date: "2024-01-18",
    supplier: "Schneider Electric",
    items: "String Combiner Boxes",
    status: "delayed",
    value: 40000,
  },
  {
    date: "2024-01-20",
    supplier: "Green Logistics Solutions",
    items: "Transportation Services",
    status: "delivered",
    value: 25000,
  },
  {
    date: "2024-01-25",
    supplier: "Huawei Technologies",
    items: "Inverters",
    status: "on-track",
    value: 225000,
  },
  {
    date: "2024-02-05",
    supplier: "SMA Solar Technology",
    items: "Central Inverters",
    status: "on-track",
    value: 255000,
  },
  {
    date: "2024-02-15",
    supplier: "Nextracker Inc",
    items: "Tracking Systems",
    status: "on-track",
    value: 250000,
  },
];

const generateSupplierPerformance = () =>
  generateVendors().map((vendor) => ({
    name: vendor.name.split(" ")[0],
    onTime: vendor.onTimeDelivery,
    quality: vendor.qualityScore,
    value: vendor.totalValue / 1000,
  }));

const COLORS = [
  "#F5C842",
  "#10B981",
  "#3B82F6",
  "#EF4444",
  "#8B5CF6",
  "#F59E0B",
];

export default function SupplyChain() {
  const alert = useAlert();
  const [vendors] = useState(generateVendors());
  const [purchaseOrders] = useState(generatePurchaseOrders());
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const deliveryTimeline = generateDeliveryTimeline();
  const supplierPerformance = generateSupplierPerformance();
  const handleVendorReport = () => {
    alert.featureUnderConstruction('Vendor report');
  };
  
  const handleExportData = () => {
    alert.featureUnderConstruction('Data export');
  };
  // Calculate KPIs
  const totalActivePOs = purchaseOrders.length;
  const pendingDeliveries = purchaseOrders.filter(
    (po) => po.status === "pending" || po.status === "shipped",
  ).length;
  const totalProcurementValue = purchaseOrders.reduce(
    (sum, po) => sum + po.poValue,
    0,
  );
  const delayedDeliveries = purchaseOrders.filter(
    (po) => po.status === "delayed",
  ).length;

  // Filter vendors
  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const matchesSearch = vendor.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || vendor.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [vendors, searchQuery, categoryFilter]);

  // Filter POs
  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const matchesStatus =
        statusFilter === "all" || po.status === statusFilter;
      return matchesStatus;
    });
  }, [purchaseOrders, statusFilter]);

  const getStatusColor = (status: PurchaseOrder["status"]) => {
    switch (status) {
      case "delivered":
        return "success";
      case "shipped":
        return "info";
      case "pending":
        return "secondary";
      case "delayed":
        return "destructive";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getDeliveryStatusColor = (status: DeliveryTimeline["status"]) => {
    switch (status) {
      case "delivered":
        return "success";
      case "on-track":
        return "info";
      case "delayed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const categories = Array.from(new Set(vendors.map((v) => v.category)));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Supply Chain Management
          </h1>
          <p className="text-muted-foreground">
            Manage vendors, procurement, and delivery tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => handleVendorReport()}>
            <FileText className="w-4 h-4" />
            Vendor Report
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExportData()}>
            <Download className="w-4 h-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Active POs</div>
                <div className="text-2xl font-bold">{totalActivePOs}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-info" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Pending Deliveries
                </div>
                <div className="text-2xl font-bold">{pendingDeliveries}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-success" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Procurement Value
                </div>
                <div className="text-2xl font-bold">
                  {(totalProcurementValue / 1000000).toFixed(2)}M AED
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
                  Delayed Deliveries
                </div>
                <div className="text-2xl font-bold text-destructive">
                  {delayedDeliveries}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supplier Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Supplier Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={supplierPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="onTime" fill="#10B981" name="On-Time %" />
                <Bar dataKey="quality" fill="#F5C842" name="Quality Score" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vendor Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor Distribution by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={categories.map((cat) => ({
                      name: cat,
                      value: vendors.filter((v) => v.category === cat).length,
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={false}
                  >
                    {categories.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {categories.map((cat, index) => {
                  const value = vendors.filter(
                    (v) => v.category === cat,
                  ).length;
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span className="text-xs font-medium">{cat}</span>
                      <span className="text-xs text-muted-foreground">
                        ({value})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Delivery Timeline Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {deliveryTimeline.map((delivery, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium">{delivery.supplier}</div>
                  <div className="text-sm text-muted-foreground">
                    {delivery.items}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    {new Date(delivery.date).toLocaleDateString()}
                  </div>
                  <div className="font-medium">
                    {delivery.value.toLocaleString()} AED
                  </div>
                  <Badge
                    variant={getDeliveryStatusColor(delivery.status) as any}
                  >
                    {delivery.status.replace("-", " ").toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vendors Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Vendor Management</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
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
                  <th className="text-left p-4 font-medium text-sm">Vendor</th>
                  <th className="text-left p-4 font-medium text-sm">
                    Category
                  </th>
                  <th className="text-left p-4 font-medium text-sm">Country</th>
                  <th className="text-left p-4 font-medium text-sm">Contact</th>
                  <th className="text-left p-4 font-medium text-sm">
                    Contracts
                  </th>
                  <th className="text-left p-4 font-medium text-sm">Rating</th>
                  <th className="text-left p-4 font-medium text-sm">
                    Total Value
                  </th>
                  <th className="text-left p-4 font-medium text-sm">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="border-t hover:bg-muted/30">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{vendor.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {vendor.id}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary">{vendor.category}</Badge>
                    </td>
                    <td className="p-4 text-sm">{vendor.country}</td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-3 h-3" />
                          {vendor.contactEmail}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3 h-3" />
                          {vendor.contactPhone}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium">
                      {vendor.activeContracts}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(vendor.rating)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">
                          {vendor.rating}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-success">
                      {vendor.totalValue.toLocaleString()} AED
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">
                          On-time: {vendor.onTimeDelivery}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Quality: {vendor.qualityScore}%
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Purchase Orders</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-sm">PO #</th>
                  <th className="text-left p-4 font-medium text-sm">
                    Supplier
                  </th>
                  <th className="text-left p-4 font-medium text-sm">Items</th>
                  <th className="text-left p-4 font-medium text-sm">
                    Quantity
                  </th>
                  <th className="text-left p-4 font-medium text-sm">Value</th>
                  <th className="text-left p-4 font-medium text-sm">ETA</th>
                  <th className="text-left p-4 font-medium text-sm">Status</th>
                  <th className="text-left p-4 font-medium text-sm">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPOs.map((po) => (
                  <tr key={po.id} className="border-t hover:bg-muted/30">
                    <td className="p-4 font-mono font-medium">{po.poNumber}</td>
                    <td className="p-4 font-medium">{po.supplier}</td>
                    <td className="p-4 text-sm">{po.items}</td>
                    <td className="p-4 font-medium">{po.quantity}</td>
                    <td className="p-4 font-medium text-success">
                      {po.poValue.toLocaleString()} AED
                    </td>
                    <td className="p-4 text-sm">
                      {new Date(po.deliveryETA).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <Badge variant={getStatusColor(po.status) as any}>
                        {po.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16">
                          <Progress
                            value={po.deliveryProgress}
                            className="h-2"
                          />
                        </div>
                        <span className="text-sm">{po.deliveryProgress}%</span>
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
  );
}
