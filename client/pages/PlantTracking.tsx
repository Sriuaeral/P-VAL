import { useState, useEffect } from "react";
import { Plant } from "@shared/interface";
//import PlantNavigation from '@/components/PlantNavigation';
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
} from "recharts";
import {
  Truck,
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Calendar,
  Download,
  Eye,
  Building,
} from "lucide-react";
import PlantNavigation from "@/components/PlantNavigation";

interface Delivery {
  id: string;
  itemName: string;
  quantity: number;
  supplier: string;
  shippedDate: string;
  estimatedArrival: string;
  actualArrival?: string;
  status: "dispatched" | "in-transit" | "delivered" | "delayed";
  progress: number;
  trackingNumber: string;
  urgency: "normal" | "high" | "critical";
  destination: string;
}

interface ReplacementComponent {
  id: string;
  componentName: string;
  componentType: string;
  faultyComponentId: string;
  orderDate: string;
  deliveryStage: "ordered" | "manufacturing" | "shipped" | "delivered";
  supplier: string;
  estimatedDelivery: string;
  criticality: "low" | "medium" | "high" | "critical";
  cost: number;
}

interface Vendor {
  id: string;
  name: string;
  totalDeliveries: number;
  onTimeDeliveryRate: number;
  averageDeliveryTime: number; // days
  issueCount: number;
  rating: number;
  contact: string;
}

interface PartsConsumption {
  month: string;
  inverters: number;
  panels: number;
  cables: number;
  electronics: number;
  mechanical: number;
}

// Mock data generators
const generateOngoingDeliveries = (plantId: string): Delivery[] => [
  {
    id: "del-001",
    itemName: "Huawei SUN2000-100KTL-M1 Inverter",
    quantity: 2,
    supplier: "Huawei Technologies",
    shippedDate: "2024-01-12T10:00:00Z",
    estimatedArrival: "2024-01-18T14:00:00Z",
    status: "in-transit",
    progress: 75,
    trackingNumber: "HW2024011201",
    urgency: "critical",
    destination: "Plant Main Warehouse",
  },
  {
    id: "del-002",
    itemName: "String Combiner Boxes (10-input)",
    quantity: 15,
    supplier: "Schneider Electric",
    shippedDate: "2024-01-14T09:30:00Z",
    estimatedArrival: "2024-01-20T12:00:00Z",
    status: "dispatched",
    progress: 25,
    trackingNumber: "SE2024011401",
    urgency: "normal",
    destination: "Plant Storage Area B",
  },
  {
    id: "del-003",
    itemName: "DC Solar Cables (1000m)",
    quantity: 1,
    supplier: "Polycab India",
    shippedDate: "2024-01-10T11:15:00Z",
    estimatedArrival: "2024-01-17T15:30:00Z",
    actualArrival: "2024-01-17T14:45:00Z",
    status: "delivered",
    progress: 100,
    trackingNumber: "PC2024011001",
    urgency: "normal",
    destination: "Plant Storage Area A",
  },
  {
    id: "del-004",
    itemName: "Tracker Drive Units",
    quantity: 5,
    supplier: "Nextracker Inc",
    shippedDate: "2024-01-08T08:00:00Z",
    estimatedArrival: "2024-01-16T10:00:00Z",
    status: "delayed",
    progress: 85,
    trackingNumber: "NX2024010801",
    urgency: "high",
    destination: "Plant Field Storage",
  },
];

const generateReplacementComponents = (
  plantId: string,
): ReplacementComponent[] => [
  {
    id: "repl-001",
    componentName: "Inverter Unit INV-005",
    componentType: "Inverter",
    faultyComponentId: "INV-005-FAULT",
    orderDate: "2024-01-13T14:20:00Z",
    deliveryStage: "shipped",
    supplier: "Huawei Technologies",
    estimatedDelivery: "2024-01-19T12:00:00Z",
    criticality: "critical",
    cost: 15000,
  },
  {
    id: "repl-002",
    componentName: "Weather Station Sensor Array",
    componentType: "Weather Station",
    faultyComponentId: "WS-001-SENSOR",
    orderDate: "2024-01-11T09:45:00Z",
    deliveryStage: "manufacturing",
    supplier: "Vaisala Inc",
    estimatedDelivery: "2024-01-25T15:30:00Z",
    criticality: "medium",
    cost: 3500,
  },
  {
    id: "repl-003",
    componentName: "String Combiner Box SCB-12",
    componentType: "Combiner Box",
    faultyComponentId: "SCB-012-FAULT",
    orderDate: "2024-01-09T16:30:00Z",
    deliveryStage: "delivered",
    supplier: "Schneider Electric",
    estimatedDelivery: "2024-01-16T10:00:00Z",
    criticality: "high",
    cost: 1200,
  },
];

