import { useState, useEffect } from "react";
import { Plant } from "@shared/interface";
import PlantNavigation from '@/components/PlantNavigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAlert } from "@/hooks/use-alert";
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
  Package,
  AlertTriangle,
  TrendingDown,
  Download,
  MapPin,
  Calendar,
  DollarSign,
  RefreshCw,
} from "lucide-react";
// import PlantNavigation from "@/components/PlantNavigation";

interface InventoryItem {
  id: string;
  name: string;
  category: "Inverters" | "Panels" | "Cables" | "Electronics" | "Mechanical";
  stockAvailable: number;
  unitCost: number;
  lastRestocked: string;
  reorderStatus: "normal" | "low" | "critical";
  reorderThreshold: number;
  location: string;
  supplier: string;
}

interface MonthlyConsumption {
  month: string;
  inverters: number;
  panels: number;
  cables: number;
  electronics: number;
  mechanical: number;
  totalCost: number;
}

interface UpcomingDelivery {
  id: string;
  itemName: string;
  quantity: number;
  supplier: string;
  estimatedDate: string;
  status: "confirmed" | "shipped" | "delayed";
}

interface ReorderItem {
  id: string;
  itemName: string;
  currentStock: number;
  threshold: number;
  recommendedOrder: number;
  estimatedCost: number;
  urgency: "low" | "medium" | "high" | "critical";
}

const handleCreateOrder = (itemId: string) => {
  alert.featureUnderConstruction('Order creation');
};

// Mock data generators
const generatePlantInventory = (plantId: string): InventoryItem[] => [
  {
    id: "inv-001",
    name: "Huawei SUN2000-100KTL-M1 Inverter",
    category: "Inverters",
    stockAvailable: 3,
    unitCost: 15000,
    lastRestocked: "2024-01-10T09:00:00Z",
    reorderStatus: "low",
    reorderThreshold: 5,
    location: "Main Warehouse - Rack A1",
    supplier: "Huawei Technologies",
  },
  {
    id: "inv-002",
    name: "Longi Solar 540W Panels",
    category: "Panels",
    stockAvailable: 85,
    unitCost: 120,
    lastRestocked: "2024-01-08T14:30:00Z",
    reorderStatus: "normal",
    reorderThreshold: 50,
    location: "Storage Yard - Section B",
    supplier: "Longi Solar",
  },
  {
    id: "inv-003",
    name: "DC Solar Cable 4mm²",
    category: "Cables",
    stockAvailable: 1200,
    unitCost: 8,
    lastRestocked: "2024-01-12T11:15:00Z",
    reorderStatus: "normal",
    reorderThreshold: 500,
    location: "Cable Storage - Bay 1",
    supplier: "Polycab India",
  },
  {
    id: "inv-004",
    name: "String Combiner Box 16-Input",
    category: "Electronics",
    stockAvailable: 8,
    unitCost: 800,
    lastRestocked: "2024-01-05T16:20:00Z",
    reorderStatus: "critical",
    reorderThreshold: 10,
    location: "Electronics Store - Shelf C2",
    supplier: "Schneider Electric",
  },
  {
    id: "inv-005",
    name: "Tracker Drive Motor",
    category: "Mechanical",
    stockAvailable: 12,
    unitCost: 2500,
    lastRestocked: "2023-12-28T10:45:00Z",
    reorderStatus: "normal",
    reorderThreshold: 8,
    location: "Mechanical Workshop - Area M1",
    supplier: "Nextracker Inc",
  },
  {
    id: "inv-006",
    name: "MC4 Connectors (Pack of 100)",
    category: "Electronics",
    stockAvailable: 25,
    unitCost: 45,
    lastRestocked: "2024-01-11T13:00:00Z",
    reorderStatus: "normal",
    reorderThreshold: 20,
    location: "Small Parts - Bin E5",
    supplier: "Staubli International",
  },
  {
    id: "inv-007",
    name: "Cleaning Brushes for Robots",
    category: "Mechanical",
    stockAvailable: 4,
    unitCost: 180,
    lastRestocked: "2024-01-03T08:30:00Z",
    reorderStatus: "low",
    reorderThreshold: 6,
    location: "Robot Maintenance Bay",
    supplier: "CleanBot Systems",
  },
];

