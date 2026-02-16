import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAlert } from "@/hooks/use-alert";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  FolderOpen,
  MapPin,
  DollarSign,
  Zap,
  AlertTriangle,
  Users,
  Building,
  Globe,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Target,
  TrendingUp,
  TrendingDown,
  Settings,
  Filter,
  Search,
} from "lucide-react";

interface PortfolioSite {
  id: string;
  name: string;
  capacity: number; // MW
  region: string;
  country: string;
  client: string;
  pr: number; // %
  cuf: number; // %
  uptime: number; // %
  generation: number; // MWh
  revenue: number; // USD
  status: "healthy" | "attention" | "critical" | "offline";
  coordinates: { lat: number; lng: number };
  oemVendor: string;
  lastUpdated: string;
  activeAlerts?: number;
  currentOutput?: number;
  bucketId?: string;
}

interface PortfolioBucket {
  id: string;
  name: string;
  description: string;
  criteria: string;
  color: string;
  createdAt: string;
  sites: PortfolioSite[];
}


// Enhanced mock data with more detailed information
const generatePortfolioSites = (): PortfolioSite[] => [
  {
    id: "1",
    name: "Plant 1",
    capacity: 150,
    region: "North India",
    country: "India",
    client: "NTPC Limited",
    pr: 86.5,
    cuf: 23.8,
    uptime: 98.7,
    generation: 2840,
    revenue: 184600,
    status: "healthy",
    coordinates: { lat: 26.9124, lng: 75.7873 },
    oemVendor: "Huawei",
    lastUpdated: "2024-01-15T10:30:00Z",
    activeAlerts: 0,
    currentOutput: 125,
  },
  {
    id: "2",
    name: "Plant 2",
    capacity: 200,
    region: "West India",
    country: "India",
    client: "Adani Green Energy",
    pr: 88.7,
    cuf: 24.1,
    uptime: 99.2,
    generation: 3820,
    revenue: 248300,
    status: "healthy",
    coordinates: { lat: 23.0225, lng: 72.5714 },
    oemVendor: "SMA",
    lastUpdated: "2024-01-15T10:32:00Z",
    activeAlerts: 1,
    currentOutput: 180,
  }
];

const predefinedBuckets: PortfolioBucket[] = [
  {
    id: "default",
    name: "All Assets",
    description: "Complete portfolio overview",
    criteria: "All Sites",
    color: "#3b82f6",
    createdAt: "2024-01-01T00:00:00Z",
    sites: [],
  },
  {
    id: "geography-india",
    name: "India Operations",
    description: "All Indian solar installations",
    criteria: "Country: India",
    color: "#10b981",
    createdAt: "2024-01-01T00:00:00Z",
    sites: [],
  },
  {
    id: "client-ntpc",
    name: "NTPC Portfolio",
    description: "Projects managed for NTPC Limited",
    criteria: "Client: NTPC Limited",
    color: "#f59e0b",
    createdAt: "2024-01-01T00:00:00Z",
    sites: [],
  },
  {
    id: "performance-high",
    name: "High Performers",
    description: "Sites with PR > 85%",
    criteria: "Performance Ratio > 85%",
    color: "#ef4444",
    createdAt: "2024-01-01T00:00:00Z",
    sites: [],
  },
];

