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
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Download,
  Search,
  FileText,
  MapPin,
  Clock,
  Truck,
} from "lucide-react";

interface StockItem {
  id: string;
  name: string;
  category:
    | "Inverters"
    | "Panels"
    | "Trackers"
    | "Cables"
    | "Electronics"
    | "Tools";
  warehouse: string;
  quantityAvailable: number;
  reorderThreshold: number;
  status: "normal" | "low" | "critical";
  lastRestocked: string;
  unitCost: number;
  totalValue: number;
  supplier: string;
}

interface StockMovement {
  month: string;
  inverters: number;
  panels: number;
  trackers: number;
  cables: number;
  electronics: number;
}

interface IncomingDelivery {
  id: string;
  supplierName: string;
  items: string;
  quantity: number;
  eta: string;
  status: "shipped" | "in-transit" | "delayed" | "delivered";
  value: number;
}


// Mock data generators
const generateStockItems = (): StockItem[] => [
  {
    id: "INV-001",
    name: "Huawei SUN2000-100KTL-M1",
    category: "Inverters",
    warehouse: "Plant 1",
    quantityAvailable: 8,
    reorderThreshold: 10,
    status: "low",
    lastRestocked: "2024-01-10",
    unitCost: 15000,
    totalValue: 120000,
    supplier: "Huawei Technologies",
  },
  {
    id: "PNL-002",
    name: "Longi Solar 540W Mono PERC",
    category: "Panels",
    warehouse: "Plant 1",
    quantityAvailable: 450,
    reorderThreshold: 200,
    status: "normal",
    lastRestocked: "2024-01-08",
    unitCost: 120,
    totalValue: 54000,
    supplier: "Longi Solar",
  },
  {
    id: "TRK-003",
    name: "Nextracker NX Horizon",
    category: "Trackers",
    warehouse: "Plant 2",
    quantityAvailable: 3,
    reorderThreshold: 5,
    status: "critical",
    lastRestocked: "2023-12-15",
    unitCost: 25000,
    totalValue: 75000,
    supplier: "Nextracker Inc",
  },
  {
    id: "CBL-004",
    name: "DC Solar Cable 4mm²",
    category: "Cables",
    warehouse: "Plant 1",
    quantityAvailable: 2800,
    reorderThreshold: 1000,
    status: "normal",
    lastRestocked: "2024-01-12",
    unitCost: 8,
    totalValue: 22400,
    supplier: "Polycab India",
  },
  {
    id: "ELC-005",
    name: "String Combiner Box 16-Input",
    category: "Electronics",
    warehouse: "Plant 2",
    quantityAvailable: 25,
    reorderThreshold: 30,
    status: "low",
    lastRestocked: "2024-01-05",
    unitCost: 800,
    totalValue: 20000,
    supplier: "Schneider Electric",
  },
  {
    id: "TOL-006",
    name: "MC4 Connector Crimping Tool",
    category: "Tools",
    warehouse: "Plant 1",
    quantityAvailable: 12,
    reorderThreshold: 8,
    status: "normal",
    lastRestocked: "2023-12-20",
    unitCost: 150,
    totalValue: 1800,
    supplier: "Staubli International",
  },
  {
    id: "INV-007",
    name: "SMA Sunny Central 2750-EV",
    category: "Inverters",
    warehouse: "Plant 2",
    quantityAvailable: 2,
    reorderThreshold: 5,
    status: "critical",
    lastRestocked: "2023-11-28",
    unitCost: 85000,
    totalValue: 170000,
    supplier: "SMA Solar Technology",
  },
  {
    id: "PNL-008",
    name: "Trina Solar 545W Vertex",
    category: "Panels",
    warehouse: "Plant 1",
    quantityAvailable: 680,
    reorderThreshold: 300,
    status: "normal",
    lastRestocked: "2024-01-14",
    unitCost: 125,
    totalValue: 85000,
    supplier: "Trina Solar",
  },
];