const generateMonthlyConsumption = (): MonthlyConsumption[] => {
  const currentMonthIndex = new Date().getMonth();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const lastSixMonthsData = Array.from({ length: 6 }, (_, i) => {
    const monthIndex = (currentMonthIndex - i + 12) % 12;
    return {
      month: monthNames[monthIndex],
      inverters: Math.floor(Math.random() * 3), // Example random data
      panels: Math.floor(Math.random() * 30),
      cables: Math.floor(Math.random() * 300),
      electronics: Math.floor(Math.random() * 15),
      mechanical: Math.floor(Math.random() * 10),
      totalCost: Math.floor(Math.random() * 50000),
    };
  }).reverse();
  return lastSixMonthsData;
};

const generateUpcomingDeliveries = (): UpcomingDelivery[] => [
  {
    id: "del-001",
    itemName: "Huawei SUN2000-100KTL-M1 Inverter",
    quantity: 5,
    supplier: "Huawei Technologies",
    estimatedDate: "2024-01-20T10:00:00Z",
    status: "shipped",
  },
  {
    id: "del-002",
    itemName: "String Combiner Boxes",
    quantity: 15,
    supplier: "Schneider Electric",
    estimatedDate: "2024-01-22T14:00:00Z",
    status: "confirmed",
  },
  {
    id: "del-003",
    itemName: "Cleaning Robot Brushes",
    quantity: 10,
    supplier: "CleanBot Systems",
    estimatedDate: "2024-01-18T09:00:00Z",
    status: "delayed",
  },
];

const generateReorderItems = (inventory: InventoryItem[]): ReorderItem[] => {
  return inventory
    .filter((item) => item.stockAvailable <= item.reorderThreshold)
    .map((item) => ({
      id: item.id,
      itemName: item.name,
      currentStock: item.stockAvailable,
      threshold: item.reorderThreshold,
      recommendedOrder: Math.max(
        item.reorderThreshold * 2 - item.stockAvailable,
        item.reorderThreshold,
      ),
      estimatedCost:
        item.unitCost *
        Math.max(
          item.reorderThreshold * 2 - item.stockAvailable,
          item.reorderThreshold,
        ),
      urgency:
        item.stockAvailable === 0
          ? "critical"
          : item.stockAvailable < item.reorderThreshold * 0.5
            ? "high"
            : item.stockAvailable < item.reorderThreshold * 0.8
              ? "medium"
              : "low",
    }));
};

