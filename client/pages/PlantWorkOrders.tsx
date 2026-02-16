import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Plant } from "@shared/interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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
  ClipboardList,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  ArrowUp,
  Eye,
  MessageSquare,
  Upload,
  FileText,
  Camera,
  Wrench,
  Zap,
  Activity,
  Target,
  Phone,
  MapPin,
  Star,
  TrendingUp,
  Download,
  Edit,
  MoreHorizontal,
  PlayCircle,
  X,
  ChevronRight,
  Info,
} from "lucide-react";
import PlantNavigation from "@/components/PlantNavigation";
import WorkOrderCreateDialog, { useCompleteWorkOrder, useUpdateWorkOrder } from "@/components/WorkOrderCreateDialog";
import ApiService from "@/lib/api";
import { useAlert } from "@/hooks/use-alert";

// API Response interface matching the backend response
interface WorkOrderApiResponse {
  Id: string;
  AlertId: string;
  Title: string;
  Description: string;
  Component: string;
  Type: "manual" | "alert_triggered";
  Severity: "critical" | "high" | "medium" | "low";
  Status: "not_started" | "in_progress" | "paused" | "completed" | "escalated";
  AssignedTo: {
    Id: string;
    Name: string;
    Title: string;
    Avatar: string;
    Phone: string;
  };
  CreatedBy: string;
  CreatedDate: string;
  TargetCompletionDate: string;
  ActualCompletionDate?: string;
  EstimatedDuration: number;
  ActualDuration?: number;
  ChecklistProgress: {
    Completed: number;
    Total: number;
  };
  Priority: "urgent" | "high" | "normal" | "low";
  FaultType: string;
  Location: string;
  Uploads: Array<{
    Id: string;
    Name: string;
    Type: "photo" | "document" | "report";
    UploadedBy: string;
    UploadedAt: string;
    Size: string;
  }>;
  Comments: Array<{
    Id: string;
    Author: string;
    Role: string;
    Message: string;
    Timestamp: string;
    Type: "update" | "comment" | "escalation";
  }>;
  Checklist: Array<{
    Id: string;
    Task: string;
    Completed: boolean;
    CompletedBy?: string;
    CompletedAt?: string;
    Notes?: string;
    PhotoRequired: boolean;
    PhotoUploaded?: boolean;
  }>;
  PlantId: number;
  PartitionKey: string;
}

// Frontend interface for consistency
interface WorkOrder {
  id: string;
  alertId?: string;
  title: string;
  description: string;
  component: string;
  type: "manual" | "alert_triggered";
  severity: "critical" | "high" | "medium" | "low";
  status: "not_started" | "in_progress" | "paused" | "completed" | "escalated";
  assignedTo: {
    id: string;
    name: string;
    title: string;
    avatar: string;
    phone: string;
  };
  createdBy: string;
  createdDate: string;
  targetCompletionDate: string;
  actualCompletionDate?: string;
  estimatedDuration: number;
  actualDuration?: number;
  checklistProgress: {
    completed: number;
    total: number;
  };
  priority: "urgent" | "high" | "normal" | "low";
  faultType: string;
  location: string;
  uploads: Array<{
    id: string;
    name: string;
    type: "photo" | "document" | "report";
    uploadedBy: string;
    uploadedAt: string;
    size: string;
  }>;
  comments: Array<{
    id: string;
    author: string;
    role: string;
    message: string;
    timestamp: string;
    type: "update" | "comment" | "escalation";
  }>;
  checklist: Array<{
    id: string;
    task: string;
    completed: boolean;
    completedBy?: string;
    completedAt?: string;
    notes?: string;
    photoRequired: boolean;
    photoUploaded?: boolean;
  }>;
}

