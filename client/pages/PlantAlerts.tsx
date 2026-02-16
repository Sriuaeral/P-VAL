import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { plantsService } from "@shared/api";
import { Plant, Alert } from "@shared/interface";
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
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  Search,
  Filter,
  Download,
  Calendar,
  Activity,
  Eye,
  Bell,
  TrendingUp,
  X,
  FileText,
  Thermometer,
  Zap,
  Settings,
  User,
  Target,
  ExternalLink,
  FileDown,
  Wrench,
  Shield,
  AlertCircle,
  Info,
  RefreshCw,
  Plus,
  MoreHorizontal,
  Star,
  Timer,
  Gauge,
} from "lucide-react";
import PlantNavigation from "@/components/PlantNavigation";
import { ApiService } from "@/lib/api";
import { config, getApiEndpoint } from "@/lib/config";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FilterBar, ALERT_FILTER_CONFIG } from "@/components/ui/filter-bar";

// Component Types and Fault Types from backend
const COMPONENT_TYPES = [
  { value: "Inverter", label: "Inverter" },
  { value: "Tracker", label: "Tracker" },
  { value: "WeatherStation", label: "Weather Station" },
  { value: "DataLogger", label: "Data Logger" },
  { value: "CombinerBox", label: "Combiner Box" },
  { value: "Transformer", label: "Transformer" },
  { value: "Panel", label: "Panel" },
  { value: "StringMonitor", label: "String Monitor" },
  { value: "Other", label: "Other" }
] as const;

const FAULT_TYPES = [
  { value: "Performance Issue", label: "Performance Issue" },
  { value: "Communication Error", label: "Communication Error" },
  { value: "Position Error", label: "Position Error" },
  { value: "Temperature Alarm", label: "Temperature Alarm" },
  { value: "Voltage Anomaly", label: "Voltage Anomaly" },
  { value: "Current Anomaly", label: "Current Anomaly" },
  { value: "Maintenance Required", label: "Maintenance Required" },
  { value: "Security Breach", label: "Security Breach" },
  { value: "Weather Alert", label: "Weather Alert" },
  { value: "System Failure", label: "System Failure" },
  { value: "Other", label: "Other" }
] as const;

interface AlertsAPI {
  createAlert: (alertData: CreateAlertRequest) => Promise<{ id: string }>;
  getAlerts: (plantId: string, status?: string) => Promise<ExtendedAlert[]>;
  getAlertDetails: (id: string, plantId: string) => Promise<ExtendedAlert>;
  acknowledgeAlert: (id: string, plantId: string, userData: { userId: string; userName: string }) => Promise<void>;
  resolveAlert: (id: string, plantId: string, userData: { userId: string; userName: string }) => Promise<void>;
  getAlertCounts: (plantId: string) => Promise<{ critical: number; high: number; medium: number; low: number }>;
}

interface CreateAlertRequest {
  plantId: number;
  plantName: string;
  component: string;
  severity: string;
  message: string;
  componentType: string;
  faultType: string;
  duration: number;
}

const alertsAPI: AlertsAPI = {
  createAlert: async (alertData: CreateAlertRequest) => {
    try {
      const endpoint = `${getApiEndpoint('alerts')}`;
      
      // ApiService.post returns the response.data, which should have the nested structure
      const apiResponse = await ApiService.post<{
        success: boolean;
        message: string;
        data: { id: string };
      }>(endpoint, alertData);
      
      // Return the data from the nested structure
      return apiResponse.data;
    } catch (error) {
      console.error('Create Alert API Error:', error);
      throw error;
    }
  },

  getAlerts: async (plantId: string, status?: string) => {
    try {
      const params: Record<string, any> = { plantId };
      if (status) {
        params.status = status;
      }
      
      const queryString = ApiService.createQueryParams(params);
      const endpoint = `${getApiEndpoint('alerts')}?${queryString}`;
      
      
      // ApiService.get returns the response.data, which is the full JSON object
      const apiResponse = await ApiService.get<{
        success: boolean;
        message: string;
        data: {
          alerts: ExtendedAlert[];
          totalCount: number;
          pageNumber: number;
          pageSize: number;
          totalPages: number;
          hasNextPage: boolean;
          hasPreviousPage: boolean;
        };
        totalCount: number;
        pageNumber: number;
        pageSize: number;
        errorCode: string | null;
        errors: string | null;
      }>(endpoint);
      

      // Return just the alerts array from the nested data
      return apiResponse.data.alerts;
    } catch (error) {
      console.error('Get Alerts API Error:', error);
      throw error;
    }
  },

  getAlertDetails: async (id: string, plantId: string) => {
    try {
      const queryString = ApiService.createQueryParams({ plantId });
      const endpoint = `${getApiEndpoint('alerts')}/${id}?${queryString}`;
      
      // ApiService.get returns the response.data, which should have the nested structure
      const apiResponse = await ApiService.get<{
        success: boolean;
        message: string;
        data: ExtendedAlert;
      }>(endpoint);
      
      // Return the alert from the nested data
      return apiResponse.data;
    } catch (error) {
      console.error('Get Alert Details API Error:', error);
      throw error;
    }
  },

  acknowledgeAlert: async (id: string, plantId: string, userData: { userId: string; userName: string }) => {
    try {
      const queryString = ApiService.createQueryParams({ plantId });
      const endpoint = `${getApiEndpoint('alerts')}/${id}/acknowledge?${queryString}`;
      const data = {
        ...userData,
        newStatus: 'Acknowledged'
      };
      
      await ApiService.post<void>(endpoint, data);
    } catch (error) {
      console.error('Acknowledge Alert API Error:', error);
      throw error;
    }
  },

  resolveAlert: async (id: string, plantId: string, userData: { userId: string; userName: string }) => {
    try {
      const queryString = ApiService.createQueryParams({ plantId });
      const endpoint = `${getApiEndpoint('alerts')}/${id}/resolve?${queryString}`;
      const data = {
        ...userData,
        newStatus: 'Resolved'
      };
      
      await ApiService.post<void>(endpoint, data);
    } catch (error) {
      console.error('Resolve Alert API Error:', error);
      throw error;
    }
  },

  getAlertCounts: async (plantId: string) => {
    try {
      const endpoint = `/v1/plants/${plantId}/alert-counts`;
      
      // ApiService.get returns the response.data, which should have the nested structure
      const apiResponse = await ApiService.get<{
        success: boolean;
        message: string;
        data: { critical: number; high: number; medium: number; low: number };
      }>(endpoint);
      
      // Return the data from the nested structure
      return apiResponse.data;
    } catch (error) {
      console.error('Get Alert Counts API Error:', error);
      throw error;
    }
  },
};