export default function PlantInventory() {
  const alert = useAlert();
  const [plant, setPlant] = useState<Plant | null>(JSON.parse(localStorage.getItem('selectedPlant') || '{}'));
  ///const plantName = plant?.name || 'Unknown Plant';
  const [inventory] = useState(generatePlantInventory(String(plant.id || "")));

  const monthlyConsumption = generateMonthlyConsumption();
  const upcomingDeliveries = generateUpcomingDeliveries();
  const reorderItems = generateReorderItems(inventory);

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
  const totalItems = inventory.reduce(
    (sum, item) => sum + item.stockAvailable,
    0,
  );
  const itemsBelowThreshold = inventory.filter(
    (item) => item.stockAvailable <= item.reorderThreshold,
  ).length;
  const upcomingDeliveriesCount = upcomingDeliveries.length;
  const totalInventoryValue = inventory.reduce(
    (sum, item) => sum + item.stockAvailable * item.unitCost,
    0,
  );

  const getReorderStatusColor = (status: InventoryItem["reorderStatus"]) => {
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

  const getDeliveryStatusColor = (status: UpcomingDelivery["status"]) => {
    switch (status) {
      case "confirmed":
        return "secondary";
      case "shipped":
        return "info";
      case "delayed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getUrgencyColor = (urgency: ReorderItem["urgency"]) => {
    switch (urgency) {
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

  return (
    <div className="flex flex-col h-full">
      <PlantNavigation />

      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        {/* <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {plant.name} - Plant Inventory
            </h1>
            <p className="text-muted-foreground">
              Track onsite spare parts and consumables inventory
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Generate Reorder
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>
        </div> */}

        {/* Inventory KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Total Items
                  </div>
                  <div className="text-2xl font-bold">
                    {totalItems.toLocaleString()}
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
                    Below Threshold
                  </div>
                  <div className="text-2xl font-bold text-destructive">
                    {itemsBelowThreshold}
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
                    Upcoming Deliveries
                  </div>
                  <div className="text-2xl font-bold text-info">
                    {upcomingDeliveriesCount}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  {/* <DollarSign className="w-5 h-5 text-success" /> */}
                  <img 
                    src="/assets/UAE_Dirham_Symbol.svg" 
                    alt="UAE Dirham" 
                    className="w-5 h-5" 
                  />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Inventory Value
                  </div>
                  <div className="text-2xl font-bold text-success">
                    {(totalInventoryValue / 1000).toFixed(0)}K AED
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Component Consumption Graph */}
        <Card>
          <CardHeader>
            <CardTitle>Component Consumption Trend (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyConsumption}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                {/* <Legend /> */}
                <Bar dataKey="inverters" fill="#F5C842" name="Inverters" />
                <Bar dataKey="panels" fill="#10B981" name="Panels" />
                <Bar dataKey="cables" fill="#3B82F6" name="Cables" />
                <Bar dataKey="electronics" fill="#EF4444" name="Electronics" />
                <Bar dataKey="mechanical" fill="#8B5CF6" name="Mechanical" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Reorder Tracker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Reorder Tracker - Items Requiring Immediate Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reorderItems.length > 0 ? (
              <div className="space-y-4">
                {reorderItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant={getUrgencyColor(item.urgency) as any}>
                            {item.urgency.toUpperCase()}
                          </Badge>
                          <span className="font-medium text-lg">
                            {item.itemName}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">
                              Current Stock
                            </div>
                            <div className="font-medium text-destructive">
                              {item.currentStock}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">
                              Threshold
                            </div>
                            <div className="font-medium">{item.threshold}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">
                              Recommended Order
                            </div>
                            <div className="font-medium text-success">
                              {item.recommendedOrder}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">
                              Estimated Cost
                            </div>
                            <div className="font-medium">
                              {item.estimatedCost.toLocaleString()} AED
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleCreateOrder(item.id)}>
                          Create Order
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 text-success" />
                <div className="text-lg font-medium">
                  All Items Above Threshold
                </div>
                <div className="text-sm">No immediate reordering required</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deliveries */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deliveries</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-sm">Item</th>
                    <th className="text-left p-4 font-medium text-sm">
                      Quantity
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Supplier
                    </th>
                    <th className="text-left p-4 font-medium text-sm">ETA</th>
                    <th className="text-left p-4 font-medium text-sm">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingDeliveries.map((delivery) => (
                    <tr
                      key={delivery.id}
                      className="border-t hover:bg-muted/30"
                    >
                      <td className="p-4 font-medium">{delivery.itemName}</td>
                      <td className="p-4 font-medium">{delivery.quantity}</td>
                      <td className="p-4 text-sm">{delivery.supplier}</td>
                      <td className="p-4 text-sm">
                        {new Date(delivery.estimatedDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            getDeliveryStatusColor(delivery.status) as any
                          }
                        >
                          {delivery.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Current Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Current Inventory Status</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-sm">Item</th>
                    <th className="text-left p-4 font-medium text-sm">
                      Category
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Available
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Unit Cost
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Total Value
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Last Restocked
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Location
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.id} className="border-t hover:bg-muted/30">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.supplier}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">{item.category}</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {item.stockAvailable}
                          </span>
                          <div className="w-16">
                            <Progress
                              value={
                                (item.stockAvailable /
                                  (item.reorderThreshold * 2)) *
                                100
                              }
                              className="h-2"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium">
                        {item.unitCost.toLocaleString()} AED
                      </td>
                      <td className="p-4 font-medium text-success">
                        {(item.stockAvailable * item.unitCost).toLocaleString()} AED
                      </td>
                      <td className="p-4 text-sm">
                        {new Date(item.lastRestocked).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          {item.location}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            getReorderStatusColor(item.reorderStatus) as any
                          }
                        >
                          {item.reorderStatus.toUpperCase()}
                        </Badge>
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
