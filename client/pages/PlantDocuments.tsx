import { useState, useEffect } from "react";
import { Plant } from "@shared/interface";
import PlantNavigation from '@/components/PlantNavigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FileText,
  Upload,
  Download,
  Search,
  Filter,
  FolderOpen,
  File,
  Calendar,
  User,
  HardDrive,
  Plus,
  Eye,
} from "lucide-react";
import { useAlert } from "@/hooks/use-alert";

interface Document {
  id: string;
  name: string;
  type:
    | "Technical Datasheets"
    | "O&M Manuals"
    | "Commissioning Certificates"
    | "Regulatory Compliance"
    | "Warranty Documentation"
    | "Maintenance Checklists"
    | "Installation Guides"
    | "Safety Procedures";
  uploadedDate: string;
  uploadedBy: string;
  fileSize: number; // in bytes
  version: string;
  description?: string;
  tags: string[];
  fileName: string;
  fileExtension: string;
}

interface DocumentCategory {
  name: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

// Mock data generators
const generatePlantDocuments = (plantId: string): Document[] => [
  {
    id: "doc-001",
    name: "Huawei SUN2000-100KTL-M1 Technical Datasheet",
    type: "Technical Datasheets",
    uploadedDate: "2024-01-10T09:30:00Z",
    uploadedBy: "John Smith",
    fileSize: 2457600, // 2.4 MB
    version: "v1.0",
    description: "Complete technical specifications for inverter units",
    tags: ["inverter", "huawei", "specifications"],
    fileName: "huawei_sun2000_datasheet",
    fileExtension: "pdf",
  },
  {
    id: "doc-002",
    name: "Plant Commissioning Certificate",
    type: "Commissioning Certificates",
    uploadedDate: "2024-01-05T14:15:00Z",
    uploadedBy: "Sarah Johnson",
    fileSize: 1048576, // 1 MB
    version: "v1.0",
    description: "Official commissioning documentation and sign-off",
    tags: ["commissioning", "certification", "official"],
    fileName: "commissioning_certificate_2024",
    fileExtension: "pdf",
  },
  {
    id: "doc-003",
    name: "Operation and Maintenance Manual",
    type: "O&M Manuals",
    uploadedDate: "2024-01-08T11:20:00Z",
    uploadedBy: "Mike Wilson",
    fileSize: 5242880, // 5 MB
    version: "v2.1",
    description: "Comprehensive O&M procedures and guidelines",
    tags: ["operations", "maintenance", "procedures"],
    fileName: "om_manual_comprehensive",
    fileExtension: "pdf",
  },
  {
    id: "doc-004",
    name: "Environmental Compliance Report",
    type: "Regulatory Compliance",
    uploadedDate: "2024-01-12T16:45:00Z",
    uploadedBy: "Lisa Martinez",
    fileSize: 3145728, // 3 MB
    version: "v1.0",
    description: "Environmental impact assessment and compliance documentation",
    tags: ["environment", "compliance", "regulatory"],
    fileName: "environmental_compliance_2024",
    fileExtension: "pdf",
  },
  {
    id: "doc-005",
    name: "Inverter Warranty Certificate",
    type: "Warranty Documentation",
    uploadedDate: "2024-01-03T10:30:00Z",
    uploadedBy: "David Chen",
    fileSize: 524288, // 512 KB
    version: "v1.0",
    description: "25-year warranty documentation for inverter equipment",
    tags: ["warranty", "inverter", "25-year"],
    fileName: "inverter_warranty_cert",
    fileExtension: "pdf",
  },
  {
    id: "doc-006",
    name: "Monthly Maintenance Checklist",
    type: "Maintenance Checklists",
    uploadedDate: "2024-01-15T08:00:00Z",
    uploadedBy: "Alex Rodriguez",
    fileSize: 204800, // 200 KB
    version: "v3.0",
    description: "Standard monthly maintenance procedures and checkpoints",
    tags: ["maintenance", "checklist", "monthly"],
    fileName: "monthly_maintenance_checklist",
    fileExtension: "xlsx",
  },
  {
    id: "doc-007",
    name: "Tracker Installation Guide",
    type: "Installation Guides",
    uploadedDate: "2024-01-07T13:30:00Z",
    uploadedBy: "Emma Thompson",
    fileSize: 4194304, // 4 MB
    version: "v1.2",
    description: "Step-by-step installation guide for tracking systems",
    tags: ["tracker", "installation", "guide"],
    fileName: "tracker_installation_guide",
    fileExtension: "pdf",
  },
  {
    id: "doc-008",
    name: "Safety Procedures Manual",
    type: "Safety Procedures",
    uploadedDate: "2024-01-09T15:45:00Z",
    uploadedBy: "Robert Kim",
    fileSize: 1572864, // 1.5 MB
    version: "v2.0",
    description: "Comprehensive safety procedures and emergency protocols",
    tags: ["safety", "procedures", "emergency"],
    fileName: "safety_procedures_manual",
    fileExtension: "pdf",
  },
];

const getDocumentCategories = (documents: Document[]): DocumentCategory[] => [
  {
    name: "Technical Datasheets",
    count: documents.filter((d) => d.type === "Technical Datasheets").length,
    icon: FileText,
    description: "Technical specifications and datasheets",
  },
  {
    name: "O&M Manuals",
    count: documents.filter((d) => d.type === "O&M Manuals").length,
    icon: FileText,
    description: "Operation and maintenance manuals",
  },
  {
    name: "Commissioning Certificates",
    count: documents.filter((d) => d.type === "Commissioning Certificates")
      .length,
    icon: FileText,
    description: "Commissioning and certification documents",
  },
  {
    name: "Regulatory Compliance",
    count: documents.filter((d) => d.type === "Regulatory Compliance").length,
    icon: FileText,
    description: "Regulatory and compliance documentation",
  },
  {
    name: "Warranty Documentation",
    count: documents.filter((d) => d.type === "Warranty Documentation").length,
    icon: FileText,
    description: "Warranty certificates and documentation",
  },
  {
    name: "Maintenance Checklists",
    count: documents.filter((d) => d.type === "Maintenance Checklists").length,
    icon: FileText,
    description: "Maintenance checklists and procedures",
  },
  {
    name: "Installation Guides",
    count: documents.filter((d) => d.type === "Installation Guides").length,
    icon: FileText,
    description: "Installation guides and manuals",
  },
  {
    name: "Safety Procedures",
    count: documents.filter((d) => d.type === "Safety Procedures").length,
    icon: FileText,
    description: "Safety procedures and protocols",
  },
];

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getFileIcon = (extension: string) => {
  switch (extension.toLowerCase()) {
    case "pdf":
      return "📄";
    case "doc":
    case "docx":
      return "📝";
    case "xls":
    case "xlsx":
      return "📊";
    case "ppt":
    case "pptx":
      return "📽️";
    default:
      return "📄";
  }
};


export default function PlantDocuments() {
  const alert = useAlert();
  const [plant, setPlant] = useState<Plant | null>(() => {
    const raw = localStorage.getItem('selectedPlant');
    return raw ? (JSON.parse(raw) as Plant) : null;
  });
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('selectedPlant');
    const parsed = raw ? (JSON.parse(raw) as Plant) : null;
    setPlant(parsed);
    if (parsed?.id) {
      setDocuments(generatePlantDocuments(parsed.id.toString()));
    }
  }, []);

  if (!plant) {
    return <div>Plant not found</div>;
  }

  const documentCategories = getDocumentCategories(documents);

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    const matchesType = typeFilter === "all" || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Calculate KPIs
  const totalDocuments = documents.length;
  const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);
  const recentDocuments = documents.filter(
    (doc) =>
      new Date(doc.uploadedDate) >
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  ).length;

  const handleUpload = () => {
    // Simulate file upload
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      name: "New Document.pdf",
      type: "Technical Datasheets",
      uploadedDate: new Date().toISOString(),
      uploadedBy: "Current User",
      fileSize: 1048576,
      version: "v1.0",
      description: "Newly uploaded document",
      tags: ["new", "uploaded"],
      fileName: "new_document",
      fileExtension: "pdf",
    };
    setDocuments((prev) => [newDoc, ...prev]);
    alert.fileUploadSuccess("New Document.pdf");
    setIsUploadDialogOpen(false);
  };

  const handleExportList = () => {
    if (!plant) return;
    
    const headers = [
      'Document Name',
      'Type', 
      'Description',
      'Upload Date',
      'Uploaded By',
      'File Size',
      'Version',
      'Tags'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredDocuments.map(doc => [
        `"${doc.name}"`,
        `"${doc.type}"`,
        `"${doc.description || ''}"`,
        `"${new Date(doc.uploadedDate).toLocaleDateString()}"`,
        `"${doc.uploadedBy}"`,
        `"${formatFileSize(doc.fileSize)}"`,
        `"${doc.version}"`,
        `"${doc.tags.join('; ')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${plant.name}_documents_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert.exportNotification('CSV');
  };

  const uniqueTypes = Array.from(new Set(documents.map((d) => d.type)));

  return (
    <div className="flex flex-col h-full">
      <PlantNavigation />

      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {plant.name} - Document Repository
            </h1>
            <p className="text-muted-foreground">
              Central repository for all plant-specific documentation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Dialog
              open={isUploadDialogOpen}
              onOpenChange={setIsUploadDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload New Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <div className="text-lg font-medium mb-2">
                      Drag & drop files here
                    </div>
                    <div className="text-sm text-muted-foreground mb-4">
                      or click to browse files
                    </div>
                    <Button variant="outline">Browse Files</Button>
                  </div>
                  <div className="space-y-3">
                    <Input placeholder="Document name" />
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Document type" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input placeholder="Description (optional)" />
                    <Input placeholder="Tags (comma separated)" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsUploadDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleUpload}>Upload</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExportList}>
              <Download className="w-4 h-4" />
              Export List
            </Button>
          </div>
        </div>

        {/* Document KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Total Documents
                  </div>
                  <div className="text-2xl font-bold">{totalDocuments}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                  <HardDrive className="w-5 h-5 text-info" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Total Storage
                  </div>
                  <div className="text-2xl font-bold">
                    {formatFileSize(totalSize)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-success" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Recent Uploads
                  </div>
                  <div className="text-2xl font-bold text-success">
                    {recentDocuments}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Categories
                  </div>
                  <div className="text-2xl font-bold">
                    {documentCategories.length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Document Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {documentCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <div
                    key={category.name}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setTypeFilter(category.name)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="font-medium">{category.count}</div>
                    </div>
                    <div className="font-medium text-sm mb-1">
                      {category.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {category.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Document Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Document Library</CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {uniqueTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
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
                      Document
                    </th>
                    <th className="text-left p-4 font-medium text-sm">Type</th>
                    <th className="text-left p-4 font-medium text-sm">
                      Upload Date
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Uploaded By
                    </th>
                    <th className="text-left p-4 font-medium text-sm">Size</th>
                    <th className="text-left p-4 font-medium text-sm">
                      Version
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="border-t hover:bg-muted/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {getFileIcon(doc.fileExtension)}
                          </span>
                          <div>
                            <div className="font-medium">{doc.name}</div>
                            {doc.description && (
                              <div className="text-sm text-muted-foreground">
                                {doc.description}
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              {doc.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">{doc.type}</Badge>
                      </td>
                      <td className="p-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {new Date(doc.uploadedDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          {doc.uploadedBy}
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        {formatFileSize(doc.fileSize)}
                      </td>
                      <td className="p-4 text-sm">
                        <Badge variant="outline">{doc.version}</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
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
    </div>
  );
}