const generatePartsConsumption = (): PartsConsumption[] => [
  {
    month: "Jul",
    inverters: 1,
    panels: 15,
    cables: 200,
    electronics: 8,
    mechanical: 12,
  },
  {
    month: "Aug",
    inverters: 0,
    panels: 8,
    cables: 150,
    electronics: 5,
    mechanical: 9,
  },
  {
    month: "Sep",
    inverters: 2,
    panels: 25,
    cables: 300,
    electronics: 12,
    mechanical: 15,
  },
  {
    month: "Oct",
    inverters: 1,
    panels: 12,
    cables: 180,
    electronics: 7,
    mechanical: 10,
  },
  {
    month: "Nov",
    inverters: 0,
    panels: 6,
    cables: 120,
    electronics: 4,
    mechanical: 8,
  },
  {
    month: "Dec",
    inverters: 1,
    panels: 18,
    cables: 220,
    electronics: 9,
    mechanical: 11,
  },
];

const generateVendorInfo = (): Vendor[] => [
  {
    id: "vend-001",
    name: "Huawei Technologies",
    totalDeliveries: 12,
    onTimeDeliveryRate: 91.7,
    averageDeliveryTime: 6.5,
    issueCount: 1,
    rating: 4.6,
    contact: "solar@huawei.com",
  },
  {
    id: "vend-002",
    name: "Schneider Electric",
    totalDeliveries: 8,
    onTimeDeliveryRate: 87.5,
    averageDeliveryTime: 7.2,
    issueCount: 1,
    rating: 4.4,
    contact: "solar@schneider-electric.com",
  },
  {
    id: "vend-003",
    name: "Nextracker Inc",
    totalDeliveries: 5,
    onTimeDeliveryRate: 80.0,
    averageDeliveryTime: 9.8,
    issueCount: 2,
    rating: 4.1,
    contact: "info@nextracker.com",
  },
  {
    id: "vend-004",
    name: "Polycab India",
    totalDeliveries: 15,
    onTimeDeliveryRate: 93.3,
    averageDeliveryTime: 5.8,
    issueCount: 0,
    rating: 4.8,
    contact: "sales@polycab.com",
  },
];