// Chart API methods for analytics dashboard
const chartAPI = {
  getAlertStatusSummary: async (plantId: string) => {
    try {
      const endpoint = `/v1/plants/${plantId}/alert-status-summary`;
      const apiResponse = await ApiService.get<{
        success: boolean;
        message: string;
        data: {
          unopen: number;
          inProgress: number;
          closed: number;
          total: number;
        };
      }>(endpoint);
      return apiResponse.data;
    } catch (error) {
      console.error('Get Alert Status Summary Error:', error);
      throw error;
    }
  },

  getResolutionMetrics: async (plantId: string) => {
    try {
      const endpoint = `/v1/plants/${plantId}/resolution-metrics`;
      const apiResponse = await ApiService.get<{
        success: boolean;
        message: string;
        data: {
          bestResolutionTime: { value: number; unit: string };
          averageResolutionTime: { value: number; unit: string };
          slaTarget: { value: number; unit: string };
        };
      }>(endpoint);
      return apiResponse.data;
    } catch (error) {
      console.error('Get Resolution Metrics Error:', error);
      throw error;
    }
  },

  getSeverityTrends: async (plantId: string, months: number = 6) => {
    try {
      const endpoint = `/v1/plants/${plantId}/severity-trends?period=monthly&months=${months}`;
      const apiResponse = await ApiService.get<{
        success: boolean;
        message: string;
        data: {
          trends: Array<{
            month: string;
            year: number;
            low: number;
            moderate: number;
            high: number;
            critical: number;
            total: number;
          }>;
        };
      }>(endpoint);
      return apiResponse.data;
    } catch (error) {
      console.error('Get Severity Trends Error:', error);
      throw error;
    }
  },

  getComponentDistribution: async (plantId: string) => {
    try {
      const endpoint = `/v1/plants/${plantId}/component-alert-distribution?period=monthly`;
      const apiResponse = await ApiService.get<{
        success: boolean;
        message: string;
        data: {
          distribution: Array<{
            componentType: string;
            alertCount: number;
            percentage: number;
          }>;
          totalAlerts: number;
          period: string;
        };
      }>(endpoint);
      return apiResponse.data;
    } catch (error) {
      console.error('Get Component Distribution Error:', error);
      throw error;
    }
  },

  getResolutionTrends: async (plantId: string, months: number = 6) => {
    try {
      const endpoint = `/v1/plants/${plantId}/resolution-trends?period=monthly&months=${months}`;
      const apiResponse = await ApiService.get<{
        success: boolean;
        message: string;
        data: {
          trends: Array<{
            month: string;
            year: number;
            unopen: number;
            closed: number;
            inProgress: number;
            total: number;
          }>;
        };
      }>(endpoint);
      return apiResponse.data;
    } catch (error) {
      console.error('Get Resolution Trends Error:', error);
      throw error;
    }
  },
};

interface ExtendedAlert extends Alert {
  duration: number | null; // hours - can be null
  component: string; // Component name/identifier
  componentType:
    | "Inverter"
    | "Tracker"
    | "WeatherStation"
    | "DataLogger"
    | "CombinerBox"
    | "Transformer"
    | "Panel"
    | "StringMonitor"
    | "Other";
  faultType: string;
  acknowledgedBy?: string | null;
  acknowledgedAt?: string | null;
  resolvedBy?: string | null;
  resolvedAt?: string | null;
  // Additional fields from the API response
  createdBy?: string;
  createdAt?: string;
  lastModifiedAt?: string;
  escalationLevel?: number;
  tags?: string[];
  isOverdue?: boolean;
  timeSinceCreated?: string;
  responseTime?: string | null;
  resolutionTime?: string | null;
  priority?: string;
  slaStatus?: string;
}

interface AlertDetailData {
  metadata: {
    alertId: string;
    plantName: string;
    componentType: string;
    alertType: string;
    severity: string;
    startTime: string;
    duration: number;
    resolvedBy?: string;
  };
  rootCause: {
    analysis: string;
    conditions: string[];
  };
  suggestedActions: string[];
  componentHealth: {
    temperature?: number;
    powerOutput?: number;
    previousFaultCount: number;
    lastMaintenanceDate: string;
  };
  timelineData: Array<{
    time: string;
    value: number;
    status: "normal" | "warning" | "fault";
  }>;
  maintenanceLog?: {
    id: string;
    description: string;
    date: string;
    technician: string;
  };
}