// Helper function to convert API response to frontend format
const convertApiResponseToWorkOrder = (apiResponse: WorkOrderApiResponse): WorkOrder => {
  return {
    id: apiResponse.Id,
    alertId: apiResponse.AlertId,
    title: apiResponse.Title,
    description: apiResponse.Description,
    component: apiResponse.Component,
    type: apiResponse.Type,
    severity: apiResponse.Severity,
    status: apiResponse.Status,
    assignedTo: {
      id: apiResponse.AssignedTo.Id,
      name: apiResponse.AssignedTo.Name,
      title: apiResponse.AssignedTo.Title,
      avatar: apiResponse.AssignedTo.Avatar,
      phone: apiResponse.AssignedTo.Phone,
    },
    createdBy: apiResponse.CreatedBy,
    createdDate: apiResponse.CreatedDate,
    targetCompletionDate: apiResponse.TargetCompletionDate,
    actualCompletionDate: apiResponse.ActualCompletionDate,
    estimatedDuration: apiResponse.EstimatedDuration,
    actualDuration: apiResponse.ActualDuration,
    checklistProgress: {
      completed: apiResponse.ChecklistProgress.Completed,
      total: apiResponse.ChecklistProgress.Total,
    },
    priority: apiResponse.Priority,
    faultType: apiResponse.FaultType,
    location: apiResponse.Location,
    uploads: apiResponse.Uploads.map(upload => ({
      id: upload.Id,
      name: upload.Name,
      type: upload.Type,
      uploadedBy: upload.UploadedBy,
      uploadedAt: upload.UploadedAt,
      size: upload.Size,
    })),
    comments: apiResponse.Comments.map(comment => ({
      id: comment.Id,
      author: comment.Author,
      role: comment.Role,
      message: comment.Message,
      timestamp: comment.Timestamp,
      type: comment.Type,
    })),
    checklist: apiResponse.Checklist.map(item => ({
      id: item.Id,
      task: item.Task,
      completed: item.Completed,
      completedBy: item.CompletedBy,
      completedAt: item.CompletedAt,
      notes: item.Notes,
      photoRequired: item.PhotoRequired,
      photoUploaded: item.PhotoUploaded,
    })),
  };
};