export default function PlantTracking() {
  const [plant, setPlant] = useState<Plant | null>(JSON.parse(localStorage.getItem('selectedPlant') || '{}'));
  const plantName = localStorage.getItem('selectedPlant');
  const [deliveries] = useState(generateOngoingDeliveries(plant.id || ""));
  const [replacements] = useState(generateReplacementComponents(plant.id || ""));
  const [vendors] = useState(generateVendorInfo());

  const partsConsumption = generatePartsConsumption();

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
  const activeDeliveries = deliveries.filter(
    (d) => d.status !== "delivered",
  ).length;
  const delayedDeliveries = deliveries.filter(
    (d) => d.status === "delayed",
  ).length;
  const criticalComponents = replacements.filter(
    (r) => r.criticality === "critical",
  ).length;
  const onTimeDeliveryRate =
    vendors.reduce((acc, v) => acc + v.onTimeDeliveryRate, 0) / vendors.length;

  const getStatusColor = (status: Delivery["status"]) => {
    switch (status) {
      case "delivered":
        return "success";
      case "in-transit":
        return "info";
      case "dispatched":
        return "secondary";
      case "delayed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getUrgencyColor = (urgency: Delivery["urgency"]) => {
    switch (urgency) {
      case "critical":
        return "destructive";
      case "high":
        return "warning";
      case "normal":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStageColor = (stage: ReplacementComponent["deliveryStage"]) => {
    switch (stage) {
      case "delivered":
        return "success";
      case "shipped":
        return "info";
      case "manufacturing":
        return "warning";
      case "ordered":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getCriticalityColor = (
    criticality: ReplacementComponent["criticality"],
  ) => {
    switch (criticality) {
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
              {plant.name} - Logistics Tracking
            </h1>
            <p className="text-muted-foreground">
              Track deliveries and component replacements for this site
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>
        </div> */}

        {/* Tracking KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Active Deliveries
                  </div>
                  <div className="text-2xl font-bold">{activeDeliveries}</div>
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
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Critical Components
                  </div>
                  <div className="text-2xl font-bold text-warning">
                    {criticalComponents}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    On-Time Rate
                  </div>
                  <div className="text-2xl font-bold text-success">
                    {onTimeDeliveryRate.toFixed(1)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ongoing Deliveries Tracker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              Ongoing Deliveries Tracker
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-sm">Item</th>
                    <th className="text-left p-4 font-medium text-sm">
                      Supplier
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Quantity
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Shipped
                    </th>
                    <th className="text-left p-4 font-medium text-sm">ETA</th>
                    <th className="text-left p-4 font-medium text-sm">
                      Status
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Progress
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Priority
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((delivery) => (
                    <tr
                      key={delivery.id}
                      className="border-t hover:bg-muted/30"
                    >
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{delivery.itemName}</div>
                          <div className="text-sm text-muted-foreground">
                            Tracking: {delivery.trackingNumber}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">{delivery.supplier}</td>
                      <td className="p-4 font-medium">{delivery.quantity}</td>
                      <td className="p-4 text-sm">
                        {new Date(delivery.shippedDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {new Date(
                            delivery.estimatedArrival,
                          ).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={getStatusColor(delivery.status) as any}>
                          {delivery.status.replace("-", " ").toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20">
                            <Progress
                              value={delivery.progress}
                              className="h-2"
                            />
                          </div>
                          <span className="text-sm">{delivery.progress}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={getUrgencyColor(delivery.urgency) as any}
                        >
                          {delivery.urgency.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Replacement Components Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-warning" />
              Replacement Components Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-sm">
                      Component
                    </th>
                    <th className="text-left p-4 font-medium text-sm">Type</th>
                    <th className="text-left p-4 font-medium text-sm">
                      Supplier
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Order Date
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Delivery Stage
                    </th>
                    <th className="text-left p-4 font-medium text-sm">ETA</th>
                    <th className="text-left p-4 font-medium text-sm">
                      Criticality
                    </th>
                    <th className="text-left p-4 font-medium text-sm">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {replacements.map((replacement) => (
                    <tr
                      key={replacement.id}
                      className="border-t hover:bg-muted/30"
                    >
                      <td className="p-4">
                        <div>
                          <div className="font-medium">
                            {replacement.componentName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Replacing: {replacement.faultyComponentId}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        {replacement.componentType}
                      </td>
                      <td className="p-4 text-sm">{replacement.supplier}</td>
                      <td className="p-4 text-sm">
                        {new Date(replacement.orderDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            getStageColor(replacement.deliveryStage) as any
                          }
                        >
                          {replacement.deliveryStage.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm">
                        {new Date(
                          replacement.estimatedDelivery,
                        ).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            getCriticalityColor(replacement.criticality) as any
                          }
                        >
                          {replacement.criticality.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4 font-medium text-success">
                        {replacement.cost.toLocaleString()} AED
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Parts Consumption Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Spare Parts Consumption Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={partsConsumption}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  {/* <Legend /> */}
                  <Bar dataKey="inverters" fill="#F5C842" name="Inverters" />
                  <Bar dataKey="panels" fill="#10B981" name="Panels" />
                  <Bar dataKey="cables" fill="#3B82F6" name="Cables" />
                  <Bar
                    dataKey="electronics"
                    fill="#EF4444"
                    name="Electronics"
                  />
                  <Bar dataKey="mechanical" fill="#8B5CF6" name="Mechanical" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Vendor Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vendors.map((vendor) => (
                  <div key={vendor.id} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{vendor.name}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Rating:</span>
                        <Badge variant="secondary">{vendor.rating}/5</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">
                          Total Deliveries
                        </div>
                        <div className="font-medium">
                          {vendor.totalDeliveries}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">
                          On-Time Rate
                        </div>
                        <div className="font-medium text-success">
                          {vendor.onTimeDeliveryRate}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">
                          Avg Delivery
                        </div>
                        <div className="font-medium">
                          {vendor.averageDeliveryTime} days
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Issues</div>
                        <div className="font-medium text-destructive">
                          {vendor.issueCount}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