export default function Portfolio() {
  const alert = useAlert();
  const handleViewSite = (siteId: string) => {
    alert.featureUnderConstruction('View site');
  };
  const [sites, setSites] = useState<PortfolioSite[]>(generatePortfolioSites());
  const [buckets, setBuckets] = useState<PortfolioBucket[]>(predefinedBuckets);
  const [selectedBucket, setSelectedBucket] = useState<string>("default");
  const [isCreateBucketOpen, setIsCreateBucketOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  
  // New bucket form state
  const [newBucketName, setNewBucketName] = useState("");
  const [newBucketDescription, setNewBucketDescription] = useState("");
  const [newBucketCriteria, setNewBucketCriteria] = useState("");
  const [newBucketColor, setNewBucketColor] = useState("#3b82f6");

  // Auto-assign sites to buckets based on criteria
  useEffect(() => {
    const updatedBuckets = buckets.map(bucket => {
      let filteredSites: PortfolioSite[] = [];
      
      switch (bucket.id) {
        case "default":
          filteredSites = sites;
          break;
        case "geography-india":
          filteredSites = sites.filter(site => site.country === "India");
          break;
        case "client-ntpc":
          filteredSites = sites.filter(site => site.client === "NTPC Limited");
          break;
        case "performance-high":
          filteredSites = sites.filter(site => site.pr > 85);
          break;
        default:
          // Custom buckets - maintain existing sites
          filteredSites = bucket.sites;
      }
      
      return { ...bucket, sites: filteredSites };
    });
    
    setBuckets(updatedBuckets);
  }, [sites]);

  const createNewBucket = () => {
    const newBucket: PortfolioBucket = {
      id: `custom-${Date.now()}`,
      name: newBucketName,
      description: newBucketDescription,
      criteria: newBucketCriteria,
      color: newBucketColor,
      createdAt: new Date().toISOString(),
      sites: [],
    };
    
    setBuckets([...buckets, newBucket]);
    setIsCreateBucketOpen(false);
    
    // Reset form
    setNewBucketName("");
    setNewBucketDescription("");
    setNewBucketCriteria("");
    setNewBucketColor("#3b82f6");
  };

  const deleteBucket = (bucketId: string) => {
    setBuckets(buckets.filter(bucket => bucket.id !== bucketId));
    if (selectedBucket === bucketId) {
      setSelectedBucket("default");
    }
  };

  const addSiteToBucket = (siteId: string, bucketId: string) => {
    const site = sites.find(s => s.id === siteId);
    if (!site) return;

    setBuckets(buckets.map(bucket => {
      if (bucket.id === bucketId) {
        const siteExists = bucket.sites.some(s => s.id === siteId);
        if (!siteExists) {
          return { ...bucket, sites: [...bucket.sites, site] };
        }
      }
      return bucket;
    }));
  };

  const removeSiteFromBucket = (siteId: string, bucketId: string) => {
    setBuckets(buckets.map(bucket => {
      if (bucket.id === bucketId) {
        return { ...bucket, sites: bucket.sites.filter(s => s.id !== siteId) };
      }
      return bucket;
    }));
  };

  const currentBucket = buckets.find(bucket => bucket.id === selectedBucket) || buckets[0];
  const availableSites = sites.filter(site => 
    !currentBucket.sites.some(bucketSite => bucketSite.id === site.id)
  );

  const filteredSites = currentBucket.sites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         site.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         site.region.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterBy === "all") return matchesSearch;
    if (filterBy === "healthy") return matchesSearch && site.status === "healthy";
    if (filterBy === "attention") return matchesSearch && site.status === "attention";
    if (filterBy === "critical") return matchesSearch && site.status === "critical";
    
    return matchesSearch;
  });

  // Calculate bucket KPIs
  const bucketKPIs = {
    totalCapacity: currentBucket.sites.reduce((sum, site) => sum + site.capacity, 0),
    totalGeneration: currentBucket.sites.reduce((sum, site) => sum + site.generation, 0),
    totalRevenue: currentBucket.sites.reduce((sum, site) => sum + site.revenue, 0),
    averagePR: currentBucket.sites.length > 0 ? 
      currentBucket.sites.reduce((sum, site) => sum + site.pr, 0) / currentBucket.sites.length : 0,
    totalAlerts: currentBucket.sites.reduce((sum, site) => sum + (site.activeAlerts || 0), 0),
    healthySites: currentBucket.sites.filter(site => site.status === "healthy").length,
    criticalSites: currentBucket.sites.filter(site => site.status === "critical").length,
  };

  const getStatusColor = (status: PortfolioSite["status"]) => {
    switch (status) {
      case "healthy": return "success";
      case "attention": return "warning"; 
      case "critical": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status: PortfolioSite["status"]) => {
    switch (status) {
      case "healthy": return "🟢";
      case "attention": return "🟡";
      case "critical": return "🔴";
      default: return "⚪";
    }
  };

  const bucketColors = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", 
    "#06b6d4", "#84cc16", "#f97316", "#ec4899", "#6366f1"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20">
      <div className="w-full py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Modern Premium Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-3xl p-2 sm:p-4 lg:p-6 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3 text-center lg:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/60 rounded-2xl blur-lg opacity-60"></div>
                    <div className="relative bg-gradient-to-r from-primary to-primary/80 p-3 rounded-2xl">
                      <FolderOpen className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-primary to-slate-700 dark:from-white dark:via-primary dark:to-slate-300 bg-clip-text text-transparent">
                      Portfolio Buckets
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 font-medium text-sm sm:text-base lg:text-lg">
                      Organize and manage your assets by custom criteria
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 justify-center lg:justify-end">
                {/* <Button variant="outline" size="lg" className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl">
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                </Button>
                <Button variant="outline" size="lg" className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl">
                  <Settings className="w-5 h-5 mr-2" />
                  Settings
                </Button> */}
                <Dialog open={isCreateBucketOpen} onOpenChange={setIsCreateBucketOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold px-6 sm:px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 touch-manipulation min-h-[44px]">
                      <Plus className="w-5 h-5 mr-2" />
                      <span className="hidden sm:inline">New Portfolio Bucket</span>
                      <span className="sm:hidden">New Bucket</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create Portfolio Bucket</DialogTitle>
                      <DialogDescription>
                        Create a custom portfolio bucket to organize your assets
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Bucket Name</Label>
                        <Input
                          id="name"
                          value={newBucketName}
                          onChange={(e) => setNewBucketName(e.target.value)}
                          placeholder="e.g., Premium Clients"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newBucketDescription}
                          onChange={(e) => setNewBucketDescription(e.target.value)}
                          placeholder="Brief description of this portfolio bucket"
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label htmlFor="criteria">Criteria</Label>
                        <Input
                          id="criteria"
                          value={newBucketCriteria}
                          onChange={(e) => setNewBucketCriteria(e.target.value)}
                          placeholder="e.g., Client tier, Geography, Performance level"
                        />
                      </div>
                      <div>
                        <Label htmlFor="color">Color</Label>
                        <div className="flex gap-2 mt-2">
                          {bucketColors.map(color => (
                            <button
                              key={color}
                              onClick={() => setNewBucketColor(color)}
                              className={`w-8 h-8 rounded-full border-2 ${
                                newBucketColor === color ? "border-foreground" : "border-border"
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateBucketOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createNewBucket} disabled={!newBucketName.trim()}>
                        Create Bucket
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Buckets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 3xl:grid-cols-4 gap-0 sm:gap-2 min-w-full">
            {buckets.map((bucket) => (
              <Card 
                key={bucket.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg w-full touch-manipulation ${
                  selectedBucket === bucket.id ? "ring-2 ring-primary" : ""
                }`}
                style={{ borderTopColor: bucket.color, borderTopWidth: "4px" }}
                onClick={() => setSelectedBucket(bucket.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: bucket.color }}
                      />
                      <CardTitle className="text-lg">{bucket.name}</CardTitle>
                    </div>
                    {bucket.id.startsWith("custom-") && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteBucket(bucket.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{bucket.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Criteria:</span> {bucket.criteria}
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <div className="font-bold text-primary">{bucket.sites.length}</div>
                      <div className="text-xs text-muted-foreground">Sites</div>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <div className="font-bold text-success">
                        {bucket.sites.reduce((sum, site) => sum + site.capacity, 0)}MW
                      </div>
                      <div className="text-xs text-muted-foreground">Capacity</div>
                    </div>
                  </div>

                  {/* Alert Summary */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span>🟢</span>
                        <span>{bucket.sites.filter(s => s.status === "healthy").length}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🟡</span>
                        <span>{bucket.sites.filter(s => s.status === "attention").length}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🔴</span>
                        <span>{bucket.sites.filter(s => s.status === "critical").length}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{bucket.sites.reduce((sum, site) => sum + (site.activeAlerts || 0), 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>


        {/* Selected Bucket Details */}
        {currentBucket && (
          <>
            {/* Bucket KPIs */}
            <Card style={{ borderTopColor: currentBucket.color, borderTopWidth: "4px" }}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-center sm:text-left">
                  <div className="flex items-center gap-3 justify-center sm:justify-start">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: currentBucket.color }}
                    />
                    <CardTitle className="text-lg sm:text-xl">{currentBucket.name} - Performance Overview</CardTitle>
                  </div>
                  <Badge variant="outline" className="w-fit mx-auto sm:mx-0">{filteredSites.length} Sites</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3">
                  <div className="text-center p-2 bg-muted/30 rounded-lg w-full">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary mb-1">
                      {bucketKPIs.totalCapacity}MW
                    </div>
                    <div className="text-xs text-muted-foreground">Total Capacity</div>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded-lg w-full">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-success mb-1">
                      {(bucketKPIs.totalGeneration / 1000).toFixed(1)}GWh
                    </div>
                    <div className="text-xs text-muted-foreground">Generation</div>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded-lg w-full">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-success mb-1">
                      {(bucketKPIs.totalRevenue / 1000000).toFixed(1)}M AED
                    </div>
                    <div className="text-xs text-muted-foreground">Revenue</div>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded-lg w-full">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-info mb-1">
                      {bucketKPIs.averagePR.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Avg PR</div>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded-lg w-full">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-success mb-1">
                      {bucketKPIs.healthySites}
                    </div>
                    <div className="text-xs text-muted-foreground">Healthy</div>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded-lg w-full">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-destructive mb-1">
                      {bucketKPIs.criticalSites}
                    </div>
                    <div className="text-xs text-muted-foreground">Critical</div>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded-lg w-full">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-warning mb-1">
                      {bucketKPIs.totalAlerts}
                    </div>
                    <div className="text-xs text-muted-foreground">Alerts</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sites Management */}
            <Card>
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 text-center lg:text-left">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl justify-center lg:justify-start">
                    <FolderOpen className="w-5 h-5" />
                    <span className="hidden sm:inline">Manage Sites in {currentBucket.name}</span>
                    <span className="sm:hidden">Sites in {currentBucket.name}</span>
                  </CardTitle>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-center lg:justify-end">
                    <div className="relative flex-1 sm:flex-none max-w-xs mx-auto sm:mx-0">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search sites..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-full sm:w-64"
                      />
                    </div>
                    <Select value={filterBy} onValueChange={setFilterBy}>
                      <SelectTrigger className="w-full sm:w-32 max-w-xs mx-auto sm:mx-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sites</SelectItem>
                        <SelectItem value="healthy">Healthy</SelectItem>
                        <SelectItem value="attention">Attention</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Sites Table */}
                <div className="overflow-x-auto">
                  <div>
                    <table className="w-full min-w-[800px]">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-medium">Site</th>
                        <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-medium hidden sm:table-cell">Client</th>
                        <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-medium hidden md:table-cell">Location</th>
                        <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-medium">Capacity</th>
                        <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-medium hidden lg:table-cell">PR</th>
                        <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-medium">Status</th>
                        <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-medium hidden md:table-cell">Alerts</th>
                        <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSites.map((site) => (
                        <tr key={site.id} className="border-t hover:bg-muted/30">
                          <td className="p-2 sm:p-3">
                            <div>
                              <div className="font-medium text-sm">{site.name}</div>
                              <div className="text-xs sm:text-sm text-muted-foreground">{site.oemVendor}</div>
                              <div className="sm:hidden text-xs text-muted-foreground mt-1">
                                {site.client} • {site.region}
                              </div>
                            </div>
                          </td>
                          <td className="p-2 sm:p-3 hidden sm:table-cell">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">{site.client}</span>
                            </div>
                          </td>
                          <td className="p-2 sm:p-3 hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <div className="text-sm">{site.region}</div>
                                <div className="text-xs text-muted-foreground">{site.country}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-2 sm:p-3 font-medium text-sm">{site.capacity}MW</td>
                          <td className="p-2 sm:p-3 font-medium text-sm hidden lg:table-cell">{site.pr.toFixed(1)}%</td>
                          <td className="p-2 sm:p-3">
                            <div className="flex items-center gap-2">
                              <span>{getStatusIcon(site.status)}</span>
                              <Badge variant={getStatusColor(site.status) as any} className="capitalize text-xs">
                                {site.status}
                              </Badge>
                            </div>
                          </td>
                          <td className="p-2 sm:p-3 hidden md:table-cell">
                            <Badge variant={site.activeAlerts ? "destructive" : "secondary"} className="text-xs">
                              {site.activeAlerts || 0}
                            </Badge>
                          </td>
                          <td className="p-2 sm:p-3">
                            <div className="flex items-center gap-1 sm:gap-2">
                                <Button variant="outline" size="sm" className="gap-1 text-xs px-2 py-1 touch-manipulation min-h-[32px]" onClick={() => handleViewSite(site.id)}>
                                  <Eye className="w-3 h-3" />
                                  <span className="hidden sm:inline">View</span>
                                </Button>
                              {currentBucket.id.startsWith("custom-") && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="gap-1 text-destructive hover:text-destructive text-xs px-2 py-1 touch-manipulation min-h-[32px]"
                                  onClick={() => removeSiteFromBucket(site.id, currentBucket.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span className="hidden sm:inline">Remove</span>
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    </table>
                  </div>
                </div>

                {/* Add Sites Section for Custom Buckets */}
                {currentBucket.id.startsWith("custom-") && availableSites.length > 0 && (
                  <div className="mt-6 p-3 sm:p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-3 text-sm sm:text-base text-center sm:text-left">Add Sites to this Bucket</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {availableSites.slice(0, 6).map((site) => (
                        <div 
                          key={site.id} 
                          className="flex items-center justify-between p-2 sm:p-3 bg-background rounded border w-full"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm truncate">{site.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{site.client}</div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="ml-2 flex-shrink-0 touch-manipulation min-h-[32px] min-w-[32px]"
                            onClick={() => addSiteToBucket(site.id, currentBucket.id)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    {availableSites.length > 6 && (
                      <div className="text-center mt-3 col-span-full">
                        <Button variant="outline" size="sm" className="text-xs sm:text-sm touch-manipulation min-h-[36px]">
                          View All Available Sites ({availableSites.length - 6} more)
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
