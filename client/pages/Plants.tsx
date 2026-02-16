import { useState, useMemo, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Plant } from "@shared/interface";
import { cn } from "@/lib/utils";
import { config } from "@/lib/config";
import { plantsService } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Upload,
  Image as ImageIcon,
  Building2,
  List,
  Globe,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  Activity,
  RefreshCw,
  RefreshCcw,
} from "lucide-react";
import { lazy, Suspense } from "react";

// Lazy load heavy map components
const PortfolioGeoMap = lazy(() => import("@/components/PortfolioGeoMap"));
const MultiPointMap = lazy(() => import("@/components/Mpas"));

const getStatusColor = (status: Plant["status"]) => {
  switch (status) {
    case "operational":
      return "success";
    case "maintenance":
      return "warning";
    case "offline":
      return "destructive";
    default:
      return "secondary";
  }
};

const getStatusIcon = (status: Plant["status"]) => {
  switch (status) {
    case "operational":
      return CheckCircle;
    case "maintenance":
      return Clock;
    case "offline":
      return XCircle;
    default:
      return AlertTriangle;
  }
};

// Generate solar PV plant image URLs showing actual solar installations
const getPlantImage = (plantId: string) => {
  // Using reliable placeholder service with solar-related themes
  const seed = plantId.toString().replace(/[^0-9]/g, '');
  const baseUrl = (import.meta as any).env?.BASE_URL || '/';
  const imageVariants = [
    `${baseUrl}Assets/logo1.png`,
    `${baseUrl}Assets/logo2.png`,
  ];

  return imageVariants[parseInt(seed) % imageVariants.length];
};