const generateStockMovement = (): StockMovement[] => [
  {
    month: "Jan",
    inverters: 15,
    panels: 1200,
    trackers: 8,
    cables: 5000,
    electronics: 45,
  },
  {
    month: "Feb",
    inverters: 12,
    panels: 980,
    trackers: 6,
    cables: 4200,
    electronics: 38,
  },
  {
    month: "Mar",
    inverters: 18,
    panels: 1450,
    trackers: 12,
    cables: 6800,
    electronics: 52,
  },
  {
    month: "Apr",
    inverters: 10,
    panels: 890,
    trackers: 4,
    cables: 3600,
    electronics: 28,
  },
  {
    month: "May",
    inverters: 14,
    panels: 1180,
    trackers: 9,
    cables: 5200,
    electronics: 41,
  },
  {
    month: "Jun",
    inverters: 16,
    panels: 1320,
    trackers: 7,
    cables: 4800,
    electronics: 35,
  },
];

const generateIncomingDeliveries = (): IncomingDelivery[] => [
  {
    id: "DEL-001",
    supplierName: "Huawei Technologies",
    items: "SUN2000-100KTL-M1 Inverters",
    quantity: 15,
    eta: "2024-01-20",
    status: "shipped",
    value: 225000,
  },
  {
    id: "DEL-002",
    supplierName: "Nextracker Inc",
    items: "NX Horizon Trackers",
    quantity: 10,
    eta: "2024-01-25",
    status: "in-transit",
    value: 250000,
  },
  {
    id: "DEL-003",
    supplierName: "Schneider Electric",
    items: "String Combiner Boxes",
    quantity: 50,
    eta: "2024-01-18",
    status: "delayed",
    value: 40000,
  },
  {
    id: "DEL-004",
    supplierName: "Polycab India",
    items: "DC Solar Cables",
    quantity: 3000,
    eta: "2024-01-22",
    status: "shipped",
    value: 24000,
  },
];

const generateInventoryValue = () => [
  { month: "Jan", value: 2850000 },
  { month: "Feb", value: 2920000 },
  { month: "Mar", value: 3180000 },
  { month: "Apr", value: 2980000 },
  { month: "May", value: 3240000 },
  { month: "Jun", value: 3420000 },
];

const COLORS = [
  "#F5C842",
  "#10B981",
  "#3B82F6",
  "#EF4444",
  "#8B5CF6",
  "#F59E0B",
];