export default function PlantAlerts() {
  const alert = useAlert();
  const { plantId } = useParams<{ plantId: string }>();
  const [plant, setPlant] = useState<Plant | null>(JSON.parse(localStorage.getItem('selectedPlant')) || null);
  const plantName = plant?.name || 'Unknown Plant'; 
  const [alerts, setAlerts] = useState<ExtendedAlert[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [componentFilter, setComponentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Common filter state
  const [filterValues, setFilterValues] = useState({
    search: "",
    severity: "all",
    component: "all",
    status: "all",
    faultType: "all",
    sortOrder: "critical-to-low"
  } as {
    search: string;
    severity: string;
    component: string;
    status: string;
    faultType: string;
    sortOrder: string;
  });

  // Handle filter value changes
  const handleFilterChange = (key: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    
    // Update individual filter states for backward compatibility
    if (key === "search") setSearchQuery(value);
    if (key === "severity") setSeverityFilter(value);
    if (key === "component") setComponentFilter(value);
    if (key === "status") setStatusFilter(value);
  };
  const [dateRange, setDateRange] = useState("7d");
  const [selectedAlert, setSelectedAlert] = useState<ExtendedAlert | null>(
    null,
  );
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertCounts, setAlertCounts] = useState({ critical: 0, high: 0, medium: 0, low: 0 });
  const [processingAlerts, setProcessingAlerts] = useState<Set<string>>(new Set());
  const [isAddAlertDialogOpen, setIsAddAlertDialogOpen] = useState(false);
  const [newAlertData, setNewAlertData] = useState<{
    component: string;
    componentType: string;
    severity: string;
    faultType: string;
    message: string;
    duration: number;
  }>({
    component: "",
    componentType: "Inverter",
    severity: "medium",
    faultType: "Performance Issue",
    message: "",
    duration: 0
  });
  
  // Chart data state variables
  const [alertStatusSummary, setAlertStatusSummary] = useState({
    unopen: 54, inProgress: 43, closed: 33, total: 130
  });
  const [resolutionMetrics, setResolutionMetrics] = useState({
    bestResolutionTime: { value: 2, unit: "days" },
    averageResolutionTime: { value: 4, unit: "days" },
    slaTarget: { value: 3, unit: "days" }
  });
  const [severityTrends, setSeverityTrends] = useState([
    { month: 'Jan', Low: 6, Moderate: 8, High: 4, Critical: 2 },
    { month: 'Feb', Low: 7, Moderate: 6, High: 10, Critical: 3 },
    { month: 'Mar', Low: 5, Moderate: 9, High: 7, Critical: 1 },
    { month: 'Apr', Low: 8, Moderate: 11, High: 12, Critical: 4 },
    { month: 'May', Low: 9, Moderate: 13, High: 15, Critical: 2 },
    { month: 'Jun', Low: 4, Moderate: 14, High: 16, Critical: 3 }
  ]);
  const [componentDistribution, setComponentDistribution] = useState([
    { name: "DC", value: 7, fill: "#3B82F6" },
    { name: "Inverter", value: 5, fill: "#EF4444" },
    { name: "AC", value: 4, fill: "#10B981" },
    { name: "Transformer", value: 3, fill: "#F59E0B" },
    { name: "HVAC", value: 3, fill: "#8B5CF6" },
    { name: "IP", value: 2, fill: "#06B6D4" },
    { name: "Metering", value: 8, fill: "#84CC16" },
    { name: "BESS", value: 1, fill: "#F97316" },
    { name: "Tracker", value: 2, fill: "#EC4899" }
  ]);
  const [resolutionTrends, setResolutionTrends] = useState([
    { month: 'Jan', Unopen: 12, Closed: 22, InProgress: 15 },
    { month: 'Feb', Unopen: 8, Closed: 6, InProgress: 5 },
    { month: 'Mar', Unopen: 10, Closed: 8, InProgress: 7 },
    { month: 'Apr', Unopen: 6, Closed: 4, InProgress: 3 },
    { month: 'May', Unopen: 5, Closed: 8, InProgress: 4 },
    { month: 'Jun', Unopen: 3, Closed: 2, InProgress: 1 }
  ]);

  
  useEffect(() => {
    const loadData = async () => {
      if (!plantId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Load plant via service
        const plants = await plantsService.fetchPlants();
        const selectedPlant = (plants || []).find((p: any) => String(p.id) === String(plantId));
        setPlant(selectedPlant || null);
        
        // Load alerts from API
        const alertsData = await alertsAPI.getAlerts(plantId);
        setAlerts(alertsData);
        
        // Load alert counts from API
        const countsData = await alertsAPI.getAlertCounts(plantId);
        setAlertCounts(countsData);

        // Load chart data from APIs
        try {
          const [
            statusSummary,
            metrics,
            severityData,
            componentData,
            resolutionData
          ] = await Promise.all([
            chartAPI.getAlertStatusSummary(plantId),
            chartAPI.getResolutionMetrics(plantId),
            chartAPI.getSeverityTrends(plantId),
            chartAPI.getComponentDistribution(plantId),
            chartAPI.getResolutionTrends(plantId)
          ]);

          setAlertStatusSummary(statusSummary);
          setResolutionMetrics(metrics);
          
          // Transform severity trends data
          setSeverityTrends(severityData.trends.map(trend => ({
            month: trend.month,
            Low: trend.low,
            Moderate: trend.moderate,
            High: trend.high,
            Critical: trend.critical
          })));

          // Transform component distribution data
          const colors = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#06B6D4", "#84CC16", "#F97316", "#EC4899"];
          setComponentDistribution(componentData.distribution.map((item, index) => ({
            name: item.componentType,
            value: item.alertCount,
            fill: colors[index % colors.length]
          })));

          // Transform resolution trends data
          setResolutionTrends(resolutionData.trends.map(trend => ({
            month: trend.month,
            Unopen: trend.unopen,
            Closed: trend.closed,
            InProgress: trend.inProgress
          })));

        } catch (chartError) {
          // Keep existing fallback/mock data in state
        }
        
      } catch (err) {
        console.error('Failed to load alerts data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        
        // On error, clear selection
        setPlant(null);
        setAlerts([]); // Set empty array if API fails
      } finally {
        setLoading(false);
    }
    };
    
    loadData();
  }, [plantId]);

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <PlantNavigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <div className="text-lg font-semibold">Loading alerts...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="flex flex-col h-full">
        <PlantNavigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-600" />
            <div className="text-lg font-semibold">Plant not found</div>
          </div>
        </div>
      </div>
    );
  }


  // Filter alerts
  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.component.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.faultType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity =
      severityFilter === "all" || alert.severity === severityFilter;
    const matchesComponent =
      componentFilter === "all" || alert.componentType === componentFilter;
    const matchesStatus =
      statusFilter === "all" || alert.status === statusFilter;
    const matchesFaultType =
      filterValues.faultType === "all" || alert.faultType === filterValues.faultType;

    return matchesSearch && matchesSeverity && matchesComponent && matchesStatus && matchesFaultType;
  });


  // Calculate KPIs
  const activeAlerts = alerts.filter((a) => a.status === "created" || a.status === "active").length;
  const criticalAlerts = alerts.filter(
    (a) => a.severity === "critical" && (a.status === "created" || a.status === "active"),
  ).length;
  const acknowledgedAlerts = alerts.filter(
    (a) => a.status === "acknowledged",
  ).length;
  const avgResolutionTime =
    alerts
      .filter((a) => a.status === "resolved")
      .reduce((acc, alert) => acc + (alert.duration || 0), 0) /
      alerts.filter((a) => a.status === "resolved").length || 0;

  const getStatusColor = (status: ExtendedAlert["status"]) => {
    switch (status) {
      case "created":
        return "destructive";
      case "active":
        return "destructive";
      case "acknowledged":
        return "warning";
      case "resolved":
        return "success";
      default:
        return "secondary";
    }
  };

  const getSeverityColor = (severity: ExtendedAlert["severity"]) => {
    switch (severity) {
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

  const getStatusIcon = (status: ExtendedAlert["status"]) => {
    switch (status) {
      case "created":
        return AlertTriangle;
      case "active":
        return AlertTriangle;
      case "acknowledged":
        return Clock;
      case "resolved":
        return CheckCircle;
      default:
        return AlertTriangle;
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    if (!plantId) return;
    
    // Add to processing set to show loading state
    setProcessingAlerts(prev => new Set([...prev, alertId]));
    
    try {
      await alertsAPI.acknowledgeAlert(alertId, plantId, {
        userId: "current-user-id", // This should come from auth context
        userName: "Current User" // This should come from auth context
      });
      
      // On success, refresh the entire page data to get updated status
      await refreshData();
      
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
      setError(err instanceof Error ? err.message : 'Failed to acknowledge alert');
    } finally {
      // Remove from processing set
      setProcessingAlerts(prev => {
        const newSet = new Set(prev);
        newSet.delete(alertId);
        return newSet;
      });
    }
  };

  const handleResolve = async (alertId: string) => {
    if (!plantId) return;
    
    // Add to processing set to show loading state
    setProcessingAlerts(prev => new Set([...prev, alertId]));
    
    try {
      await alertsAPI.resolveAlert(alertId, plantId, {
        userId: "current-user-id", // This should come from auth context
        userName: "Current User" // This should come from auth context
      });
      
      // On success, refresh the entire page data to get updated status
      await refreshData();
      
    } catch (err) {
      console.error('Failed to resolve alert:', err);
      setError(err instanceof Error ? err.message : 'Failed to resolve alert');
    } finally {
      // Remove from processing set
      setProcessingAlerts(prev => {
        const newSet = new Set(prev);
        newSet.delete(alertId);
        return newSet;
      });
    }
  };

  const handleViewDetails = async (alert: ExtendedAlert) => {
    if (!plantId) return;
    
    try {
      
      // Fetch detailed alert data from API
      const detailedAlert = await alertsAPI.getAlertDetails(alert.id, plantId);
      setSelectedAlert(detailedAlert);
      setIsDetailPanelOpen(true);
    } catch (err) {
      console.error('Failed to fetch alert details:', err);
      // Fallback to current alert data if API fails
    setSelectedAlert(alert);
    setIsDetailPanelOpen(true);
    }
  };

  const handleCloseDetailPanel = () => {
    setIsDetailPanelOpen(false);
    setSelectedAlert(null);
  };

  const handleCreateAlert = async (alertData: Omit<CreateAlertRequest, 'plantId' | 'plantName'>) => {
    if (!plantId || !plant) return;
    
    try {
      const newAlertData: CreateAlertRequest = {
        ...alertData,
        plantId: parseInt(plantId),
        plantName: plant.name
      };
      
      const result = await alertsAPI.createAlert(newAlertData);
      
      // Refresh alerts list after creation
      const alertsData = await alertsAPI.getAlerts(plantId);
      setAlerts(alertsData);
      
      // Refresh alert counts
      const countsData = await alertsAPI.getAlertCounts(plantId);
      setAlertCounts(countsData);
      
    } catch (err) {
      console.error('Failed to create alert:', err);
      setError(err instanceof Error ? err.message : 'Failed to create alert');
    }
  };

  const refreshData = async () => {
    if (!plantId) return;
    
    try {
      setLoading(true);
      
      // Load core alert data
      const [alertsData, countsData] = await Promise.all([
        alertsAPI.getAlerts(plantId),
        alertsAPI.getAlertCounts(plantId)
      ]);
      
      setAlerts(alertsData);
      setAlertCounts(countsData);

      // Load chart data
      try {
        const [
          statusSummary,
          metrics,
          severityData,
          componentData,
          resolutionData
        ] = await Promise.all([
          chartAPI.getAlertStatusSummary(plantId),
          chartAPI.getResolutionMetrics(plantId),
          chartAPI.getSeverityTrends(plantId),
          chartAPI.getComponentDistribution(plantId),
          chartAPI.getResolutionTrends(plantId)
        ]);

        setAlertStatusSummary(statusSummary);
        setResolutionMetrics(metrics);
        
        // Transform severity trends data
        setSeverityTrends(severityData.trends.map(trend => ({
          month: trend.month,
          Low: trend.low,
          Moderate: trend.moderate,
          High: trend.high,
          Critical: trend.critical
        })));

        // Transform component distribution data
        const colors = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#06B6D4", "#84CC16", "#F97316", "#EC4899"];
        setComponentDistribution(componentData.distribution.map((item, index) => ({
          name: item.componentType,
          value: item.alertCount,
          fill: colors[index % colors.length]
        })));

        // Transform resolution trends data
        setResolutionTrends(resolutionData.trends.map(trend => ({
          month: trend.month,
          Unopen: trend.unopen,
          Closed: trend.closed,
          InProgress: trend.inProgress
        })));

      } catch (chartError) {
      }
      
      setError(null);
    } catch (err) {
      console.error('Failed to refresh data:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const generateAlertDetailData = (alert: ExtendedAlert): AlertDetailData => {
    return {
      metadata: {
        alertId: alert.id,
        plantName: plant?.name || "Unknown Plant",
        componentType: alert.componentType,
        alertType: alert.faultType,
        severity: alert.severity,
        startTime: alert.timestamp,
        duration: alert.duration || 0,
        resolvedBy:
          alert.resolvedBy ||
          (alert.status === "resolved" ? "Auto-Resolution" : undefined),
      },
      rootCause: {
        analysis: generateRootCauseAnalysis(alert),
        conditions: generateContributingConditions(alert),
      },
      suggestedActions: generateSuggestedActions(alert),
      componentHealth: {
        temperature:
          alert.componentType === "Inverter"
            ? 45 + Math.random() * 20
            : undefined,
        powerOutput:
          alert.componentType !== "WeatherStation"
            ? 120 + Math.random() * 80
            : undefined,
        previousFaultCount: Math.floor(Math.random() * 8) + 1,
        lastMaintenanceDate: "2024-01-08",
      },
      timelineData: generateTimelineData(alert),
      maintenanceLog:
        alert.status === "resolved"
          ? {
              id: "MAINT-" + alert.id.slice(-3),
              description: "Corrective maintenance completed",
              date: "2024-01-16",
              technician: alert.resolvedBy || "System Auto-Resolution",
            }
          : undefined,
    };
  };

  const generateRootCauseAnalysis = (alert: ExtendedAlert): string => {
    switch (alert.componentType) {
      case "Inverter":
        return `${alert.component} reported thermal overload likely due to prolonged high ambient temperatures (38°C) combined with suboptimal ventilation in the inverter housing. Thermal analysis indicates cooling system degradation.`;
      case "StringMonitor":
        return `${alert.component} disconnection detected. Root cause analysis suggests loose DC connector exacerbated by thermal cycling. Previous vibration events may have contributed to connection degradation.`;
      case "Tracker":
        return `${alert.component} positioning fault caused by mechanical wear in the drive system. Seasonal temperature variations and increased operational cycles have accelerated bearing degradation.`;
      case "CombinerBox":
        return `Battery management system detected cell voltage imbalance in ${alert.component}. Contributing factors include uneven thermal distribution and aging cell chemistry degradation.`;
      default:
        return `${alert.component} fault analysis indicates multiple contributing factors including environmental conditions, component aging, and operational stress patterns.`;
    }
  };

  const generateContributingConditions = (alert: ExtendedAlert): string[] => {
    const conditions = [
      "Ambient temperature: 38°C (above optimal 25°C)",
      "Operational hours: 8,760+ (high utilization)",
      "Last maintenance: 45 days ago",
    ];

    switch (alert.componentType) {
      case "Inverter":
        conditions.push(
          "Cooling fan efficiency: 78% (below nominal)",
          "DC input voltage fluctuations detected",
        );
        break;
      case "StringMonitor":
        conditions.push(
          "DC voltage variance: 15V (exceeds 10V threshold)",
          "Moisture ingress detected in combiner box",
        );
        break;
      case "Tracker":
        conditions.push(
          "Wind speed: 45 km/h (high stress conditions)",
          "Lubrication schedule overdue by 2 weeks",
        );
        break;
    }

    return conditions;
  };

  const generateSuggestedActions = (alert: ExtendedAlert): string[] => {
    const actions = [];

    switch (alert.componentType) {
      case "Inverter":
        actions.push(
          "Inspect inverter cooling fan system and replace if necessary",
          "Check ambient temperature monitoring and ventilation",
          "Review thermal management protocols",
          "If issue persists, initiate inverter replacement process",
        );
        break;
      case "StringMonitor":
        actions.push(
          "Inspect DC connector tightness and corrosion",
          "Check string combiner box for moisture ingress",
          "Verify string isolation and grounding",
          "Replace connectors if degradation is evident",
        );
        break;
      case "Tracker":
        actions.push(
          "Lubricate tracker drive mechanism",
          "Inspect mechanical components for wear",
          "Calibrate positioning sensors",
          "Schedule preventive maintenance for drive system",
        );
        break;
      default:
        actions.push(
          "Conduct detailed component inspection",
          "Review operational parameters",
          "Check environmental conditions",
          "Schedule maintenance if required",
        );
    }

    return actions;
  };

  const generateTimelineData = (alert: ExtendedAlert) => {
    const data = [];
    const startTime = new Date(alert.timestamp);
    const endTime = new Date(
      startTime.getTime() + (alert.duration || 0) * 60 * 60 * 1000,
    );

    for (let i = 0; i < 24; i++) {
      const time = new Date(startTime.getTime() - (12 - i) * 60 * 60 * 1000);
      const timeStr = time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      let value = 85 + Math.random() * 15; // Normal operation
      let status: "normal" | "warning" | "fault" = "normal";

      if (time >= startTime && time <= endTime) {
        value = 20 + Math.random() * 30; // Fault period
        status = "fault";
      } else if (
        time >= new Date(startTime.getTime() - 2 * 60 * 60 * 1000) &&
        time < startTime
      ) {
        value = 60 + Math.random() * 20; // Warning period
        status = "warning";
      }

      data.push({ time: timeStr, value: Math.round(value), status });
    }

    return data;
  };

  const handleSubmitNewAlert = async () => {
    if (!plantId || !plant) return;
    
    try {
      await handleCreateAlert(newAlertData);
      
      // Close dialog and reset form
      setIsAddAlertDialogOpen(false);
      setNewAlertData({
        component: "",
        componentType: "Inverter",
        severity: "medium",
        faultType: "Performance Issue",
        message: "",
        duration: 0
      });
    } catch (err) {
      console.error('Failed to create alert:', err);
      setError(err instanceof Error ? err.message : 'Failed to create alert');
    }
  };

  const handleExport = async () => {
    // Show export options
    const exportOptions = [
      { label: 'Export as CSV', action: () => handleExportCSV() },
      { label: 'Export as PDF', action: () => handleExportPDF() }
    ];
    
    // For now, just show options
    const choice = await alert.confirm({
      title: 'Choose Export Format',
      description: 'Select the format for your export',
      confirmText: 'CSV',
      cancelText: 'PDF',
      variant: 'info'
    });
    
    if (choice) {
      handleExportCSV();
    } else {
      handleExportPDF();
    }
  };

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ['Time', 'Component', 'Severity', 'Type', 'Message', 'Duration', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredAlerts.map(alert => [
        new Date(alert.timestamp).toLocaleDateString(),
        `"${alert.component}"`,
        alert.severity,
        `"${alert.faultType}"`,
        `"${alert.message.replace(/"/g, '""')}"`,
        alert.duration ? `${alert.duration.toFixed(1)}h` : 'N/A',
        alert.status
      ].join(','))
    ].join('\n');
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plant-alerts-${plant?.name || 'export'}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    // In a real implementation, this would generate a PDF
    alert.featureUnderConstruction('PDF export');
  };

  const handleExportAlertReportCSV = () => {
    if (!selectedAlert || !plant) return;
    
    const detailData = generateAlertDetailData(selectedAlert);
    
    // Create detailed CSV for the selected alert
    const csvContent = [
      // Alert Metadata
      'Alert Report - Metadata',
      'Alert ID,Plant Name,Component Type,Alert Type,Severity,Start Time,Duration,Resolved By',
      `"${detailData.metadata.alertId}","${detailData.metadata.plantName}","${detailData.metadata.componentType}","${detailData.metadata.alertType}","${detailData.metadata.severity}","${new Date(detailData.metadata.startTime).toLocaleString()}","${detailData.metadata.duration ? detailData.metadata.duration.toFixed(1) + 'h' : 'N/A'}","${detailData.metadata.resolvedBy || 'N/A'}"`,
      '',
      // Root Cause Analysis
      'Root Cause Analysis',
      'Analysis',
      `"${detailData.rootCause.analysis}"`,
      '',
      'Contributing Conditions',
      ...detailData.rootCause.conditions.map(condition => `"${condition}"`),
      '',
      // Suggested Actions
      'Suggested Actions',
      ...detailData.suggestedActions.map((action, index) => `"${index + 1}. ${action}"`),
      '',
      // Component Health
      'Component Health Snapshot',
      'Metric,Value',
      ...(detailData.componentHealth.temperature ? [`Temperature,"${detailData.componentHealth.temperature.toFixed(1)}°C"`] : []),
      ...(detailData.componentHealth.powerOutput ? [`Power Output,"${detailData.componentHealth.powerOutput.toFixed(0)} kW"`] : []),
      `Previous Fault Count,"${detailData.componentHealth.previousFaultCount}"`,
      `Last Maintenance,"${new Date(detailData.componentHealth.lastMaintenanceDate).toLocaleDateString()}"`
    ].join('\n');
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alert-report-${selectedAlert.id}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleExportAlertReportPDF = () => {
    if (!selectedAlert) return;
    
    // In a real implementation, this would generate a PDF
    alert.featureUnderConstruction('Detailed PDF report');
  };


  return (
    <>
      <div className="flex flex-col h-full">
        <PlantNavigation />

        <div className="flex-1 p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-red-800 mb-1">API Connection Error</div>
                  <div className="text-sm text-red-700 mb-2">{error}</div>
                  {(error.includes('API endpoint not found') || error.includes('Network Error') || error.includes('Request failed')) && (
                    <div className="text-xs text-red-600 bg-red-100 p-2 rounded border">
                      <strong>Troubleshooting:</strong>
                      <ul className="mt-1 ml-4 list-disc space-y-1">
                        <li>Check if the API server is running</li>
                        <li>Current environment: <code className="bg-red-200 px-1 rounded">{config.environment}</code></li>
                        <li>API base URL: <code className="bg-red-200 px-1 rounded">{config.isDevelopment ? config.developmentApiUrl : config.isProduction ? config.productionApiUrl : config.stagingApiUrl}</code></li>
                        <li>Alert endpoint: <code className="bg-red-200 px-1 rounded">{getApiEndpoint('alerts')}</code></li>
                        <li>Full alert URL: <code className="bg-red-200 px-1 rounded">{config.isDevelopment ? config.developmentApiUrl : config.isProduction ? config.productionApiUrl : config.stagingApiUrl}{getApiEndpoint('alerts')}</code></li>
                        <li>Ensure the Alert API endpoints are implemented</li>
                        <li>Check browser network tab for detailed error information</li>
                      </ul>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshData}
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Retry
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setError(null)}
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
{/* Compact Header */}
  <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg rounded-xl p-6">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Bell className="w-5 h-5 text-white" />
                </div>
            <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                 {plantName} - Alerts Management
              </h1>
                  <p className="text-muted-foreground">
                    Real-time monitoring and resolution system
              </p>
            </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-3"
                  onClick={refreshData}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-28 h-8 text-sm border-0 bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="24h">Last 24h</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 h-9"
                onClick={() => handleExport()}
              >
                <Download className="w-4 h-4" />
                Export Report
              </Button>
              <Dialog open={isAddAlertDialogOpen} onOpenChange={setIsAddAlertDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2 h-9 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                    <Plus className="w-4 h-4" />
                    New Alert
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Create New Alert
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="component">Component</Label>
                        <Input
                          id="component"
                          value={newAlertData.component}
                          onChange={(e) => setNewAlertData(prev => ({ ...prev, component: e.target.value }))}
                          placeholder="e.g., Inverter Unit 5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="componentType">Component Type</Label>
                        <Select
                          value={newAlertData.componentType}
                          onValueChange={(value) => setNewAlertData(prev => ({ ...prev, componentType: value as any }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {COMPONENT_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="severity">Severity</Label>
                        <Select
                          value={newAlertData.severity}
                          onValueChange={(value) => setNewAlertData(prev => ({ ...prev, severity: value as any }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="faultType">Fault Type</Label>
                        <Select
                          value={newAlertData.faultType}
                          onValueChange={(value) => setNewAlertData(prev => ({ ...prev, faultType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FAULT_TYPES.map((fault) => (
                              <SelectItem key={fault.value} value={fault.value}>
                                {fault.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={newAlertData.message}
                        onChange={(e) => setNewAlertData(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Describe the alert details..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="duration">Duration (hours)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={newAlertData.duration}
                        onChange={(e) => setNewAlertData(prev => ({ ...prev, duration: parseFloat(e.target.value) || 0 }))}
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddAlertDialogOpen(false);
                          setNewAlertData({
                            component: "",
                            componentType: "Inverter",
                            severity: "medium",
                            faultType: "Performance Issue",
                            message: "",
                            duration: 0
                          });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmitNewAlert}
                        disabled={!newAlertData.component || !newAlertData.message || !newAlertData.faultType}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      >
                        Create Alert
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          </div>
          {/* Enhanced KPI Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-red-500 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">Active Alerts</p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">{activeAlerts}</p>
                  </div>
                  <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-red-600/70">
                  {activeAlerts > 0 ? "Requires immediate attention" : "All systems normal"}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Critical</p>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{criticalAlerts}</p>
                  </div>
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-orange-600/70">
                  {criticalAlerts > 0 ? "High priority issues" : "No critical alerts"}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Acknowledged</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{acknowledgedAlerts}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-blue-600/70">
                  In progress resolution
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Avg Resolution</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">{avgResolutionTime.toFixed(1)}h</p>
                  </div>
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Timer className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-green-600/70">
                  Mean time to resolution
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Live Alert Status Banner */}
          {activeAlerts > 0 ? (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-lg" />
                    <div>
                      <span className="text-lg font-semibold text-red-700">
                    {activeAlerts} Active Alert{activeAlerts !== 1 ? 's' : ''} Requiring Attention
                  </span>
                      <p className="text-sm text-red-600/80">
                        Immediate action required to prevent system degradation
                      </p>
                    </div>
                </div>
                {criticalAlerts > 0 && (
                    <div className="flex items-center gap-2 bg-red-100 px-3 py-2 rounded-lg border border-red-200">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-700">
                    {criticalAlerts} Critical
                      </span>
                  </div>
                )}
                </div>
                <div className="text-right">
                  <div className="text-xs text-red-600/70 font-medium">Last updated</div>
                  <div className="text-sm text-red-700">{new Date().toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 bg-green-500 rounded-full shadow-lg" />
                <div>
                  <span className="text-lg font-semibold text-green-700">
                    All Systems Operational
                  </span>
                  <p className="text-sm text-green-600/80">
                    No active alerts detected • {plant.name} running normally
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-xs text-green-600/70 font-medium">Status check</div>
                  <div className="text-sm text-green-700">{new Date().toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Active Alerts Panel */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <Bell className="w-4 h-4 text-red-600" />
                  </div>
                Active Alerts
                {activeAlerts > 0 && (
                    <Badge variant="destructive" className="ml-2 text-sm px-2 py-1">
                    {activeAlerts}
                  </Badge>
                )}
              </CardTitle>
                <div className="flex items-center gap-2">
                  <Select 
                    value={filterValues.severity} 
                    onValueChange={(value) => handleFilterChange("severity", value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    value={filterValues.sortOrder || "critical-to-low"} 
                    onValueChange={(value) => handleFilterChange("sortOrder", value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Sort Order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical-to-low">Critical to Low</SelectItem>
                      <SelectItem value="low-to-critical">Low to Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {alerts
                  .filter((alert) => {
                    const isActive = alert.status === "created" || alert.status === "active";
                    const matchesSearch =
                      alert.message.toLowerCase().includes(filterValues.search.toLowerCase()) ||
                      alert.component.toLowerCase().includes(filterValues.search.toLowerCase()) ||
                      alert.faultType.toLowerCase().includes(filterValues.search.toLowerCase());
                    const matchesSeverity =
                      filterValues.severity === "all" || alert.severity === filterValues.severity;
                    const matchesComponent =
                      filterValues.component === "all" || alert.componentType === filterValues.component;
                    const matchesFaultType =
                      filterValues.faultType === "all" || alert.faultType === filterValues.faultType;
                    
                    return isActive && matchesSearch && matchesSeverity && matchesComponent && matchesFaultType;
                  })
                  .sort((a, b) => {
                    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                    const aOrder = severityOrder[a.severity as keyof typeof severityOrder] || 0;
                    const bOrder = severityOrder[b.severity as keyof typeof severityOrder] || 0;
                    
                    if (filterValues.sortOrder === "low-to-critical") {
                      return aOrder - bOrder;
                    } else {
                      return bOrder - aOrder; // critical-to-low (default)
                    }
                  })
                  .map((alert) => (
                    <div
                      key={alert.id}
                      className="group p-4 border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge
                              variant={getSeverityColor(alert.severity) as any}
                              className="text-xs px-2 py-1 font-medium"
                            >
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="secondary" className="text-xs px-2 py-1">
                              {alert.componentType}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Timer className="w-3 h-3" />
                              {alert.duration ? `${alert.duration.toFixed(1)}h` : 'N/A'}
                          </div>
                          </div>
                          <div className="font-semibold text-base mb-1">
                            {alert.component}
                          </div>
                          <div className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {alert.message}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Started: {new Date(alert.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Case 1: Created status - View, Acknowledge, Resolve */}
                          {alert.status === "created" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAcknowledge(alert.id)}
                                disabled={processingAlerts.has(alert.id)}
                                className="text-xs h-8 px-3 border-orange-200 hover:bg-orange-50"
                              >
                                {processingAlerts.has(alert.id) ? (
                                  <>
                                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  'Acknowledge'
                                )}
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleResolve(alert.id)}
                                disabled={processingAlerts.has(alert.id)}
                                className="text-xs h-8 px-3 bg-green-600 hover:bg-green-700"
                              >
                                {processingAlerts.has(alert.id) ? (
                                  <>
                                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  'Resolve'
                                )}
                              </Button>
                            </>
                          )}
                          
                          {/* Case 2: Active status - View, Resolve */}
                          {alert.status === "active" && (
                            <Button
                              size="sm"
                              onClick={() => handleResolve(alert.id)}
                              disabled={processingAlerts.has(alert.id)}
                              className="text-xs h-8 px-3 bg-green-600 hover:bg-green-700"
                            >
                              {processingAlerts.has(alert.id) ? (
                                <>
                                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                'Resolve'
                              )}
                            </Button>
                          )}
                          
                          {/* Case 3: All statuses have View */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(alert)}
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                {alerts.filter((alert) => alert.status === "created" || alert.status === "active").length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="text-xl font-semibold text-green-700 mb-2">No Active Alerts</div>
                    <div className="text-sm text-muted-foreground mb-4">
                      All systems operating normally • Last checked: {new Date().toLocaleTimeString()}
                    </div>
                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                      <Shield className="w-4 h-4" />
                      {plant.name} Status: Operational
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Alert Analysis Dashboard */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Last 30 days
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Total Alerts Status Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Enhanced Total Alerts Pie Chart */}
              <Card className="lg:col-span-1 shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-center flex items-center justify-center gap-2">
                    <Gauge className="w-5 h-5 text-blue-600" />
                    Alert Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Unopen", value: alertStatusSummary.unopen, fill: "#3B82F6" },
                            { name: "In Progress", value: alertStatusSummary.inProgress, fill: "#10B981" },
                            { name: "Closed", value: alertStatusSummary.closed, fill: "#EF4444" }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={85}
                          dataKey="value"
                          label={false}
                          labelLine={false}
                        >
                        </Pie>
                        <Tooltip 
                          formatter={(value, name) => [value, name]}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm" />
                          <span className="text-sm font-medium">Unopen</span>
                        </div>
                        <span className="text-sm font-bold text-blue-700">{alertStatusSummary.unopen}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm" />
                          <span className="text-sm font-medium">In Progress</span>
                        </div>
                        <span className="text-sm font-bold text-green-700">{alertStatusSummary.inProgress}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm" />
                          <span className="text-sm font-medium">Closed</span>
                        </div>
                        <span className="text-sm font-bold text-red-700">{alertStatusSummary.closed}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Resolve Time */}
              <Card className="lg:col-span-1 shadow-lg border-0 bg-gradient-to-br from-white to-green-50/30 dark:from-gray-900 dark:to-green-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-center flex items-center justify-center gap-2">
                    <Timer className="w-5 h-5 text-green-600" />
                    Resolution Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div className="text-sm font-semibold text-green-600 mb-1">Best Time</div>
                      <div className="text-3xl font-bold text-green-700">{resolutionMetrics.bestResolutionTime.value} {resolutionMetrics.bestResolutionTime.unit}</div>
                      <div className="text-xs text-green-600/70 mt-1">Fastest resolution</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                      <div className="text-sm font-semibold text-blue-600 mb-1">Average Time</div>
                      <div className="text-3xl font-bold text-blue-700">{resolutionMetrics.averageResolutionTime.value} {resolutionMetrics.averageResolutionTime.unit}</div>
                      <div className="text-xs text-blue-600/70 mt-1">Mean resolution</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
                      <div className="text-sm font-semibold text-orange-600 mb-1">SLA Target</div>
                      <div className="text-lg font-bold text-orange-700">{resolutionMetrics.slaTarget.value} {resolutionMetrics.slaTarget.unit}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Severity Monthly Chart */}
              <Card className="lg:col-span-2 shadow-lg border-0 bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-center flex items-center justify-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Severity Trends - Monthly
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={severityTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" fontSize={12} stroke="#6b7280" />
                      <YAxis fontSize={12} stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      {/* <Legend /> */}
                      <Bar dataKey="Low" fill="#10B981" name="Low" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Moderate" fill="#F59E0B" name="Moderate" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="High" fill="#3B82F6" name="High" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Critical" fill="#EF4444" name="Critical" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Section wise and Monthly Alerts Handling */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Enhanced Section wise Donut Chart */}
              <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-center flex items-center justify-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    Component Distribution (Jan 2025)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-6">
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={componentDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          dataKey="value"
                          label={false}
                          labelLine={false}
                        />
                        <Tooltip 
                          formatter={(value, name) => [value, name]}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {componentDistribution.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full shadow-sm flex-shrink-0"
                              style={{ backgroundColor: entry.fill }}
                            />
                            <span className="text-xs font-medium truncate">{entry.name}</span>
                          </div>
                          <span className="text-xs font-bold text-muted-foreground">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Monthly Alerts Handling */}
              <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-teal-50/30 dark:from-gray-900 dark:to-teal-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-center flex items-center justify-center gap-2">
                    <Calendar className="w-5 h-5 text-teal-600" />
                    Monthly Resolution Trends
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={resolutionTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" fontSize={12} stroke="#6b7280" />
                      <YAxis fontSize={12} stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      {/* <Legend /> */}
                      <Bar dataKey="Unopen" fill="#3B82F6" name="Unopen" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Closed" fill="#10B981" name="Closed" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="InProgress" fill="#F59E0B" name="In Progress" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Enhanced Alert Escalation Notice */}
          {criticalAlerts > 2 && (
            <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-orange-800 mb-1">
                      Multiple Critical Alerts Detected
                    </div>
                    <div className="text-sm text-orange-700">
                      {criticalAlerts} critical alerts require immediate attention. Consider escalating to operations team for priority handling.
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                      <Info className="w-4 h-4 mr-2" />
                      Details
                    </Button>
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                    Escalate
                  </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Historical Alerts Log */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  Historical Alerts
                  <Badge variant="secondary" className="ml-2 text-sm px-2 py-1">
                    {filteredAlerts.length} of {alerts.length}
                  </Badge>
                </CardTitle>
                <FilterBar
                  config={ALERT_FILTER_CONFIG}
                  values={filterValues}
                  onValueChange={handleFilterChange}
                  className="flex-wrap"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                    <tr>
                      <th className="text-left p-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                        Time
                      </th>
                      <th className="text-left p-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                        Component
                      </th>
                      <th className="text-left p-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                        Severity
                      </th>
                      <th className="text-left p-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                        Type
                      </th>
                      <th className="text-left p-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                        Message
                      </th>
                      <th className="text-left p-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                        Duration
                      </th>
                      <th className="text-left p-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                      <th className="text-left p-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAlerts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-12 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                              <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-gray-700 mb-1">No alerts found</div>
                              <div className="text-sm text-gray-500">Try adjusting your search or filter criteria</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredAlerts.map((alert) => {
                        const StatusIcon = getStatusIcon(alert.status);
                        return (
                          <tr
                            key={alert.id}
                            className="border-t hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                          <td className="p-4 text-sm">
                            <div className="font-medium">
                            {new Date(alert.timestamp).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <div className="font-semibold text-sm">
                                {alert.component}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {alert.componentType}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge
                              variant={getSeverityColor(alert.severity) as any}
                              className="text-xs px-2 py-1 font-medium"
                            >
                              {alert.severity.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm font-medium">{alert.faultType}</td>
                          <td className="p-4 text-sm max-w-xs">
                            <div className="line-clamp-2">
                            {alert.message}
                            </div>
                          </td>
                          <td className="p-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Timer className="w-3 h-3 text-muted-foreground" />
                              {alert.duration ? `${alert.duration.toFixed(1)}h` : 'N/A'}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge
                              variant={getStatusColor(alert.status) as any}
                              className="text-xs px-2 py-1 font-medium"
                            >
                              {alert.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(alert)}
                                title="View Details"
                                className="h-8 w-8 p-0 hover:bg-blue-100"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {/* Case 1: Created status - View, Acknowledge, Resolve */}
                              {alert.status === "created" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAcknowledge(alert.id)}
                                    disabled={processingAlerts.has(alert.id)}
                                    className="text-xs h-8 px-3 border-orange-200 hover:bg-orange-50"
                                  >
                                    {processingAlerts.has(alert.id) ? (
                                      <RefreshCw className="w-3 h-3 animate-spin" />
                                    ) : (
                                      'Ack'
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleResolve(alert.id)}
                                    disabled={processingAlerts.has(alert.id)}
                                    className="text-xs h-8 px-3 bg-green-600 hover:bg-green-700"
                                  >
                                    {processingAlerts.has(alert.id) ? (
                                      <RefreshCw className="w-3 h-3 animate-spin" />
                                    ) : (
                                      'Resolve'
                                    )}
                                  </Button>
                                </>
                              )}
                              
                              {/* Case 2: Active status - View, Resolve */}
                              {alert.status === "active" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleResolve(alert.id)}
                                  disabled={processingAlerts.has(alert.id)}
                                  className="text-xs h-8 px-3 bg-green-600 hover:bg-green-700"
                                >
                                  {processingAlerts.has(alert.id) ? (
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                  ) : (
                                    'Resolve'
                                  )}
                                </Button>
                              )}
                              
                              {/* Case 3: All statuses have View (other statuses only have view) */}
                            </div>
                          </td>
                        </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                {/* Enhanced Alert Statistics Footer */}
                {filteredAlerts.length > 0 && (
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Showing {filteredAlerts.length} of {alerts.length} total alerts
                      </span>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Timer className="w-4 h-4" />
                        Avg resolution time: {avgResolutionTime.toFixed(1)}h
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
                          <Download className="w-4 h-4" />
                          Export
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Star className="w-4 h-4" />
                          Bookmark
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Alert Detail Panel */}
      {isDetailPanelOpen && selectedAlert && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-[9999] flex">
          {/* Backdrop */}
          <div className="flex-1" onClick={handleCloseDetailPanel} />

          {/* Enhanced Detail Panel */}
          <div className="w-[900px] bg-white dark:bg-gray-900 shadow-2xl flex flex-col h-full border-l border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 border-b border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-2xl text-gray-900 dark:text-white">Alert Details</h3>
                    <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                      {selectedAlert.component}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedAlert.faultType} • {selectedAlert.severity.toUpperCase()}
                  </p>
                </div>
              </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 border-gray-300 hover:bg-gray-50"
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={handleExportAlertReportCSV}>
                        <FileDown className="w-4 h-4 mr-2" />
                        Export as CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportAlertReportPDF}>
                        <Download className="w-4 h-4 mr-2" />
                        Export as PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseDetailPanel}
                    className="h-10 w-10 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                    <X className="w-5 h-5" />
              </Button>
                </div>
              </div>
            </div>

            {/* Enhanced Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {(() => {
                const detailData = generateAlertDetailData(selectedAlert);
                return (
                  <>
                    {/* 1. Enhanced Basic Alert Metadata */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h4 className="font-bold text-xl text-gray-900 dark:text-white">Alert Metadata</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">
                              Alert ID
                            </span>
                            <div className="font-mono text-sm bg-white dark:bg-gray-700 p-2 rounded-lg border">
                              {detailData.metadata.alertId}
                            </div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">
                              Plant Name
                            </span>
                            <div className="text-sm font-medium">
                              {detailData.metadata.plantName}
                            </div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">
                              Component Type
                            </span>
                            <div className="text-sm font-medium">
                              {detailData.metadata.componentType}
                            </div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">
                              Alert Type
                            </span>
                            <div className="text-sm font-medium">
                              {detailData.metadata.alertType}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">
                              Severity
                            </span>
                            <div className="mt-1">
                              <Badge
                                variant={
                                  getSeverityColor(
                                    detailData.metadata.severity as "high" | "low" | "critical" | "medium",
                                  ) as any
                                }
                                className="text-sm px-3 py-1"
                              >
                                {detailData.metadata.severity.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">
                              Start Time
                            </span>
                            <div className="text-sm font-medium">
                              {new Date(
                                detailData.metadata.startTime,
                              ).toLocaleString()}
                            </div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">
                              Duration
                            </span>
                            <div className="text-sm font-medium flex items-center gap-2">
                              <Timer className="w-4 h-4" />
                              {detailData.metadata.duration ? `${detailData.metadata.duration.toFixed(1)} hours` : 'N/A'}
                            </div>
                          </div>
                          {detailData.metadata.resolvedBy && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">
                                Resolved By
                              </span>
                              <div className="text-sm font-medium flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {detailData.metadata.resolvedBy}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 2. Enhanced Root Cause Analysis */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                          <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h4 className="font-bold text-xl text-gray-900 dark:text-white">Root Cause Analysis</h4>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-800">
                        <div className="text-base leading-relaxed mb-6 text-gray-700 dark:text-gray-300">
                          {detailData.rootCause.analysis}
                        </div>
                        <div className="space-y-4">
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            Contributing Conditions:
                          </span>
                          <ul className="space-y-3">
                            {detailData.rootCause.conditions.map(
                              (condition, index) => (
                                <li
                                  key={index}
                                  className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg"
                                >
                                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                                  {condition}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* 3. Enhanced Suggested Actions */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                          <Wrench className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <h4 className="font-bold text-xl text-gray-900 dark:text-white">Suggested Actions & Resolutions</h4>
                      </div>
                    <div className="space-y-4">
                        {detailData.suggestedActions.map((action, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200 dark:border-green-800"
                          >
                            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">{action}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 4. Enhanced Component Health Snapshot */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                          <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h4 className="font-bold text-xl text-gray-900 dark:text-white">Component Health Snapshot</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        {detailData.componentHealth.temperature && (
                          <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-2xl border border-orange-200 dark:border-orange-800">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                                <Thermometer className="w-5 h-5 text-orange-600" />
                              </div>
                              <span className="text-base font-semibold text-gray-900 dark:text-white">
                                Temperature at Fault
                              </span>
                            </div>
                            <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                              {detailData.componentHealth.temperature.toFixed(1)}°C
                            </div>
                          </div>
                        )}
                        {detailData.componentHealth.powerOutput && (
                          <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                <Zap className="w-5 h-5 text-blue-600" />
                              </div>
                              <span className="text-base font-semibold text-gray-900 dark:text-white">
                                Power Output at Fault
                              </span>
                            </div>
                            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                              {detailData.componentHealth.powerOutput.toFixed(0)} kW
                            </div>
                          </div>
                        )}
                        <div className="p-6 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 rounded-2xl border border-red-200 dark:border-red-800">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                              <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <span className="text-base font-semibold text-gray-900 dark:text-white">
                              Previous Fault Count
                            </span>
                          </div>
                          <div className="text-3xl font-bold text-red-700 dark:text-red-300">
                            {detailData.componentHealth.previousFaultCount}
                          </div>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                              <Settings className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="text-base font-semibold text-gray-900 dark:text-white">
                              Last Maintenance
                            </span>
                          </div>
                          <div className="text-lg font-bold text-green-700 dark:text-green-300">
                            {new Date(detailData.componentHealth.lastMaintenanceDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 5. Enhanced Alert Timeline Graph */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h4 className="font-bold text-xl text-gray-900 dark:text-white">Alert Timeline</h4>
                      </div>
                      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-800">
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={detailData.timelineData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                              dataKey="time"
                              type="category"
                              allowDuplicatedCategory={false}
                              fontSize={12}
                              stroke="#6b7280"
                            />
                            <YAxis
                              domain={[0, 100]}
                              type="number"
                              allowDataOverflow={false}
                              fontSize={12}
                              stroke="#6b7280"
                            />
                            <Tooltip
                              formatter={(value, name) => [
                                `${value}%`,
                                selectedAlert.componentType === "Inverter"
                                  ? "Efficiency"
                                  : "Performance",
                              ]}
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '12px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#6366f1"
                              strokeWidth={3}
                              dot={(props: any) => {
                                const { cx, cy, payload } = props;
                                const color =
                                  payload?.status === "fault"
                                    ? "#EF4444"
                                    : payload?.status === "warning"
                                      ? "#F59E0B"
                                      : "#10B981";
                                return (
                                  <circle
                                    cx={cx}
                                    cy={cy}
                                    r={4}
                                    fill={color}
                                    stroke="white"
                                    strokeWidth={2}
                                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                                  />
                                );
                              }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                        <div className="flex items-center justify-center gap-8 mt-6">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded-full shadow-sm" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Normal Operation</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-sm" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Warning Period</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded-full shadow-sm" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fault Occurrence</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 6. Enhanced Maintenance Log Link */}
                    {detailData.maintenanceLog && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                            <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <h4 className="font-bold text-xl text-gray-900 dark:text-white">Related Maintenance Log</h4>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                                {detailData.maintenanceLog.description}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  Completed on {new Date(detailData.maintenanceLog.date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                by {detailData.maintenanceLog.technician}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 ml-4"
                            >
                              <ExternalLink className="w-4 h-4" />
                              View Full Log
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Enhanced Footer with Export */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div className="font-medium">Report Generated</div>
                    <div className="text-xs">
                      {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                </div>
                  </div>
                  <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" />
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div className="font-medium">Alert ID</div>
                    <div className="text-xs font-mono">{selectedAlert.id}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportAlertReportPDF}
                    className="gap-2 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                  >
                    <FileDown className="w-4 h-4" />
                    Export PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportAlertReportCSV}
                    className="gap-2 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCloseDetailPanel}
                    className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <X className="w-4 h-4" />
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
