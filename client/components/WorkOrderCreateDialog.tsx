import { useState, useEffect, useRef } from "react";
import { plantsService } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useAlert } from "@/hooks/use-alert";
import {
  ClipboardList,
  Calendar as CalendarIcon,
  User,
  Upload,
  Bot,
  Star,
  Phone,
  Clock,
  Zap,
  Target,
  CheckCircle,
  Plus,
  X,
  Lightbulb,
  AlertTriangle,
  MessageSquare,
  Trash2,
  Upload as UploadIcon,
  File,
  Image,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ApiService from "@/lib/api";
import { DatePicker } from "@/components/ui/date-picker";

interface RoleAssignment {
  id: string;
  name: string;
  title: string;
  competencyLevel: number;
  activeWorkOrders: number;
  maxCapacity: number;
  contactPhone: string;
  availability: {
    today: boolean;
    tomorrow: boolean;
    thisWeek: number;
  };
  specialties: string[];
  avatar: string;
}

interface WorkOrderFormData {
  title: string;
  description: string;
  assetId: string;
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: Date | undefined;
  assignedRoleId: string;
  checklist: Array<{
    id: string;
    task: string;
    photoRequired: boolean;
  }>;
  attachments: File[];
}

interface WorkOrderCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultAssetId?: string;
  defaultTitle?: string;
  defaultDescription?: string;
  onWorkOrderCreated?: (workOrder: any) => void;
  onWorkOrderCompleted?: (workOrderId: string, completionData?: any) => void;
  // Edit mode props
  editMode?: boolean;
  workOrderToEdit?: any;
  onWorkOrderUpdated?: (workOrder: any) => void;
  onWorkOrderDataChange?: (workOrder: any) => void;
}

const generateRoleAssignments = (): RoleAssignment[] => [
  {
    id: "se-1",
    name: "Sarah Chen",
    title: "Senior Engineer",
    competencyLevel: 95,
    activeWorkOrders: 3,
    maxCapacity: 8,
    contactPhone: "+91 98765 43210",
    availability: {
      today: true,
      tomorrow: true,
      thisWeek: 5,
    },
    specialties: [
      "High Voltage Systems",
      "Grid Integration",
      "Safety Protocols",
    ],
    avatar: "SC",
  },
  {
    id: "se-2",
    name: "Rajesh Kumar",
    title: "Senior Engineer",
    competencyLevel: 92,
    activeWorkOrders: 5,
    maxCapacity: 8,
    contactPhone: "+91 98765 43211",
    availability: {
      today: false,
      tomorrow: true,
      thisWeek: 4,
    },
    specialties: [
      "Inverter Systems",
      "Performance Analysis",
      "Root Cause Analysis",
    ],
    avatar: "RK",
  },
  {
    id: "je-1",
    name: "Priya Sharma",
    title: "Junior Engineer",
    competencyLevel: 78,
    activeWorkOrders: 2,
    maxCapacity: 6,
    contactPhone: "+91 98765 43212",
    availability: {
      today: true,
      tomorrow: true,
      thisWeek: 5,
    },
    specialties: ["Data Analysis", "Preventive Maintenance", "Documentation"],
    avatar: "PS",
  },
  {
    id: "je-2",
    name: "Amit Patel",
    title: "Junior Engineer",
    competencyLevel: 82,
    activeWorkOrders: 4,
    maxCapacity: 6,
    contactPhone: "+91 98765 43213",
    availability: {
      today: true,
      tomorrow: false,
      thisWeek: 3,
    },
    specialties: [
      "String Diagnostics",
      "Thermal Analysis",
      "Component Testing",
    ],
    avatar: "AP",
  },
  {
    id: "ft-1",
    name: "Mohamed Ali",
    title: "Field Technician",
    competencyLevel: 88,
    activeWorkOrders: 1,
    maxCapacity: 4,
    contactPhone: "+91 98765 43214",
    availability: {
      today: true,
      tomorrow: true,
      thisWeek: 6,
    },
    specialties: ["Module Cleaning", "Connector Maintenance", "Basic Repairs"],
    avatar: "MA",
  },
  {
    id: "ft-2",
    name: "Vikram Singh",
    title: "Field Technician",
    competencyLevel: 85,
    activeWorkOrders: 2,
    maxCapacity: 4,
    contactPhone: "+91 98765 43215",
    availability: {
      today: false,
      tomorrow: true,
      thisWeek: 4,
    },
    specialties: [
      "Tracker Systems",
      "Electrical Connections",
      "Safety Compliance",
    ],
    avatar: "VS",
  },
];