export default function PlantWorkOrders() {
  const alert = useAlert();
  const { plantId } = useParams<{ plantId: string }>();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(
    null,
  );
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [workOrderToEdit, setWorkOrderToEdit] = useState<WorkOrder | null>(null);
  
  // Get the complete work order function
  const completeWorkOrder = useCompleteWorkOrder();
  const updateWorkOrder = useUpdateWorkOrder();

  // Function to fetch work orders from API
  const fetchWorkOrders = async () => {
    if (!plantId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.get<WorkOrderApiResponse[]>(`/workorders`);
      const convertedWorkOrders = response.map(convertApiResponseToWorkOrder);
      setWorkOrders(convertedWorkOrders);
    } catch (err) {
      console.error('Error fetching work orders:', err);
      setError('Failed to fetch work orders. Please try again.');
      // Fallback to empty array
      setWorkOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle work order creation success
  const handleWorkOrderCreated = async (workOrder: any) => {
    console.log("New work order created:", workOrder);
    
    // Close the dialog
    setIsCreateDialogOpen(false);
    
    // Refresh the work orders list
    await fetchWorkOrders();
  };

  // Function to handle work order completion
  const handleCompleteWorkOrder = async (workOrderId: string) => {
    if (!selectedWorkOrder) return;
    
    try {
      setIsCompleting(true);
      
      await completeWorkOrder(workOrderId, {
        completedBy: "Current User", // You can get this from user context
        completionNotes: "Work order completed successfully",
        completionDate: new Date()
      });
      
      // Refresh the work orders list to show updated status
      await fetchWorkOrders();
      
      // Close the detail panel
      handleCloseDetailPanel();
      
      console.log("Work order completed successfully");
    } catch (error) {
      console.error("Error completing work order:", error);
      // You can add a toast notification here
    } finally {
      setIsCompleting(false);
    }
  };

  useEffect(() => {
    if (plantId) {
      // Get plant from localStorage or set a default plant object
      const storedPlant = localStorage.getItem('selectedPlant');
      if (storedPlant) {
        try {
          const plantData = JSON.parse(storedPlant);
          setPlant(plantData);
        } catch (error) {
          console.error('Error parsing plant data:', error);
          // Set a default plant object if parsing fails
          setPlant({
            id: plantId,
            name: `Plant ${plantId}`,
            location: { name: 'Unknown Location' },
            capacity: 0,
            status: 'operational'
          });
        }
      } else {
        // Set a default plant object if no stored plant
        setPlant({
          id: plantId,
          name: `Plant ${plantId}`,
          location: { name: 'Unknown Location' },
          capacity: 0,
          status: 'operational'
        });
      }
      
      // Fetch work orders when plant is loaded
      fetchWorkOrders();
    }
  }, [plantId]);

  if (!plant) {
    return <div>Plant not found</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading work orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Work Orders</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchWorkOrders}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Apply search and filters to all work orders
  const filteredWorkOrders = workOrders.filter((wo) => {
    const matchesSearch =
      wo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.component.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.assignedTo.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || wo.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesAssignee =
      assigneeFilter === "all" || wo.assignedTo.id === assigneeFilter;
    const matchesPriority =
      priorityFilter === "all" || wo.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesAssignee && matchesPriority;
  });

  // Apply filters to active and historical work orders (case-insensitive)
  const filteredActiveWorkOrders = filteredWorkOrders.filter((wo) => wo.status?.toLowerCase() !== "completed");
  const filteredHistoricalWorkOrders = filteredWorkOrders.filter((wo) => wo.status?.toLowerCase() === "completed");

  const getStatusIcon = (status: WorkOrder["status"]) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case "not_started":
        return Clock;
      case "in_progress":
        return PlayCircle;
      case "paused":
        return Pause;
      case "completed":
        return CheckCircle;
      case "escalated":
        return ArrowUp;
      default:
        return XCircle;
    }
  };

  const getStatusColor = (status: WorkOrder["status"]) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case "not_started":
        return "secondary";
      case "in_progress":
        return "default";
      case "paused":
        return "warning";
      case "completed":
        return "success";
      case "escalated":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getPriorityColor = (priority: WorkOrder["priority"]) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "warning";
      case "normal":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getSeverityColor = (severity: WorkOrder["severity"]) => {
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

  const handleViewWorkOrder = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
    setIsDetailPanelOpen(true);
  };

  const handleCloseDetailPanel = () => {
    setIsDetailPanelOpen(false);
    setSelectedWorkOrder(null);
  };

  const handleEditWorkOrder = (workOrder: WorkOrder) => {
    setWorkOrderToEdit(workOrder);
    setIsEditDialogOpen(true);
    // Close the detail panel when opening edit dialog
    setIsDetailPanelOpen(false);
    setSelectedWorkOrder(null);
  };

  const handleWorkOrderUpdated = (updatedWorkOrder: any) => {
    console.log('Work order updated:', updatedWorkOrder);
    // Refresh the work orders list
    fetchWorkOrders();
    // Close the edit dialog
    setIsEditDialogOpen(false);
    setWorkOrderToEdit(null);
  };

  const handleWorkOrderDataChange = (updatedWorkOrder: any) => {
    console.log('Work order data changed:', updatedWorkOrder);
    // Update the workOrderToEdit state
    setWorkOrderToEdit(updatedWorkOrder);
  };

const handleExportList = () => {
  if (!plant) return;
  alert.featureUnderConstruction('Work order list export');
};


  const uniqueAssignees = Array.from(
    new Set(workOrders.map((wo) => wo.assignedTo.name)),
  );

  // Calculate status counts from API response (case-insensitive)
  const statusCounts = {
    total: workOrders.length,
    not_started: workOrders.filter((wo) => wo.status?.toLowerCase() === "not_started").length,
    in_progress: workOrders.filter((wo) => wo.status?.toLowerCase() === "in_progress").length,
    completed: workOrders.filter((wo) => wo.status?.toLowerCase() === "completed").length,
    escalated: workOrders.filter((wo) => wo.status?.toLowerCase() === "escalated").length,
  };

  // Filter work orders for active (not completed) and historical (completed) - case-insensitive
  const activeWorkOrders = workOrders.filter((wo) => wo.status?.toLowerCase() !== "completed");
  const historicalWorkOrders = workOrders.filter((wo) => wo.status?.toLowerCase() === "completed");

  return (
    <div className="flex flex-col h-full">
      <PlantNavigation />

      <div className="flex-1 p-4 space-y-4">
        {/* Compact Header */}
        <div className="flex items-center justify-between py-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-primary" />
              Work Orders
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              <Calendar className="w-3 h-3" />
              Week
            </Button>
            <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={handleExportList}>
              <Download className="w-3 h-3" />
              Export
            </Button>
            <Button
              size="sm"
              className="gap-1 text-xs"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <ClipboardList className="w-3 h-3" />+ Create
            </Button>
          </div>
        </div>

        {/* Compact Summary Cards */}
        <div className="grid grid-cols-5 gap-2">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-primary">{statusCounts.total}</div>
              <div className="text-[10px] text-muted-foreground leading-tight">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-gray-600">{statusCounts.not_started}</div>
              <div className="text-[10px] text-muted-foreground leading-tight">Not Started</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-blue-600">{statusCounts.in_progress}</div>
              <div className="text-[10px] text-muted-foreground leading-tight">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-green-600">{statusCounts.completed}</div>
              <div className="text-[10px] text-muted-foreground leading-tight">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-red-600">{statusCounts.escalated}</div>
              <div className="text-[10px] text-muted-foreground leading-tight">Escalated</div>
            </CardContent>
          </Card>
        </div>

        {/* Compact Filters */}
        <Card>
          <CardContent className="p-3">
            <div className="grid grid-cols-4 gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 h-8 text-xs"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  {uniqueAssignees.map((assignee) => (
                    <SelectItem key={assignee} value={assignee}>
                      {assignee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Work Orders List with Tabs */}
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="active" className="w-full">
              <div className="border-b border-gray-200 px-4 pt-2">
                <TabsList className="grid w-full grid-cols-2 h-10 bg-gray-50/50">
                  <TabsTrigger value="active" className="gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700">
                    <Activity className="w-4 h-4" />
                    Active
                    <Badge variant="secondary" className="ml-1 text-xs px-2 py-0.5 rounded-full font-semibold">
                      {activeWorkOrders.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="historical" className="gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700">
                    <CheckCircle className="w-4 h-4" />
                    Historical
                    <Badge variant="secondary" className="ml-1 text-xs px-2 py-0.5 rounded-full font-semibold">
                      {historicalWorkOrders.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="active" className="m-0">
                <div className="space-y-0">
                  {filteredActiveWorkOrders.map((workOrder) => {
                const StatusIcon = getStatusIcon(workOrder.status);
                const progressPercentage =
                  (workOrder.checklistProgress.completed /
                    workOrder.checklistProgress.total) *
                  100;

                return (
                  <div
                    key={workOrder.id}
                    className="group border-b last:border-b-0 p-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-300 cursor-pointer relative overflow-hidden"
                    onClick={() => handleViewWorkOrder(workOrder)}
                  >
                    {/* Modern gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="flex items-start gap-4 relative z-10">
                      {/* Modern Work Order Icon & Priority */}
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border-2 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md ${
                            workOrder.priority === "urgent"
                              ? "bg-gradient-to-br from-red-50 to-red-100 border-red-200"
                              : workOrder.priority === "high"
                                ? "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
                                : workOrder.priority === "normal"
                                  ? "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
                                  : "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200"
                          }`}
                        >
                          <StatusIcon
                            className={`w-5 h-5 ${
                              workOrder.priority === "urgent"
                                ? "text-red-600"
                                : workOrder.priority === "high"
                                  ? "text-orange-600"
                                  : workOrder.priority === "normal"
                                    ? "text-blue-600"
                                    : "text-gray-600"
                            }`}
                          />
                        </div>
                        <Badge
                          variant={getPriorityColor(workOrder.priority) as any}
                          className="text-[10px] px-2 py-0.5 rounded-full font-semibold shadow-sm"
                        >
                          {workOrder.priority.charAt(0).toUpperCase()}
                        </Badge>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 space-y-2">
                        {/* Modern Header */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-base text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                                {workOrder.title}
                              </h3>
                              <Badge
                                variant={
                                  getStatusColor(workOrder.status) as any
                                }
                                className="text-xs px-2 py-1 rounded-full font-medium shadow-sm"
                              >
                                {workOrder.status.replace("_", " ").toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-700">
                                {workOrder.id}
                              </span>
                              {workOrder.alertId && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <span className="font-mono text-xs bg-orange-100 px-2 py-1 rounded-md text-orange-700">
                                    {workOrder.alertId}
                                  </span>
                                </>
                              )}
                              <Badge
                                variant={
                                  workOrder.type === "alert_triggered"
                                    ? "destructive"
                                    : "default"
                                }
                                className="text-xs px-2 py-1 rounded-full font-medium"
                              >
                                {workOrder.type === "alert_triggered" ? "Alert" : "Manual"}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right text-xs text-gray-500 space-y-1">
                            <div className="flex items-center gap-1 justify-end">
                              <Calendar className="w-3 h-3" />
                              <span className="font-medium">{new Date(workOrder.createdDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1 justify-end">
                              <Clock className="w-3 h-3" />
                              <span>Due: {new Date(workOrder.targetCompletionDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Modern Details Grid */}
                        <div className="grid grid-cols-4 gap-3 text-xs">
                          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1.5">
                            <Wrench className="w-3 h-3 text-blue-600" />
                            <span className="font-medium truncate text-gray-700">{workOrder.component}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1.5">
                            <MapPin className="w-3 h-3 text-green-600" />
                            <span className="truncate text-gray-700">{workOrder.location}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1.5">
                            <User className="w-3 h-3 text-purple-600" />
                            <Avatar className="w-4 h-4 border border-gray-200">
                              <AvatarFallback className="text-[10px] bg-gradient-to-br from-blue-100 to-purple-100">
                                {workOrder.assignedTo.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate text-gray-700 font-medium">{workOrder.assignedTo.name}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1.5">
                            <Clock className="w-3 h-3 text-orange-600" />
                            <span className="text-gray-700 font-medium">
                              {workOrder.actualDuration
                                ? `${workOrder.actualDuration}m`
                                : `${workOrder.estimatedDuration}m`}
                            </span>
                          </div>
                        </div>

                        {/* Modern Progress Bar */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span className="font-medium">Progress</span>
                              <span className="font-semibold">{workOrder.checklistProgress.completed}/{workOrder.checklistProgress.total}</span>
                            </div>
                            <Progress 
                              value={progressPercentage} 
                              className="h-2 bg-gray-200 rounded-full overflow-hidden" 
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            {workOrder.uploads.length > 0 && (
                              <div className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                                <Upload className="w-3 h-3" />
                                <span className="font-medium">{workOrder.uploads.length}</span>
                              </div>
                            )}
                            {workOrder.comments.length > 0 && (
                              <div className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                                <MessageSquare className="w-3 h-3" />
                                <span className="font-medium">{workOrder.comments.length}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Modern Description */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg p-3 border border-gray-200/50">
                          <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                            {workOrder.description}
                          </p>
                        </div>
                      </div>

                      {/* Modern Action Arrow */}
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 group-hover:bg-blue-100 transition-colors duration-200">
                        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors duration-200" />
                      </div>
                    </div>
                  </div>
                );
              })}

                  {filteredActiveWorkOrders.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <h3 className="text-base font-medium mb-1">No Active Work Orders</h3>
                      <p className="text-xs">
                        {activeWorkOrders.length === 0 
                          ? "All work orders have been completed" 
                          : "No work orders match your current filters"}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="historical" className="m-0">
                <div className="space-y-0">
                  {filteredHistoricalWorkOrders.map((workOrder) => {
                    const StatusIcon = getStatusIcon(workOrder.status);
                    const progressPercentage =
                      (workOrder.checklistProgress.completed /
                        workOrder.checklistProgress.total) *
                      100;

                    return (
                      <div
                        key={workOrder.id}
                        className="border-b last:border-b-0 p-3 hover:bg-muted/30 transition-colors cursor-pointer bg-green-50/30"
                        onClick={() => handleViewWorkOrder(workOrder)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Work Order Icon & Status */}
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                            <Badge variant="success" className="text-[10px] px-1 py-0">
                              ✓
                            </Badge>
                          </div>

                          {/* Main Content */}
                          <div className="flex-1 space-y-2">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-sm">
                                    {workOrder.title}
                                  </h3>
                                  <Badge variant="success" className="text-[10px] px-1 py-0">
                                    COMPLETED
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                  <span>{workOrder.id}</span>
                                  {workOrder.alertId && (
                                    <span>• {workOrder.alertId}</span>
                                  )}
                                  <Badge
                                    variant={
                                      workOrder.type === "alert_triggered"
                                        ? "destructive"
                                        : "default"
                                    }
                                    className="text-[10px] px-1 py-0"
                                  >
                                    {workOrder.type === "alert_triggered" ? "Alert" : "Manual"}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right text-xs">
                                <div className="font-medium text-green-600">
                                  {workOrder.actualCompletionDate &&
                                    new Date(workOrder.actualCompletionDate).toLocaleDateString()}
                                </div>
                                <div className="text-muted-foreground">
                                  {workOrder.actualDuration ? `${workOrder.actualDuration}m` : 'N/A'}
                                </div>
                              </div>
                            </div>

                            {/* Compact Details Grid */}
                            <div className="grid grid-cols-4 gap-2 text-xs">
                              <div className="flex items-center gap-1">
                                <Wrench className="w-3 h-3 text-muted-foreground" />
                                <span className="font-medium truncate">{workOrder.component}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-muted-foreground" />
                                <span className="truncate">{workOrder.location}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3 text-muted-foreground" />
                                <Avatar className="w-4 h-4">
                                  <AvatarFallback className="text-[10px]">
                                    {workOrder.assignedTo.avatar}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="truncate">{workOrder.assignedTo.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                <span>
                                  {workOrder.actualDuration
                                    ? `${workOrder.actualDuration}m`
                                    : `${workOrder.estimatedDuration}m`}
                                </span>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <Progress value={100} className="h-1" />
                              </div>
                              <span className="text-xs text-green-600 font-medium">
                                {workOrder.checklistProgress.completed}/{workOrder.checklistProgress.total}
                              </span>
                              {workOrder.uploads.length > 0 && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Upload className="w-3 h-3" />
                                  {workOrder.uploads.length}
                                </div>
                              )}
                              {workOrder.comments.length > 0 && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MessageSquare className="w-3 h-3" />
                                  {workOrder.comments.length}
                                </div>
                              )}
                            </div>

                            {/* Compact Description */}
                            <div className="bg-green-50 rounded-md p-2 border border-green-200">
                              <p className="text-xs text-green-800 line-clamp-2">
                                ✅ {workOrder.description}
                              </p>
                            </div>
                          </div>

                          {/* Action Arrow */}
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    );
                  })}

                  {filteredHistoricalWorkOrders.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <h3 className="text-base font-medium mb-1">No Historical Work Orders</h3>
                      <p className="text-xs">
                        {historicalWorkOrders.length === 0 
                          ? "Completed work orders will appear here" 
                          : "No completed work orders match your current filters"}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Work Order Detail Panel */}
      {isDetailPanelOpen && selectedWorkOrder && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9999] flex">
          {/* Backdrop */}
          <div className="flex-1" onClick={handleCloseDetailPanel} />

          {/* Detail Panel */}
          <div className="w-[900px] bg-background shadow-2xl flex flex-col h-full border-l overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedWorkOrder.priority === "urgent"
                      ? "bg-red-100"
                      : selectedWorkOrder.priority === "high"
                        ? "bg-orange-100"
                        : selectedWorkOrder.priority === "normal"
                          ? "bg-blue-100"
                          : "bg-gray-100"
                  }`}
                >
                  <ClipboardList
                    className={`w-5 h-5 ${
                      selectedWorkOrder.priority === "urgent"
                        ? "text-red-600"
                        : selectedWorkOrder.priority === "high"
                          ? "text-orange-600"
                          : selectedWorkOrder.priority === "normal"
                            ? "text-blue-600"
                            : "text-gray-600"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedWorkOrder.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Work Order {selectedWorkOrder.id} •{" "}
                    {selectedWorkOrder.component}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={getStatusColor(selectedWorkOrder.status) as any}
                >
                  {selectedWorkOrder.status.replace("_", " ").toUpperCase()}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseDetailPanel}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Edit Banner */}
              <div className="mx-6 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Edit className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">
                      Work Order Details
                    </h4>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      View work order information below. Use <strong>"Edit Details"</strong> to modify this work order, 
                      add communications, or update the checklist.
                    </p>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="overview" className="h-full">
                <div className="border-b border-gray-200 px-6">
                  <TabsList className="grid w-full grid-cols-4 bg-gray-50/50 h-10">
                    <TabsTrigger value="overview" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700">
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="checklist" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700">
                      Checklist
                    </TabsTrigger>
                    <TabsTrigger value="uploads" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700">
                      Files & Photos
                    </TabsTrigger>
                    <TabsTrigger value="communication" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700">
                      Communication
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="overview" className="p-6 space-y-6">
                  {/* Modern Work Order Details */}
                  <div className="grid grid-cols-2 gap-6">
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-600" />
                          Assignment Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12 border-2 border-blue-200">
                            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-semibold">
                              {selectedWorkOrder.assignedTo.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {selectedWorkOrder.assignedTo.name}
                            </div>
                            <div className="text-sm text-gray-600 font-medium">
                              {selectedWorkOrder.assignedTo.title}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm bg-blue-50 rounded-lg px-3 py-2">
                          <Phone className="w-4 h-4 text-blue-600" />
                          <span className="text-blue-700 font-medium">{selectedWorkOrder.assignedTo.phone}</span>
                        </div>
                        <div className="pt-3 border-t border-gray-200 space-y-2 text-xs">
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="w-3 h-3" />
                            <span>Created by: <span className="font-medium text-gray-900">{selectedWorkOrder.createdBy}</span></span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-3 h-3" />
                            <span>Created: <span className="font-medium text-gray-900">
                              {new Date(selectedWorkOrder.createdDate).toLocaleString()}
                            </span></span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-600" />
                          Timeline & Progress
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center text-sm bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-gray-600 font-medium">Target Completion:</span>
                          <span className="font-semibold text-gray-900">
                            {new Date(selectedWorkOrder.targetCompletionDate).toLocaleString()}
                          </span>
                        </div>
                        {selectedWorkOrder.actualCompletionDate && (
                          <div className="flex justify-between items-center text-sm bg-green-50 rounded-lg px-3 py-2">
                            <span className="text-green-700 font-medium">Actual Completion:</span>
                            <span className="font-semibold text-green-800">
                              {new Date(selectedWorkOrder.actualCompletionDate).toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="pt-3 border-t border-gray-200">
                          <div className="flex justify-between items-center text-sm mb-3">
                            <span className="text-gray-600 font-medium">Checklist Progress</span>
                            <span className="font-semibold text-gray-900">
                              {selectedWorkOrder.checklistProgress.completed}/{selectedWorkOrder.checklistProgress.total}
                            </span>
                          </div>
                          <Progress
                            value={
                              (selectedWorkOrder.checklistProgress.completed /
                                selectedWorkOrder.checklistProgress.total) *
                              100
                            }
                            className="h-3 bg-gray-200 rounded-full overflow-hidden"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Modern Technical Details */}
                  <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-purple-600" />
                        Technical Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Component
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {selectedWorkOrder.component}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Location
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {selectedWorkOrder.location}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Fault Type
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {selectedWorkOrder.faultType}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-600" />
                          Description
                        </div>
                        <div className="text-sm bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg p-4 border border-gray-200/50 leading-relaxed text-gray-700">
                          {selectedWorkOrder.description}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="checklist" className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Automated Checklist</h3>
                    <Badge variant="outline">
                      {selectedWorkOrder.checklistProgress.completed} of{" "}
                      {selectedWorkOrder.checklistProgress.total} completed
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {selectedWorkOrder.checklist.map((item, index) => (
                      <Card
                        key={item.id}
                        className={`border ${item.completed ? "bg-green-50 border-green-200" : ""}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                                item.completed
                                  ? "bg-green-100 border-green-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {item.completed && (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                              {!item.completed && (
                                <span className="text-xs font-medium text-gray-500">
                                  {index + 1}
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div
                                className={`font-medium ${item.completed ? "text-green-900" : ""}`}
                              >
                                {item.task}
                              </div>
                              {item.photoRequired && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Camera className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    Photo required
                                  </span>
                                  {item.photoUploaded && (
                                    <Badge
                                      variant="success"
                                      className="text-xs ml-2"
                                    >
                                      Photo uploaded
                                    </Badge>
                                  )}
                                </div>
                              )}
                              {item.completed && (
                                <div className="mt-2 text-xs text-green-700">
                                  <div>Completed by: {item.completedBy}</div>
                                  <div>
                                    Completed at:{" "}
                                    {item.completedAt &&
                                      new Date(
                                        item.completedAt,
                                      ).toLocaleString()}
                                  </div>
                                  {item.notes && (
                                    <div className="mt-1 p-2 bg-green-100 rounded text-xs">
                                      <strong>Notes:</strong> {item.notes}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            {!item.completed && (
                              <Button size="sm" className="gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="uploads" className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Files & Documentation</h3>
                    <Button size="sm" className="gap-1">
                      <Upload className="w-3 h-3" />
                      Upload File
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedWorkOrder.uploads.map((upload) => (
                      <Card key={upload.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                upload.type === "photo"
                                  ? "bg-blue-100"
                                  : upload.type === "document"
                                    ? "bg-green-100"
                                    : "bg-purple-100"
                              }`}
                            >
                              {upload.type === "photo" && (
                                <Camera className="w-5 h-5 text-blue-600" />
                              )}
                              {upload.type === "document" && (
                                <FileText className="w-5 h-5 text-green-600" />
                              )}
                              {upload.type === "report" && (
                                <Target className="w-5 h-5 text-purple-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {upload.name}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                <div>Uploaded by: {upload.uploadedBy}</div>
                                <div>
                                  {new Date(upload.uploadedAt).toLocaleString()}
                                </div>
                                <div>Size: {upload.size}</div>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {selectedWorkOrder.uploads.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Upload className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No files uploaded yet</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="communication" className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Communication Log</h3>
                  </div>

                  <div className="space-y-4">
                    {selectedWorkOrder.comments.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <h3 className="text-base font-medium mb-1">No comments yet</h3>
                        <p className="text-xs">Start the conversation by adding a comment</p>
                      </div>
                    ) : (
                      selectedWorkOrder.comments.map((comment) => (
                      <Card
                        key={comment.id}
                        className={`${
                          comment.type === "escalation"
                            ? "border-red-200 bg-red-50"
                            : comment.type === "update"
                              ? "border-blue-200 bg-blue-50"
                              : ""
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {comment.author
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">
                                  {comment.author}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {comment.role}
                                </Badge>
                                {comment.type === "escalation" && (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    Escalation
                                  </Badge>
                                )}
                                {comment.type === "update" && (
                                  <Badge variant="default" className="text-xs">
                                    Status Update
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {comment.message}
                              </p>
                              <div className="text-xs text-muted-foreground">
                                {new Date(comment.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Footer Actions */}
            <div className="border-t p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Last updated: {new Date().toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => handleEditWorkOrder(selectedWorkOrder)}
                  >
                    <Edit className="w-3 h-3" />
                    Edit Details
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="w-3 h-3" />
                    Export PDF
                  </Button>
                  {selectedWorkOrder.status?.toLowerCase() !== "completed" && (
                    <Button 
                      size="sm" 
                      className="gap-1"
                      onClick={() => handleCompleteWorkOrder(selectedWorkOrder.id)}
                      disabled={isCompleting}
                    >
                      <CheckCircle className="w-3 h-3" />
                      {isCompleting ? "Completing..." : "Mark Complete"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Work Order Create Dialog */}
      <WorkOrderCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        defaultAssetId={plantId}
        onWorkOrderCreated={handleWorkOrderCreated}
      />

      {/* Work Order Edit Dialog */}
      <WorkOrderCreateDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editMode={true}
        workOrderToEdit={workOrderToEdit}
        onWorkOrderUpdated={handleWorkOrderUpdated}
        onWorkOrderDataChange={handleWorkOrderDataChange}
      />


    </div>
  );
}