export default function Plants() {
  const [plants, setPlants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [plantImages, setPlantImages] = useState<{ [key: string]: string }>({});
  const [currentView, setCurrentView] = useState<"list" | "map">("list");
  const navigate = useNavigate();

  // Fetch plants data using enterprise service
  const fetchPlants = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      
      const plants = await plantsService.fetchPlants();
      
      if (plants && Array.isArray(plants) && plants.length > 0) {
        console.log(`✅ Successfully fetched ${plants.length} plants from enterprise service`);
        setPlants(plants);
        setError(null);
      } else {
        throw new Error('No plants data received from service');
      }
    } catch (err) {
      setError('Failed to load plants from enterprise service');
      setPlants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlants();
  }, []);

  // Extract unique locations from plants data
  const uniqueLocations = useMemo(() => {
    const locations = plants
      .map(plant => plant.location?.name)
      .filter(Boolean) // Remove null/undefined values
      .filter((location, index, array) => array.indexOf(location) === index) // Remove duplicates
      .sort(); // Sort alphabetically
    return locations;
  }, [plants]);

  const filteredPlants = useMemo(() => {
    return [...plants]
      .sort((a, b) => (a.id || 0) - (b.id || 0)) // Numeric sort for IDs
      .filter((plant) => {
      const matchesSearch =
        plant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plant.location?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || plant.status === statusFilter;
      const matchesLocation =
        locationFilter === "all" ||
        plant.location?.name === locationFilter;

      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [plants, searchQuery, statusFilter, locationFilter]);

  const totalCapacity = plants.reduce((sum, plant) => sum + (plant.capacity || 0), 0);
  const averagePR =
    plants.reduce((sum, plant) => sum + (plant.pr || 0), 0) / plants.length;
  const totalAlerts = plants.reduce(
    (sum, plant) =>
      sum +
      (plant.alertCount?.critical || 0) +
      (plant.alertCount?.high || 0) +
      (plant.alertCount?.medium || 0) +
      (plant.alertCount?.low || 0),
    0,
  );

  // Handle image upload
  const handleImageUpload = (plantId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setPlantImages(prev => ({ ...prev, [plantId]: imageUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle plant selection - store plant data and navigate
  const handlePlantSelect = (plant: Plant) => {
    // Store plant data in localStorage for child pages
    localStorage.setItem('selectedPlant', JSON.stringify(plant));
    navigate(`/plants/${plant.id}/monitor`);
  };

  // Transform plants data for geographical view
  const portfolioSites = useMemo(() => {
    return filteredPlants.map((plant) => ({
      ...plant, // Keep original plant data
      region: typeof plant.location === 'string' ? plant.location : plant.location?.name || 'Unknown',
      uptime: plant.availability || 0,
      generation: Math.random() * 1000 + 500, // Mock generation data
      revenue: Math.random() * 50000 + 25000, // Mock revenue data
      coordinates: plant.location || { latitude: '0', longitude: '0', name: 'Unknown' },
      oemVendor: ["Trina Solar", "JinkoSolar", "LONGi", "First Solar", "Canadian Solar"][Math.floor(Math.random() * 5)],
      lastUpdated: new Date().toISOString(),
      activeAlerts: (plant.alertCount?.critical || 0) + (plant.alertCount?.high || 0) + (plant.alertCount?.medium || 0) + (plant.alertCount?.low || 0),
      currentOutput: Math.random() * (plant.capacity || 0) * 0.8,
    }));
  }, [filteredPlants]);

  return (
    <div className="flex flex-col h-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      
      {/* Content */}
      <div className="flex-1 p-3 space-y-3 w-full">
        {/* Modern Premium Header */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Plants Overview 
              </h2>
              </div>
              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className="flex items-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg p-0.5 border border-white/30 dark:border-slate-700/50">
                  <Button
                    variant={currentView === "list" ? "default" : "ghost"}
                    size="sm"
                    className="gap-1 rounded-lg transition-all duration-300"
                    onClick={() => setCurrentView("list")}
                  >
                    <List className="w-4 h-4" />
                    List View
                  </Button>
                  <Button
                    variant={currentView === "map" ? "default" : "ghost"}
                    size="sm"
                    className="gap-1 rounded-lg transition-all duration-300"
                    onClick={() => setCurrentView("map")}
                  >
                    <Globe className="w-4 h-4" />
                    Map View
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 rounded-lg px-4 py-2 shadow-md hover:shadow-lg"
                  onClick={async () => {
                    setLoading(true);
                    setError(null);
                    // Force refresh using enterprise service
                    try {
                      const plants = await plantsService.refreshPlants();
                      setPlants(plants);
                      setError(null);
                    } catch (err) {
                      console.error('❌ Refresh failed:', err);
                      setError('Failed to refresh plants data');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                >
                  <RefreshCcw className="w-5 h-5 mr-1" />
                  {loading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            </div>
          </div>

        {/* Modern Summary Cards */}
        <div className="rounded-2xl bg-white/60 backdrop-blur-md shadow-lg p-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg relative overflow-hidden group">
                    {/* Glossy overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded-lg"></div>
                    {/* Inner shadow for depth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent rounded-lg"></div>
                    <Building2 className="w-5 h-5 text-white relative z-10 drop-shadow-sm" />
                  </div>
                  <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <div className="w-2.5 h-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded flex items-center justify-center relative overflow-hidden">
                      {/* Glossy overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded"></div>
                      {/* Inner shadow for depth */}
                      <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent rounded"></div>
                      <TrendingUp className="w-1.5 h-1.5 text-white relative z-10 drop-shadow-sm" />
                    </div>
                    Active
                  </div>
                </div>
                <div className="mb-2">
                  <h3 className="text-xs font-medium text-gray-600 mb-1">Total Plants</h3>
                  <div className="text-2xl font-bold text-blue-600">
                    {plants.length}
                  </div>
                  {/* <div className="text-xs text-gray-500">Active Assets</div> */}
                </div>
              </CardContent>
            </Card>

            {/* Total Capacity Card */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg relative overflow-hidden group">
                    {/* Glossy overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded-lg"></div>
                    {/* Inner shadow for depth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent rounded-lg"></div>
                    <Zap className="w-5 h-5 text-white relative z-10 drop-shadow-sm" />
                  </div>
                  <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <div className="w-2.5 h-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded flex items-center justify-center relative overflow-hidden">
                      {/* Glossy overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded"></div>
                      {/* Inner shadow for depth */}
                      <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent rounded"></div>
                      <TrendingUp className="w-1.5 h-1.5 text-white relative z-10 drop-shadow-sm" />
                    </div>
                    +5.2%
                  </div>
                </div>
                <div className="mb-2">
                  <h3 className="text-xs font-medium text-gray-600 mb-1">Total Capacity</h3>
                  <div className="text-2xl font-bold text-green-600">
                    {totalCapacity} kW
                  </div>
                  {/* <div className="text-xs text-gray-500">Installed Power</div> */}
                </div>
                {/* <div className="text-xs text-gray-600">
                  Target: 5000 kW
                  <span className="inline-flex items-center ml-2">
                    <div className="w-1.5 h-1.5 bg-gradient-to-br from-green-500 to-green-600 rounded-full mr-1"></div>
                    <span className="text-green-600 font-medium">
                      {((totalCapacity / 500) * 100).toFixed(1)}%
                    </span>
                  </span>
                </div> */}
              </CardContent>
            </Card>

            {/* Average PR Card */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg relative overflow-hidden group">
                    {/* Glossy overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded-lg"></div>
                    {/* Inner shadow for depth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent rounded-lg"></div>
                    <Target className="w-5 h-5 text-white relative z-10 drop-shadow-sm" />
                  </div>
                  <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <div className="w-2.5 h-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center relative overflow-hidden">
                      {/* Glossy overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded"></div>
                      {/* Inner shadow for depth */}
                      <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent rounded"></div>
                      <TrendingUp className="w-1.5 h-1.5 text-white relative z-10 drop-shadow-sm" />
                    </div>
                    +1.8%
                  </div>
                </div>
                <div className="mb-2">
                  <h3 className="text-xs font-medium text-gray-600 mb-1">Average PR</h3>
                  <div className="text-2xl font-bold text-blue-600">
                    {averagePR.toFixed(1)}%
                  </div>
                  {/* <div className="text-xs text-gray-500">Performance Ratio</div> */}
                </div>
                {/* <div className="text-xs text-gray-600">
                  Target: 85%
                  <span className="inline-flex items-center ml-2">
                    <div className="w-1.5 h-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mr-1"></div>
                    <span className="text-blue-600 font-medium">
                      {averagePR >= 85 ? 'Excellent' : averagePR >= 75 ? 'Good' : 'Needs Improvement'}
                    </span>
                  </span>
                </div> */}
              </CardContent>
            </Card>

            {/* Total Alerts Card */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg relative overflow-hidden group">
                    {/* Glossy overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded-lg"></div>
                    {/* Inner shadow for depth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent rounded-lg"></div>
                    <Activity className="w-5 h-5 text-white relative z-10 drop-shadow-sm" />
                  </div>
                  <div className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <div className="w-2.5 h-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded flex items-center justify-center relative overflow-hidden">
                      {/* Glossy overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded"></div>
                      {/* Inner shadow for depth */}
                      <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent rounded"></div>
                      <TrendingUp className="w-1.5 h-1.5 text-white relative z-10 drop-shadow-sm" />
                    </div>
                    Active
                  </div>
                </div>
                <div className="mb-2">
                  <h3 className="text-xs font-medium text-gray-600 mb-1">Total Alerts</h3>
                  <div className="text-2xl font-bold text-red-600">
                    {totalAlerts}
                  </div>
                  {/* <div className="text-xs text-gray-500">Active Notifications</div> */}
                </div>
                {/* <div className="text-xs text-gray-600">
                  Critical: {plants.reduce((sum, plant) => sum + (plant.alertCount?.critical || 0), 0)}
                  <span className="inline-flex items-center ml-2">
                    <div className="w-1.5 h-1.5 bg-gradient-to-br from-red-500 to-red-600 rounded-full mr-1"></div>
                    <span className="text-red-600 font-medium">
                      {totalAlerts > 10 ? 'High' : totalAlerts > 5 ? 'Medium' : 'Low'}
                    </span>
                  </span>
                </div> */}
              </CardContent>
            </Card>
        </div>

        {/* Modern Filters */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg rounded-xl p-3">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Search plants by name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-white/30 dark:border-slate-700/50 rounded-2xl h-12 text-base"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-white/30 dark:border-slate-700/50 rounded-2xl h-12">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-48 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-white/30 dark:border-slate-700/50 rounded-2xl h-12">
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {uniqueLocations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Loading and Error States */}
      {loading && (
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg rounded-xl p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-lg font-medium text-muted-foreground">Loading plants data...</p>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <Button 
              onClick={fetchPlants}
              variant="outline"
              size="sm"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCcw className="w-4 h-4 mr-1" />
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Conditional View Rendering */}
      {currentView === "list" && !loading ? (
        /* Premium List View */
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg rounded-xl p-3">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden group">
              {/* Glossy overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded-xl"></div>
              {/* Inner shadow for depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent rounded-xl"></div>
              <Building2 className="w-5 h-5 text-white relative z-10 drop-shadow-sm" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Plant Directory ({filteredPlants.length})
              </h2>
              <p className="text-xs text-gray-600">Manage and monitor your solar asset portfolio</p>
            </div>
          </div>
          <div className="overflow-hidden">
            <div className="overflow-hidden">
              <table className="table-premium table-fixed text-center">
                <thead>
                  <tr>
                    <th>
                      <div className="flex items-center justify-center gap-2">
                        {/* <ImageIcon className="w-4 h-4 text-muted-foreground" /> */}
                        Plant
                      </div>
                    </th>
                    <th className="hidden sm:table-cell">
                      <div className="flex items-center justify-center gap-2">
                        {/* <MapPin className="w-4 h-4 text-muted-foreground" /> */}
                        Location
                      </div>
                    </th>
                    <th className="hidden lg:table-cell">
                      <div className="flex items-center justify-center gap-2">
                        {/* <Building2 className="w-4 h-4 text-muted-foreground" /> */}
                        Capacity
                      </div>
                    </th>
                    <th className="text-center">Status</th>
                    <th className="hidden xl:table-cell text-center">PR</th>
                    <th className="hidden xl:table-cell text-center">CUF</th>
                    <th className="hidden md:table-cell text-center">Availability</th>
                    <th className="text-center">Alerts</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlants.map((plant, index) => {
                    const StatusIcon = getStatusIcon(plant.status);
                    const plantImage = plantImages[plant.id?.toString() || ''] || getPlantImage(plant.id?.toString() || '');

                    return (
                      <tr
                        key={plant.id}
                        className="group hover:bg-muted/30 transition-all duration-300 h-24"
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animation: 'fade-in 0.6s ease-out forwards',
                        }}
                      >
                        <div
                          onClick={() => handlePlantSelect(plant)}
                          className="contents cursor-pointer"
                        >
                          {/* Plant Image and Name */}
                          <td className="p-4 cursor-pointer transition-all duration-300 text-center">
                            <div className="flex items-center justify-center gap-4 h-full">
                              {/* Plant Image */}
                              <div className="relative group/image flex-shrink-0 mx-auto">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <div
                                      className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-muted/30 border-2 border-muted/40 group-hover:border-primary/30 transition-all duration-300 cursor-pointer hover:scale-105 shadow-sm hover:shadow-md flex items-center justify-center"
                                      onClick={(e) => e.preventDefault()}
                                    >
                                      <img
                                        src={plantImage}
                                        alt={`${plant.name} facility`}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-110"
                                        onError={(e) => {
                                          // Fallback to a simple SVG solar panel icon
                                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMGVhNWU5Ii8+CjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjM1IiBoZWlnaHQ9IjM1IiBmaWxsPSIjZmZmZmZmIiBvcGFjaXR5PSIwLjkiLz4KPHJlY3QgeD0iNTUiIHk9IjEwIiB3aWR0aD0iMzUiIGhlaWdodD0iMzUiIGZpbGw9IiNmZmZmZmYiIG9wYWNpdHk9IjAuOSIvPgo8cmVjdCB4PSIxMCIgeT0iNTUiIHdpZHRoPSIzNSIgaGVpZ2h0PSIzNSIgZmlsbD0iI2ZmZmZmZiIgb3BhY2l0eT0iMC45Ii8+CjxyZWN0IHg9IjU1IiB5PSI1NSIgd2lkdGg9IjM1IiBoZWlnaHQ9IjM1IiBmaWxsPSIjZmZmZmZmIiBvcGFjaXR5PSIwLjkiLz4KPHRleHQgeD0iNTAiIHk9IjUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IndoaXRlIj5TT0xBUjwvdGV4dD4KPC9zdmc+';
                                        }}
                                      />
                                    </div>
                                  </DialogTrigger>
                                  <DialogContent className="modal-premium max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>{plant.name} - Plant Image</DialogTitle>
                                      <DialogDescription>
                                        High resolution view of the solar facility
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="aspect-square w-full overflow-hidden rounded-lg">
                                      <img
                                        src={plantImage}
                                        alt={`${plant.name} facility`}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                {/* Upload Button */}
                                <div className="absolute -bottom-1 -right-1 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
                                  <label className="cursor-pointer">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleImageUpload(plant.id?.toString() || '', e)}
                                      className="hidden"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary/80 transition-colors duration-200 shadow-lg">
                                      <Upload className="w-3 h-3" />
                                    </div>
                                  </label>
                                </div>
                              </div>

                              {/* Plant Info */}
                              <div className="flex-1 min-w-0 flex flex-col justify-center items-center text-center">
                                <div className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300 leading-tight">
                                  {plant.name}
                                </div>
                                <div className="text-sm text-muted-foreground leading-tight">
                                  ID: {plant.id}
                                </div>
                                {/* Mobile-only additional info */}
                                <div className="sm:hidden mt-2 space-y-1">
                                  <div className="text-xs text-muted-foreground">
                                    📍 {plant.location?.name} • ⚡ {plant.capacity} kW
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    PR: {plant.pr}% • CUF: {plant.cuf}% • Avail: {plant.availability}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Location with Coordinates */}
                          <td className="p-4 text-sm cursor-pointer transition-all duration-300 hidden sm:table-cell text-center">
                            <div className="flex flex-col justify-center items-center h-full">
                              <div className="font-medium text-foreground leading-tight">{plant.location?.name}</div>
                              <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                <div>Lat: {plant.location?.latitude}°</div>
                                <div>Lng: {plant.location?.longitude}°</div>
                              </div>
                            </div>
                          </td>

                          {/* Capacity */}
                          <td className="p-4 text-sm font-medium cursor-pointer transition-all duration-300 hidden lg:table-cell text-center">
                            <div className="flex items-center justify-center gap-2 h-full">
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                              <span className="leading-tight">{plant.capacity} kW</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="p-4 cursor-pointer transition-all duration-300 text-center">
                            <div className="flex items-center justify-center h-full">
                              <Badge
                                variant={getStatusColor(plant.status) as any}
                                className="badge-status gap-1 capitalize transition-all duration-300 hover:scale-105"
                              >
                                <StatusIcon className="w-3 h-3" />
                                <span className="hidden sm:inline">{plant.status}</span>
                              </Badge>
                            </div>
                          </td>

                          {/* PR */}
                          <td className="p-4 text-sm font-medium cursor-pointer transition-all duration-300 hidden xl:table-cell text-center">
                            <div className="flex items-center justify-center gap-2 h-full">
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${(plant.pr || 0) >= 85 ? 'bg-success' : (plant.pr || 0) >= 75 ? 'bg-warning' : 'bg-destructive'}`}></div>
                              <span className="leading-tight">{plant.pr}%</span>
                            </div>
                          </td>

                          {/* CUF */}
                          <td className="p-4 text-sm font-medium cursor-pointer transition-all duration-300 hidden xl:table-cell text-center">
                            <div className="flex items-center justify-center gap-2 h-full">
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${(plant.cuf || 0) >= 20 ? 'bg-success' : (plant.cuf || 0) >= 15 ? 'bg-warning' : 'bg-destructive'}`}></div>
                              <span className="leading-tight">{plant.cuf}%</span>
                            </div>
                          </td>

                          {/* Availability */}
                          <td className="p-4 text-sm font-medium cursor-pointer transition-all duration-300 hidden md:table-cell text-center">
                            <div className="flex items-center justify-center gap-2 h-full">
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${(plant.availability || 0) >= 95 ? 'bg-success' : (plant.availability || 0) >= 90 ? 'bg-warning' : 'bg-destructive'}`}></div>
                              <span className="leading-tight">{plant.availability}%</span>
                            </div>
                          </td>

                          {/* Alerts */}
                          <td className="p-4 cursor-pointer transition-all duration-300 text-center">
                            <div className="flex items-center justify-center gap-1 flex-wrap h-full">
                              {(plant.alertCount?.critical || 0) > 0 && (
                                <Badge
                                  variant="destructive"
                                  className="badge-premium text-xs px-2 py-1 transition-all duration-300 hover:scale-105"
                                >
                                  {(plant.alertCount?.critical || 0)}C
                                </Badge>
                              )}
                              {(plant.alertCount?.high || 0) > 0 && (
                                <Badge variant="warning" className="badge-premium text-xs px-2 py-1 transition-all duration-300 hover:scale-105">
                                  {(plant.alertCount?.high || 0)}H
                                </Badge>
                              )}
                              {(plant.alertCount?.medium || 0) > 0 && (
                                <Badge variant="secondary" className="badge-premium text-xs px-2 py-1 transition-all duration-300 hover:scale-105">
                                  {(plant.alertCount?.medium || 0)}M
                                </Badge>
                              )}
                              {(plant.alertCount?.low || 0) > 0 && (
                                <Badge variant="outline" className="badge-premium text-xs px-2 py-1 transition-all duration-300 hover:scale-105">
                                  {(plant.alertCount?.low || 0)}L
                                </Badge>
                              )}
                              {/* Show total alert count on small screens */}
                              <div className="sm:hidden">
                                <Badge variant="outline" className="badge-premium text-xs px-2 py-1">
                                  {(plant.alertCount?.critical || 0) + (plant.alertCount?.high || 0) + (plant.alertCount?.medium || 0) + (plant.alertCount?.low || 0)} alerts
                                </Badge>
                              </div>
                            </div>
                          </td>
                        </div>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : !loading ? (
        /* Geographical View */
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg rounded-xl p-3">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden group">
              {/* Glossy overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded-xl"></div>
              {/* Inner shadow for depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent rounded-xl"></div>
              <Globe className="w-5 h-5 text-white relative z-10 drop-shadow-sm" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Geographic View
              </h2>
              <p className="text-xs text-gray-600">Interactive map of your solar plant locations</p>
            </div>
          </div>
          <div className="overflow-hidden">
            <Suspense fallback={
              <div className="h-[600px] w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Loading map...</div>
                </div>
              </div>
            }>
              <MultiPointMap
                plants={portfolioSites}
                showPlantDataTool={true}
                locations={portfolioSites.map((site) => ({
                  plantId: site.id,
                  plantName: site.name + '-  ' + site.status,
                  coordinates: [parseFloat(site.coordinates.longitude), parseFloat(site.coordinates.latitude)],
                  color: site.status === 'operational' ? '#F87060' : site.status === 'maintenance' ? '#ffaa00' : '#ff0000',
                }))}
                initialCenter={portfolioSites.length > 0 ? [parseFloat(portfolioSites[0].coordinates.longitude), parseFloat(portfolioSites[0].coordinates.latitude)] : [55.0250, 24.9300]}
                initialZoom={12}
                style={{ height: '600px', width: '100%' }}
              />
            </Suspense>
          </div>
        </div>
      ) : null}
      </div>
    </div>
  );
}