const generateAIChecklistSuggestions = (
  description: string,
  priority: string,
): Array<{
  id: string;
  task: string;
  photoRequired: boolean;
}> => {
  const baseId = Date.now();

  // Simple keyword-based suggestion logic
  const desc = description.toLowerCase();

  if (desc.includes("inverter") || desc.includes("electrical")) {
    return [
      {
        id: `${baseId}-1`,
        task: "Isolate component from grid connection",
        photoRequired: false,
      },
      {
        id: `${baseId}-2`,
        task: "Perform thermal scan of inverter unit",
        photoRequired: true,
      },
      {
        id: `${baseId}-3`,
        task: "Test ground fault protection system",
        photoRequired: false,
      },
      {
        id: `${baseId}-4`,
        task: "Measure insulation resistance",
        photoRequired: true,
      },
      {
        id: `${baseId}-5`,
        task: "Inspect electrical connections",
        photoRequired: true,
      },
      {
        id: `${baseId}-6`,
        task: "Perform functional test and clearance",
        photoRequired: true,
      },
    ];
  } else if (desc.includes("tracker") || desc.includes("mechanical")) {
    return [
      {
        id: `${baseId}-1`,
        task: "Visual inspection of tracker mechanism",
        photoRequired: true,
      },
      {
        id: `${baseId}-2`,
        task: "Check motor and drive system",
        photoRequired: true,
      },
      {
        id: `${baseId}-3`,
        task: "Calibrate position sensors",
        photoRequired: false,
      },
      {
        id: `${baseId}-4`,
        task: "Test tracking algorithm",
        photoRequired: false,
      },
      {
        id: `${baseId}-5`,
        task: "Verify position accuracy",
        photoRequired: true,
      },
    ];
  } else if (desc.includes("cleaning") || desc.includes("maintenance")) {
    return [
      {
        id: `${baseId}-1`,
        task: "Assess cleaning requirements",
        photoRequired: true,
      },
      {
        id: `${baseId}-2`,
        task: "Prepare cleaning equipment",
        photoRequired: false,
      },
      {
        id: `${baseId}-3`,
        task: "Execute cleaning procedure",
        photoRequired: true,
      },
      {
        id: `${baseId}-4`,
        task: "Document performance improvement",
        photoRequired: true,
      },
    ];
  } else if (desc.includes("data") || desc.includes("software")) {
    return [
      {
        id: `${baseId}-1`,
        task: "Backup current system data",
        photoRequired: false,
      },
      { id: `${baseId}-2`, task: "Analyze system logs", photoRequired: true },
      {
        id: `${baseId}-3`,
        task: "Apply software updates",
        photoRequired: false,
      },
      {
        id: `${baseId}-4`,
        task: "Test system functionality",
        photoRequired: false,
      },
      {
        id: `${baseId}-5`,
        task: "Document changes made",
        photoRequired: false,
      },
    ];
  }

  // Default generic checklist
  return [
    {
      id: `${baseId}-1`,
      task: "Initial assessment and safety check",
      photoRequired: true,
    },
    {
      id: `${baseId}-2`,
      task: "Execute primary maintenance task",
      photoRequired: true,
    },
    {
      id: `${baseId}-3`,
      task: "Perform quality verification",
      photoRequired: true,
    },
    {
      id: `${baseId}-4`,
      task: "Document completion and findings",
      photoRequired: false,
    },
  ];
};

const estimateCompletionTime = (
  description: string,
  priority: string,
  roleId: string,
): number => {
  const desc = description.toLowerCase();
  let baseTime = 120; // 2 hours default

  // Adjust based on task complexity
  if (desc.includes("critical") || desc.includes("emergency")) baseTime = 240;
  else if (desc.includes("inverter") || desc.includes("electrical"))
    baseTime = 180;
  else if (desc.includes("tracker") || desc.includes("mechanical"))
    baseTime = 150;
  else if (desc.includes("cleaning") || desc.includes("simple")) baseTime = 90;
  else if (desc.includes("data") || desc.includes("software")) baseTime = 60;

  // Adjust based on priority
  if (priority === "urgent")
    baseTime += 60; // More thorough for urgent
  else if (priority === "low") baseTime -= 30;

  // Adjust based on role (Senior engineers might be faster for complex tasks)
  if (roleId.startsWith("se-"))
    baseTime *= 0.8; // 20% faster
  else if (roleId.startsWith("ft-")) baseTime *= 1.2; // 20% slower for complex tasks

  return Math.round(baseTime);
};