export default function Stock() {
  const alert = useAlert();
  const handleReorderReport = () => {
    alert.featureUnderConstruction('Reorder report');
  };
  
  const handleExportCSV = () => {
    alert.featureUnderConstruction('CSV export');
  };
  const [stockItems] = useState(generateStockItems());
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const stockMovement = generateStockMovement();
  const incomingDeliveries = generateIncomingDeliveries();
  const inventoryValue = generateInventoryValue();

  // Calculate inventory KPIs
  const totalInventoryValue = stockItems.reduce(
    (sum, item) => sum + item.totalValue,
    0,
  );
  const totalItems = stockItems.reduce(
    (sum, item) => sum + item.quantityAvailable,
    0,
  );
  const itemsBelowThreshold = stockItems.filter(
    (item) => item.quantityAvailable <= item.reorderThreshold,
  ).length;
  const warehouseCount = Array.from(
    new Set(stockItems.map((item) => item.warehouse)),
  ).length;

  // Filter items
  const filteredItems = useMemo(() => {
    return stockItems.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;
      const matchesWarehouse =
        warehouseFilter === "all" || item.warehouse === warehouseFilter;
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return (
        matchesSearch && matchesCategory && matchesWarehouse && matchesStatus
      );
    });
  }, [stockItems, searchQuery, categoryFilter, warehouseFilter, statusFilter]);

  const getStatusColor = (status: StockItem["status"]) => {
    switch (status) {
      case "normal":
        return "success";
      case "low":
        return "warning";
      case "critical":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getDeliveryStatusColor = (status: IncomingDelivery["status"]) => {
    switch (status) {
      case "delivered":
        return "success";
      case "shipped":
      case "in-transit":
        return "info";
      case "delayed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const categories = Array.from(
    new Set(stockItems.map((item) => item.category)),
  );
  const warehousesList = Array.from(
    new Set(stockItems.map((item) => item.warehouse)),
  );

  // Generate category distribution for pie chart
  const categoryDistribution = categories.map((category) => ({
    name: category,
    value: stockItems.filter((item) => item.category === category).length,
    totalValue: stockItems
      .filter((item) => item.category === category)
      .reduce((sum, item) => sum + item.totalValue, 0),
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Stock Management
          </h1>
          <p className="text-muted-foreground">
            Track inventory across all sites and warehouses
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => handleReorderReport()}>
            <FileText className="w-4 h-4" />
            Reorder Report
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExportCSV()}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Inventory Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success mb-2">
                {(totalInventoryValue / 1000000).toFixed(2)}M AED
              </div>
              <div className="text-sm text-muted-foreground">
                Total Inventory Value
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-2">
                {totalItems.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Items in Stock
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive mb-2">
                {itemsBelowThreshold}
              </div>
              <div className="text-sm text-muted-foreground">
                Items Below Threshold
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-info mb-2">
                {warehouseCount}
              </div>
              <div className="text-sm text-muted-foreground">
                Warehouse Locations
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Movement Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Consumption Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={stockMovement}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="inverters"
                  stroke="#F5C842"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="panels"
                  stroke="#10B981"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="trackers"
                  stroke="#3B82F6"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="cables"
                  stroke="#EF4444"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="electronics"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Distribution by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={false}
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} items`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {categoryDistribution.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs font-medium">{entry.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({entry.value} items)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Value Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Inventory Value</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={inventoryValue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value) => [
                  `$${Number(value).toLocaleString()}`,
                  "Inventory Value",
                ]}
              />
              <Bar dataKey="value" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Reorder Status Tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Items Requiring Reorder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stockItems
              .filter((item) => item.quantityAvailable <= item.reorderThreshold)
              .map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.warehouse} • {item.category}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-destructive">
                        {item.quantityAvailable}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Available
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        {item.reorderThreshold}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Threshold
                      </div>
                    </div>
                    <Badge variant={getStatusColor(item.status) as any}>
                      {item.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Incoming Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            Incoming Stock Deliveries
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-sm">
                    Supplier
                  </th>
                  <th className="text-left p-4 font-medium text-sm">Items</th>
                  <th className="text-left p-4 font-medium text-sm">
                    Quantity
                  </th>
                  <th className="text-left p-4 font-medium text-sm">ETA</th>
                  <th className="text-left p-4 font-medium text-sm">Value</th>
                  <th className="text-left p-4 font-medium text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {incomingDeliveries.map((delivery) => (
                  <tr key={delivery.id} className="border-t hover:bg-muted/30">
                    <td className="p-4 font-medium">{delivery.supplierName}</td>
                    <td className="p-4">{delivery.items}</td>
                    <td className="p-4 font-medium">{delivery.quantity}</td>
                    <td className="p-4">
                      {new Date(delivery.eta).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-medium text-success">
                      {delivery.value.toLocaleString()} AED
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={getDeliveryStatusColor(delivery.status) as any}
                      >
                        {delivery.status.replace("-", " ").toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Main Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Inventory Management</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
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
              <Select
                value={warehouseFilter}
                onValueChange={setWarehouseFilter}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Warehouses</SelectItem>
                  {warehousesList.map((warehouse) => (
                    <SelectItem key={warehouse} value={warehouse}>
                      {warehouse}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
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
                    Item Name
                  </th>
                  <th className="text-left p-4 font-medium text-sm">
                    Category
                  </th>
                  <th className="text-left p-4 font-medium text-sm">
                    Warehouse
                  </th>
                  <th className="text-left p-4 font-medium text-sm">
                    Available
                  </th>
                  <th className="text-left p-4 font-medium text-sm">
                    Threshold
                  </th>
                  <th className="text-left p-4 font-medium text-sm">Status</th>
                  <th className="text-left p-4 font-medium text-sm">
                    Last Restocked
                  </th>
                  <th className="text-left p-4 font-medium text-sm">
                    Unit Cost
                  </th>
                  <th className="text-left p-4 font-medium text-sm">
                    Total Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-muted/30">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {item.id}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{item.category}</td>
                    <td className="p-4 text-sm">{item.warehouse}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {item.quantityAvailable}
                        </span>
                        <div className="w-16">
                          <Progress
                            value={
                              (item.quantityAvailable /
                                (item.reorderThreshold * 2)) *
                              100
                            }
                            className="h-2"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium">{item.reorderThreshold}</td>
                    <td className="p-4">
                      <Badge variant={getStatusColor(item.status) as any}>
                        {item.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm">
                      {new Date(item.lastRestocked).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-medium">
                      {item.unitCost.toLocaleString()} AED
                    </td>
                    <td className="p-4 font-medium text-success">
                      {item.totalValue.toLocaleString()} AED
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