// Export the completeWorkOrder function for use by parent components
export const useCompleteWorkOrder = () => {
  return async (workOrderId: string, completionData?: {
    completedBy?: string;
    completionNotes?: string;
    completionDate?: Date;
  }) => {
    try {
      console.log('Completing work order:', workOrderId);
      const response = await ApiService.completeWorkOrder(workOrderId, completionData);
      console.log('Work order completed successfully:', response);
      return response;
    } catch (error) {
      console.error('Error completing work order:', error);
      throw error;
    }
  };
};

// Export the hook for updating work orders
export const useUpdateWorkOrder = () => {
  return async (workOrderId: string, updateData: any) => {
    try {
      console.log('Updating work order:', workOrderId);
      const response = await ApiService.updateWorkOrder(workOrderId, updateData);
      console.log('Work order updated successfully:', response);
      return response;
    } catch (error) {
      console.error('Error updating work order:', error);
      throw error;
    }
  };
};

export default function WorkOrderCreateDialog({
  open,
  onOpenChange,
  defaultAssetId,
  defaultTitle = "",
  defaultDescription = "",
  onWorkOrderCreated,
  onWorkOrderCompleted,
  editMode = false,
  workOrderToEdit,
  onWorkOrderUpdated,
  onWorkOrderDataChange,
}: WorkOrderCreateDialogProps) {
  const alert = useAlert();
  const [plants, setPlants] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const result = await plantsService.fetchPlants();
        if (isMounted) setPlants((result || []).map(plant => ({ id: plant.id.toString(), name: plant.name })));
      } catch (e) {
        if (isMounted) setPlants([]);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);
  const [roleAssignments] = useState(generateRoleAssignments());
  const [formData, setFormData] = useState<WorkOrderFormData>({
    title: defaultTitle,
    description: defaultDescription,
    assetId: defaultAssetId || "",
    priority: "medium",
    dueDate: undefined,
    assignedRoleId: "",
    checklist: [],
    attachments: [],
  });
  const [selectedRole, setSelectedRole] = useState<RoleAssignment | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<
    Array<{
      id: string;
      task: string;
      photoRequired: boolean;
    }>
  >([]);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Comment state
  const [newComment, setNewComment] = useState("");
  const [commentType, setCommentType] = useState<"comment" | "escalation">("comment");
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // File upload state
  const [newUpload, setNewUpload] = useState<File | null>(null);
  const [uploadDescription, setUploadDescription] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  // Populate form when in edit mode
  useEffect(() => {
    if (editMode && workOrderToEdit) {
      setFormData({
        title: workOrderToEdit.title || "",
        description: workOrderToEdit.description || "",
        assetId: workOrderToEdit.component || workOrderToEdit.assetId || "",
        priority: workOrderToEdit.priority?.toLowerCase() === "urgent" ? "urgent" :
                 workOrderToEdit.priority?.toLowerCase() === "high" ? "high" :
                 workOrderToEdit.priority?.toLowerCase() === "normal" ? "medium" : "low",
        dueDate: workOrderToEdit.targetCompletionDate ? new Date(workOrderToEdit.targetCompletionDate) : undefined,
        assignedRoleId: workOrderToEdit.assignedTo?.id || "",
        checklist: workOrderToEdit.checklist?.map((item: any) => ({
          id: item.id,
          task: item.task,
          photoRequired: item.photoRequired || false,
        })) || [],
        attachments: [],
      });

      // Set the selected role
      const role = roleAssignments.find(r => r.id === workOrderToEdit.assignedTo?.id);
      if (role) {
        setSelectedRole(role);
      }

    }
  }, [editMode, workOrderToEdit, roleAssignments]);




  const handleDescriptionChange = (description: string) => {
    setFormData((prev) => ({ ...prev, description }));

    // Generate AI suggestions when description changes
    if (description.length > 10) {
      const suggestions = generateAIChecklistSuggestions(
        description,
        formData.priority,
      );
      setAiSuggestions(suggestions);
      setShowAiSuggestions(true);

      // Update estimated time
      if (formData.assignedRoleId) {
        const time = estimateCompletionTime(
          description,
          formData.priority,
          formData.assignedRoleId,
        );
        setEstimatedTime(time);
      }
    } else {
      setShowAiSuggestions(false);
      setAiSuggestions([]);
    }
  };

  const handleRoleSelection = (roleId: string) => {
    const role = roleAssignments.find((r) => r.id === roleId);
    setSelectedRole(role || null);
    setFormData((prev) => ({ ...prev, assignedRoleId: roleId }));

    // Update estimated time when role changes
    if (formData.description.length > 10) {
      const time = estimateCompletionTime(
        formData.description,
        formData.priority,
        roleId,
      );
      setEstimatedTime(time);
    }
  };

  const handleApplyAiSuggestions = () => {
    setFormData((prev) => ({ ...prev, checklist: [...aiSuggestions] }));
    setShowAiSuggestions(false);
  };

  const addChecklistItem = () => {
    const newItem = {
      id: `custom-${Date.now()}`,
      task: "",
      photoRequired: false,
    };
    setFormData((prev) => ({
      ...prev,
      checklist: [...prev.checklist, newItem],
    }));
  };

  const updateChecklistItem = (
    id: string,
    updates: Partial<(typeof formData.checklist)[0]>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item) =>
        item.id === id ? { ...item, ...updates } : item,
      ),
    }));
  };

  const removeChecklistItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      checklist: prev.checklist.filter((item) => item.id !== id),
    }));
  };

  const completeWorkOrder = async (workOrderId: string, completionData?: {
    completedBy?: string;
    completionNotes?: string;
    completionDate?: Date;
  }) => {
    try {
      console.log('Completing work order:', workOrderId);
      const response = await ApiService.completeWorkOrder(workOrderId, completionData);
      console.log('Work order completed successfully:', response);
      
      // Call the callback if provided
      onWorkOrderCompleted?.(workOrderId, completionData);
      
      return response;
    } catch (error) {
      console.error('Error completing work order:', error);
      throw error;
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      alert.validationError("Please enter a comment message");
      return;
    }

    if (newComment.trim().length > 500) {
      alert.validationError("Comment message cannot exceed 500 characters");
      return;
    }

    try {
      setIsSubmittingComment(true);

      // Create new comment object with proper structure
      const newCommentData = {
        id: `comment-${Date.now()}`, // Generate temporary ID
        message: newComment.trim(),
        type: commentType,
        author: "Current User", // This could be dynamic based on logged-in user
        role: "Engineer", // This could be dynamic based on user role
        timestamp: new Date().toISOString(),
      };

      console.log('Adding comment to form data:', newCommentData);

      // Update the workOrderToEdit with the new comment
      if (workOrderToEdit) {
        const updatedWorkOrder = {
          ...workOrderToEdit,
          comments: [...(workOrderToEdit.comments || []), newCommentData],
          // If escalation, update status
          status: commentType === "escalation" ? "escalated" : workOrderToEdit.status
        };
        
        // Notify parent component of the change
        onWorkOrderDataChange?.(updatedWorkOrder);
        
        console.log("Comment added to form data successfully");
        
        // Reset comment form and close it
        setNewComment("");
        setCommentType("comment");
        setShowCommentForm(false);
        
        // Show success message
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert.commentError();
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleOpenCommentForm = () => {
    setShowCommentForm(true);
  };

  const handleCloseCommentForm = () => {
    setShowCommentForm(false);
    setNewComment("");
    setCommentType("comment");
  };

  const handleFileUpload = async () => {
    console.log('Upload button clicked, newUpload:', newUpload);
    if (!newUpload) {
      alert.validationError("Please select a file to upload");
      return;
    }

    try {
      setIsUploading(true);

      // Create new upload object
      const newUploadData = {
        id: `upload-${Date.now()}`,
        name: newUpload.name,
        type: newUpload.type.startsWith('image/') ? 'photo' : 
              newUpload.type.includes('pdf') || newUpload.type.includes('document') ? 'document' : 'report',
        uploadedBy: "Current User",
        uploadedAt: new Date().toISOString(),
        size: `${(newUpload.size / 1024).toFixed(1)} KB`,
        description: uploadDescription.trim() || "No description provided"
      };

      console.log('Adding upload to form data:', newUploadData);

      // Update the workOrderToEdit with the new upload
      if (workOrderToEdit) {
        const updatedWorkOrder = {
          ...workOrderToEdit,
          uploads: [...(workOrderToEdit.uploads || []), newUploadData]
        };
        
        // Notify parent component of the change
        onWorkOrderDataChange?.(updatedWorkOrder);
        
        console.log("Upload added to form data successfully");
        
        // Reset upload form and close it
        setNewUpload(null);
        setUploadDescription("");
        setShowUploadForm(false);
        
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Show success message
        setShowUploadSuccess(true);
        setTimeout(() => setShowUploadSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error adding upload:", error);
      alert.fileUploadError();
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenUploadForm = () => {
    setShowUploadForm(true);
  };

  const handleCloseUploadForm = () => {
    setShowUploadForm(false);
    setNewUpload(null);
    setUploadDescription("");
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('File selected:', file);
    if (file) {
      setNewUpload(file);
      console.log('File set in state:', file.name, file.size, file.type);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === 'photo') return <Image className="w-4 h-4" />;
    if (fileType === 'document') return <File className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const handleSubmit = async () => {
    console.log('Form data before submit:', formData);
    
    if (
      !formData.title ||
      !formData.description ||
      !formData.assetId ||
      !formData.assignedRoleId
    ) {
      alert.validationError("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Prepare the request body according to the API specification
      const requestBody = {
        Id: editMode ? workOrderToEdit?.id : `WO-${Date.now()}`,
        AlertId: editMode ? workOrderToEdit?.alertId : "", // Keep existing or empty for manual work orders
        Title: formData.title,
        Description: formData.description,
        Component: Number(formData.assetId), // Using assetId as component for now
        Type: editMode ? workOrderToEdit?.type : "manual",
        Severity: editMode ? workOrderToEdit?.severity : "medium", // Keep existing or default severity
        Status: editMode ? workOrderToEdit?.status : "InProgress", // Keep existing status or default
        AssignedTo: {
          Id: selectedRole?.id || "",
          Name: selectedRole?.name || "",
          Title: selectedRole?.title || "",
          Avatar: selectedRole?.avatar || "",
          Phone: selectedRole?.contactPhone || "",
        },
        CreatedBy: editMode ? workOrderToEdit?.createdBy : "Plant Manager", // Keep existing or default creator
        CreatedDate: editMode ? workOrderToEdit?.createdDate : new Date().toISOString(), // Keep existing or current date
        TargetCompletionDate: formData.dueDate ? formData.dueDate.toISOString() : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Default to tomorrow if no due date
        EstimatedDuration: estimatedTime,
        ChecklistProgress: editMode ? workOrderToEdit?.checklistProgress : {
          Completed: 0,
          Total: formData.checklist.length,
        },
        Priority: formData.priority === "urgent" ? "Urgent" : 
                  formData.priority === "high" ? "High" : 
                  formData.priority === "medium" ? "Normal" : "Low",
        FaultType: editMode ? workOrderToEdit?.faultType : "General", // Keep existing or default fault type
        Location: editMode ? workOrderToEdit?.location : "Plant Site", // Keep existing or default location
        Uploads: editMode ? workOrderToEdit?.uploads : [], // Keep existing uploads
        Comments: editMode ? (workOrderToEdit?.comments || []).map((comment: any) => ({
          Id: comment.id,
          Author: comment.author,
          Role: comment.role,
          Message: comment.message,
          Timestamp: comment.timestamp,
          Type: comment.type,
        })) : [], // Format comments to match API structure
        Checklist: formData.checklist.map((item, index) => ({
          Id: item.id || `cl-${Date.now()}-${index}`, // Keep existing ID or generate new one
          Task: item.task,
          Completed: editMode ? (workOrderToEdit?.checklist?.find((c: any) => c.id === item.id)?.completed || false) : false,
          CompletedBy: editMode ? workOrderToEdit?.checklist?.find((c: any) => c.id === item.id)?.completedBy : null,
          CompletedAt: editMode ? workOrderToEdit?.checklist?.find((c: any) => c.id === item.id)?.completedAt : null,
          Notes: editMode ? workOrderToEdit?.checklist?.find((c: any) => c.id === item.id)?.notes : null,
          PhotoRequired: item.photoRequired,
          PhotoUploaded: editMode ? workOrderToEdit?.checklist?.find((c: any) => c.id === item.id)?.photoUploaded : null,
        })),
        PlantId: parseInt(formData.assetId) || 1, // Convert assetId to number, default to 1
      };

      console.log('Request body being sent:', requestBody);

      let response;
      if (editMode) {
        // Make API call to update work order
        response = await ApiService.updateWorkOrder(workOrderToEdit.id, requestBody);
        console.log("Work order updated successfully:", response);
        onWorkOrderUpdated?.(response);
      } else {
        // Make API call to create work order
        response = await ApiService.post("/workorders", requestBody);
        console.log("Work order created successfully:", response);
        onWorkOrderCreated?.(response);
      }

      // Reset form only if not in edit mode
      if (!editMode) {
        setFormData({
          title: "",
          description: "",
          assetId: "",
          priority: "medium",
          dueDate: undefined,
          assignedRoleId: "",
          checklist: [],
          attachments: [],
        });
        setSelectedRole(null);
        setShowAiSuggestions(false);
        setAiSuggestions([]);
        setEstimatedTime(0);
      }
      onOpenChange(false);
      
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} work order:`, error);
      alert.workOrderError(editMode ? 'update' : 'create');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-5xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            {editMode ? "Edit Work Order" : "Create Work Order"}
          </DialogTitle>
          <DialogDescription>
            {editMode 
              ? "Update the work order details and checklist items."
              : "Create a new maintenance task with automated checklist generation and role assignment."
            }
          </DialogDescription>
          
          {/* Edit Mode Banner */}
          {editMode && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <ClipboardList className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">
                    Editing Work Order
                  </h4>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    You're currently editing an existing work order. Make your changes across the tabs below, 
                    then click <strong>"Update Work Order"</strong> to save your modifications and reflect the changes in the system.
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogHeader>

        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className={`grid w-full h-12 bg-gray-50/50 ${editMode ? 'grid-cols-5' : 'grid-cols-3'}`}>
            <TabsTrigger value="details" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700">
              Task Details
            </TabsTrigger>
            <TabsTrigger value="assignment" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700">
              Role Assignment
            </TabsTrigger>
            <TabsTrigger value="checklist" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700">
              Checklist
            </TabsTrigger>
            {editMode && <TabsTrigger value="uploads" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700">
              Files & Photos
            </TabsTrigger>}
            {editMode && <TabsTrigger value="communication" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700">
              Communication
            </TabsTrigger>}
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="title" className="text-sm font-semibold text-gray-700">Work Order Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Inverter maintenance - Unit 5"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="h-11 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="asset" className="text-sm font-semibold text-gray-700">Select Asset/Site *</Label>
                <Select
                  value={formData.assetId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, assetId: value }))
                  }
                >
                  <SelectTrigger className="h-11 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200">
                    <SelectValue placeholder="Choose asset or site" />
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
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Task Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the maintenance task, issue, or work to be performed..."
                value={formData.description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                className="min-h-[100px] border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="priority" className="text-sm font-semibold text-gray-700">Priority Level</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) =>
                    setFormData((prev) => ({ ...prev, priority: value }))
                  }
                >
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
              <DatePicker
                value={formData.dueDate}
                onChange={(date) => {
                  console.log('Date selected:', date);
                  setFormData((prev) => {
                    console.log('Updating form data with date:', date);
                    return { ...prev, dueDate: date };
                  });
                }}
                placeholder="Pick a date"
                label="Due Date"
                minDate={new Date()}
                variant="default"
                size="md"
              />
            </div>

            {/* AI Suggestions Banner */}
            {showAiSuggestions && aiSuggestions.length > 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Bot className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-blue-900 mb-1">
                        AI Checklist Suggestions Available
                      </div>
                      <div className="text-sm text-blue-700 mb-3">
                        Based on your task description, AI suggests{" "}
                        {aiSuggestions.length} checklist items.
                        {estimatedTime > 0 && (
                          <span>
                            {" "}
                            Estimated completion time:{" "}
                            <strong>
                              {Math.round(estimatedTime / 60)} hours{" "}
                              {estimatedTime % 60} minutes
                            </strong>
                            .
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={handleApplyAiSuggestions}
                        className="gap-1"
                      >
                        <Lightbulb className="w-3 h-3" />
                        Apply AI Suggestions
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="assignment" className="space-y-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900">Available Personnel</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roleAssignments
                  .sort((a, b) => {
                    if (a.availability.today !== b.availability.today) {
                      return a.availability.today ? -1 : 1;
                    }
                    if (a.competencyLevel !== b.competencyLevel) {
                      return b.competencyLevel - a.competencyLevel;
                    }
                    return a.activeWorkOrders - b.activeWorkOrders;
                  })
                  .map((role) => {
                    const workloadPercentage =
                      (role.activeWorkOrders / role.maxCapacity) * 100;
                    const isSelected = selectedRole?.id === role.id;
                    const isRecommended =
                      role ===
                      roleAssignments
                        .filter((r) => r.availability.today)
                        .sort((a, b) => {
                          const scoreA =
                            a.competencyLevel -
                            (a.activeWorkOrders / a.maxCapacity) * 20;
                          const scoreB =
                            b.competencyLevel -
                            (b.activeWorkOrders / b.maxCapacity) * 20;
                          return scoreB - scoreA;
                        })[0];

                    return (
                      <Card
                        key={role.id}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                          isSelected ? "ring-2 ring-blue-500 border-blue-500 bg-blue-50/50" : "border-gray-200 hover:border-gray-300"
                        } ${isRecommended ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200" : "bg-white"}`}
                        onClick={() => handleRoleSelection(role.id)}
                      >
                        <CardContent className="p-5">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-4">
                                <Avatar className="w-12 h-12 border-2 border-gray-200">
                                  <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-semibold">
                                    {role.avatar}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-semibold flex items-center gap-2 text-gray-900">
                                    {role.name}
                                    {isRecommended && (
                                      <Badge
                                        variant="default"
                                        className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                                      >
                                        <Star className="w-3 h-3 mr-1" />
                                        Recommended
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-600 font-medium">
                                    {role.title}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-500 font-medium">
                                  Competency
                                </div>
                                <div className="font-bold text-xl text-blue-600">
                                  {role.competencyLevel}%
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600 font-medium">Competency Level</span>
                                <span className="font-semibold text-gray-900">{role.competencyLevel}%</span>
                              </div>
                              <Progress
                                value={role.competencyLevel}
                                className="h-3 bg-gray-200 rounded-full overflow-hidden"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600 font-medium">Current Workload</span>
                                <span className="font-semibold text-gray-900">
                                  {role.activeWorkOrders}/{role.maxCapacity} orders
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
                                  variant={
                                    role.availability.today
                                      ? "success"
                                      : "destructive"
                                  }
                                  className="text-xs px-2 py-1 rounded-full font-semibold"
                                >
                                  Today:{" "}
                                  {role.availability.today ? "Yes" : "No"}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2">
                              <Phone className="w-4 h-4 text-blue-600" />
                              <span className="text-gray-700 font-medium">{role.contactPhone}</span>
                            </div>

                            <div className="space-y-2">
                              <div className="text-xs font-medium text-muted-foreground">
                                Specialties:
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {role.specialties.map((specialty, index) => (
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
                  <ClipboardList className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-gray-900">Task Checklist</h4>
                </div>
                <Button size="sm" onClick={addChecklistItem} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {formData.checklist.map((item, index) => (
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
                            onChange={(e) =>
                              updateChecklistItem(item.id, {
                                task: e.target.value,
                              })
                            }
                            className="border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                          />
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id={`photo-${item.id}`}
                              checked={item.photoRequired}
                              onChange={(e) =>
                                updateChecklistItem(item.id, {
                                  photoRequired: e.target.checked,
                                })
                              }
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
                          onClick={() => removeChecklistItem(item.id)}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {formData.checklist.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No checklist items yet</h3>
                  <p className="text-sm text-gray-500">
                    Add items manually or use AI suggestions from the Task Details tab.
                  </p>
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    File Attachments (Optional)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-dashed border-2 border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Drag & drop files here or click to browse
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Support for images, documents, and reports
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {editMode && (
            <TabsContent value="uploads" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">Files & Photos</h4>
                    {workOrderToEdit?.uploads?.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {workOrderToEdit.uploads.length} file{workOrderToEdit.uploads.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    onClick={handleOpenUploadForm}
                    disabled={showUploadForm}
                    className="gap-1"
                  >
                    <UploadIcon className="w-3 h-3" />
                    Add File
                  </Button>
                </div>

                {/* Upload Guide Banner */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                        <UploadIcon className="w-3 h-3 text-amber-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-amber-800">
                        <strong>Tip:</strong> Upload photos, documents, or reports related to this work order. 
                        All files will be saved when you click "Update Work Order".
                      </p>
                    </div>
                  </div>
                </div>

                {/* Success Message Banner */}
                {showUploadSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg animate-in fade-in-0 slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      </div>
                      <p className="text-sm text-green-800 font-medium">
                        File added successfully! Remember to click "Update Work Order" to save all changes.
                      </p>
                    </div>
                  </div>
                )}

                {/* Add File Form - Only show when showUploadForm is true */}
                {showUploadForm && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center justify-between">
                        Add File
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCloseUploadForm}
                          className="h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="file-upload">Select File *</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                          <input
                            ref={fileInputRef}
                            type="file"
                            id="file-upload"
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls"
                          />
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <UploadIcon className={`w-8 h-8 mx-auto mb-2 ${newUpload ? 'text-green-500' : 'text-gray-400'}`} />
                            <p className={`text-sm ${newUpload ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                              {newUpload ? newUpload.name : "Click to browse or drag & drop files"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Support for images, documents, and reports
                            </p>
                            {newUpload && (
                              <p className="text-xs text-green-600 mt-1 font-medium">
                                ✓ File selected ({newUpload.size > 1024 * 1024 ? `${(newUpload.size / (1024 * 1024)).toFixed(1)} MB` : `${(newUpload.size / 1024).toFixed(1)} KB`})
                              </p>
                            )}
                          </label>
                        </div>
                        
                        {/* Remove File Button */}
                        {newUpload && (
                          <div className="flex justify-center">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setNewUpload(null);
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = '';
                                }
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Remove File
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="upload-description">Description (Optional)</Label>
                        <Textarea
                          id="upload-description"
                          placeholder="Add a description for this file..."
                          value={uploadDescription}
                          onChange={(e) => setUploadDescription(e.target.value)}
                          className="min-h-[60px] resize-none"
                          maxLength={200}
                        />
                        <div className="text-xs text-muted-foreground text-right">
                          {uploadDescription.length}/200 characters
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline"
                          onClick={handleCloseUploadForm}
                          disabled={isUploading}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleFileUpload} 
                          disabled={!newUpload || isUploading}
                          className="gap-1"
                        >
                          <UploadIcon className="w-3 h-3" />
                          {isUploading ? "Uploading..." : "Upload File"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Files Display */}
                <div className="space-y-4">
                  {workOrderToEdit?.uploads?.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <UploadIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <h3 className="text-base font-medium mb-1">No files uploaded yet</h3>
                      <p className="text-xs">Upload photos, documents, or reports related to this work order</p>
                    </div>
                  ) : (
                    workOrderToEdit?.uploads?.map((upload: any) => (
                      <Card key={upload.id} className="border-gray-200 bg-white">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                {getFileIcon(upload.type)}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">
                                  {upload.name}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {upload.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {upload.size}
                                </span>
                              </div>
                              {upload.description && upload.description !== "No description provided" && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {upload.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Uploaded by: {upload.uploadedBy}</span>
                                <span>{new Date(upload.uploadedAt).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          )}

          {editMode && (
            <TabsContent value="communication" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">Communication Log</h4>
                    {workOrderToEdit?.comments?.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {workOrderToEdit.comments.length} comment{workOrderToEdit.comments.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    onClick={handleOpenCommentForm}
                    disabled={showCommentForm}
                    className="gap-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    Add Communication
                  </Button>
                </div>

                {/* Communication Guide Banner */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-3 h-3 text-amber-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-amber-800">
                        <strong>Tip:</strong> Use the "Add Communication" button to add comments or escalate issues. 
                        All communications will be saved when you click "Update Work Order".
                      </p>
                    </div>
                  </div>
                </div>

                {/* Success Message Banner */}
                {showSuccessMessage && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg animate-in fade-in-0 slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      </div>
                      <p className="text-sm text-green-800 font-medium">
                        Communication added successfully! Remember to click "Update Work Order" to save all changes.
                      </p>
                    </div>
                  </div>
                )}

                {/* Add Comment Form - Only show when showCommentForm is true */}
                {showCommentForm && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center justify-between">
                        Add Communication
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCloseCommentForm}
                          className="h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="comment-type">Communication Type</Label>
                        <Select value={commentType} onValueChange={(value: "comment" | "escalation") => setCommentType(value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select communication type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="comment">Comment</SelectItem>
                            <SelectItem value="escalation">Escalation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-comment">Message *</Label>
                        <Textarea
                          id="new-comment"
                          placeholder="Enter your communication..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className={cn(
                            "min-h-[100px] resize-none",
                            newComment.length > 500 && "border-red-500 focus:border-red-500"
                          )}
                          maxLength={500}
                        />
                        <div className={cn(
                          "text-xs text-right",
                          newComment.length > 500 ? "text-red-500" : "text-muted-foreground"
                        )}>
                          {newComment.length}/500 characters
                          {newComment.length > 500 && " (Exceeds limit)"}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline"
                          onClick={handleCloseCommentForm}
                          disabled={isSubmittingComment}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleAddComment} 
                          disabled={!newComment.trim() || newComment.length > 500 || isSubmittingComment}
                          className="gap-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          {isSubmittingComment ? "Submitting..." : "Submit"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Comments Display */}
                <div className="space-y-4">
                  {workOrderToEdit?.comments?.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <h3 className="text-base font-medium mb-1">No communications yet</h3>
                      <p className="text-xs">Start the conversation by adding a communication</p>
                    </div>
                  ) : (
                    workOrderToEdit?.comments?.map((comment: any) => (
                      <Card
                        key={comment.id}
                        className={`${
                          comment.type === "escalation"
                            ? "border-red-200 bg-red-50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {comment.author
                                  ?.split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
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
                              </div>
                              <p className="text-sm text-muted-foreground mb-2 whitespace-pre-wrap">
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
              </div>
            </TabsContent>
          )}
        </Tabs>

        <DialogFooter className="bg-gray-50/50 border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-600">
              {selectedRole && estimatedTime > 0 && (
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-700">
                    Estimated completion: {Math.floor(estimatedTime / 60)}h{" "}
                    {estimatedTime % 60}m
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                disabled={isSubmitting}
                className="h-10 px-6 border-2 border-gray-200 hover:border-gray-300 transition-colors duration-200"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors duration-200"
              >
                {isSubmitting 
                  ? (editMode ? "Updating..." : "Creating...") 
                  : (editMode ? "Update Work Order" : "Create Work Order")
                }
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
