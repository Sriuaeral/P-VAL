/**
 * PortfolioGeoMap Component
 * 
 * This component displays an interactive Google Maps view of solar plant locations.
 * It shows plant markers with status colors and provides detailed information on click.
 * 
 * Usage with plants data:
 * ```typescript
 * import PortfolioGeoMap from '@/components/PortfolioGeoMap';
 * 
 * // Transform plants data to the expected format
 * const portfolioSites = plants.map(plant => ({
 *   id: plant.id,
 *   name: plant.name,
 *   capacity: plant.capacity,
 *   region: plant.location.name,
 *   pr: plant.pr,
 *   cuf: plant.cuf,
 *   uptime: plant.availability,
 *   generation: plant.generation || 0,
 *   revenue: plant.revenue || 0,
 *   status: plant.status === "operational" ? "healthy" :
 *           plant.status === "maintenance" ? "attention" :
 *           plant.status === "offline" ? "offline" : "critical",
 *   coordinates: {
 *     lat: parseFloat(plant.location.latitude),
 *     lng: parseFloat(plant.location.longitude)
 *   },
 *   oemVendor: plant.oemVendor || "Unknown",
 *   lastUpdated: plant.lastUpdated,
 *   activeAlerts: plant.alertCount?.critical + plant.alertCount?.high + 
 *                 plant.alertCount?.medium + plant.alertCount?.low || 0,
 *   currentOutput: plant.currentOutput || 0,
 * }));
 * 
 * <PortfolioGeoMap sites={portfolioSites} />
 * ```
 * 
 * Note: Replace 'YOUR_GOOGLE_MAPS_API_KEY' with your actual Google Maps API key
 * or use environment variable: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
 */

import { useState, useEffect, useRef } from "react";

// Google Maps type declarations - using any for simplicity
declare global {
  namespace google {
    namespace maps {
      const Map: any;
      const Marker: any;
      const InfoWindow: any;
      const LatLng: any;
    }
  }
}
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MapPin,
  Zap,
  AlertTriangle,
  Eye,
  CloudRain,
  Sun,
  Cloud,
  Thermometer,
  Wind,
  Maximize2,
  Navigation,
  Layers,
  RefreshCw,
  Activity,
  TrendingUp,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

interface PortfolioSite {
  id: string;
  name: string;
  capacity: number;
  region: string;
  pr: number;
  cuf: number;
  uptime: number;
  generation: number;
  revenue: number;
  status: "healthy" | "attention" | "critical" | "offline";
  coordinates: { lat: number; lng: number };
  oemVendor: string;
  lastUpdated: string;
  activeAlerts?: number;
  currentOutput?: number;
}

interface WeatherData {
  siteId: string;
  temperature: number;
  cloudCover: number;
  windSpeed: number;
  irradiance: number;
  condition: "sunny" | "cloudy" | "rainy";
}

interface PortfolioGeoMapProps {
  sites: PortfolioSite[];
  className?: string;
}

// Generate mock weather data for each site
const generateWeatherData = (sites: PortfolioSite[]): WeatherData[] => {
  return sites.map((site) => ({
    siteId: site.id,
    temperature: Math.round(25 + Math.random() * 15), // 25-40°C
    cloudCover: Math.round(Math.random() * 100), // 0-100%
    windSpeed: Math.round(3 + Math.random() * 10), // 3-13 m/s
    irradiance: Math.round(400 + Math.random() * 600), // 400-1000 W/m²
    condition:
      Math.random() > 0.7
        ? "cloudy"
        : Math.random() > 0.1
          ? "sunny"
          : ("rainy" as "sunny" | "cloudy" | "rainy"),
  }));
};

export default function PortfolioGeoMap({
  sites,
  className = "",
}: PortfolioGeoMapProps) {
  const [selectedSite, setSelectedSite] = useState<PortfolioSite | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [showWeatherOverlay, setShowWeatherOverlay] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 23.5, lng: 77.5 }); // Center of India
  const [mapZoom, setMapZoom] = useState(5);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowsRef = useRef<any[]>([]);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      // Load Google Maps script dynamically
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (mapRef.current && !mapInstanceRef.current && window.google) {
          const map = new window.google.maps.Map(mapRef.current, {
            center: mapCenter,
            zoom: mapZoom,
            mapTypeId: window.google.maps.MapTypeId.ROADMAP,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
              {
                featureType: "transit",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
          });

          mapInstanceRef.current = map;
          setIsMapLoaded(true);
        }
      };

      script.onerror = () => {
        console.error("Error loading Google Maps");
      };

      document.head.appendChild(script);

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    };

    initMap();
  }, []);

  // Add markers when map is loaded and sites change
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current || sites.length === 0 || !window.google) return;

    const map = mapInstanceRef.current;
    const google = window.google;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    infoWindowsRef.current.forEach(infoWindow => infoWindow.close());
    markersRef.current = [];
    infoWindowsRef.current = [];

    // Add new markers
    sites.forEach((site, index) => {
      const marker = new google.maps.Marker({
        position: { lat: site.coordinates.lat, lng: site.coordinates.lng },
        map: map,
        title: site.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: getStatusColor(site.status),
          fillOpacity: 0.8,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
        },
      });

      // Create info window content
      const infoWindowContent = createInfoWindowContent(site, index);
      const infoWindow = new google.maps.InfoWindow({
        content: infoWindowContent,
        maxWidth: 300,
      });

      // Add click listener to marker
      marker.addListener("click", () => {
        // Close all other info windows
        infoWindowsRef.current.forEach(iw => iw.close());
        
        // Open this info window
        infoWindow.open(map, marker);
        
        // Set selected site for detail dialog
        setSelectedSite(site);
      });

      markersRef.current.push(marker);
      infoWindowsRef.current.push(infoWindow);
    });

    // Fit bounds to show all markers
    if (sites.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      sites.forEach(site => {
        bounds.extend({ lat: site.coordinates.lat, lng: site.coordinates.lng });
      });
      map.fitBounds(bounds);
    }

  }, [isMapLoaded, sites]);

  useEffect(() => {
    // Generate initial weather data
    setWeatherData(generateWeatherData(sites));
  }, [sites]);

  useEffect(() => {
    // Auto-refresh every 5 minutes
    if (!isAutoRefresh) return;

    const interval = setInterval(
      () => {
        setWeatherData(generateWeatherData(sites));
        setLastRefresh(new Date());
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [sites, isAutoRefresh]);

  const getStatusColor = (status: PortfolioSite["status"]): string => {
    switch (status) {
      case "healthy":
        return "#10B981"; // Green
      case "attention":
        return "#F59E0B"; // Yellow
      case "critical":
        return "#EF4444"; // Red
      case "offline":
        return "#9CA3AF"; // Gray
      default:
        return "#6B7280";
    }
  };

  const getStatusIcon = (status: PortfolioSite["status"]) => {
    switch (status) {
      case "healthy":
        return CheckCircle;
      case "attention":
        return AlertTriangle;
      case "critical":
        return AlertTriangle;
      case "offline":
        return Activity;
      default:
        return MapPin;
    }
  };

  const getWeatherIcon = (condition: WeatherData["condition"]) => {
    switch (condition) {
      case "sunny":
        return Sun;
      case "cloudy":
        return Cloud;
      case "rainy":
        return CloudRain;
      default:
        return Sun;
    }
  };

  const createInfoWindowContent = (site: PortfolioSite, index: number) => {
    const weather = weatherData.find((w) => w.siteId === site.id);
    const WeatherIcon = weather ? getWeatherIcon(weather.condition) : Sun;
    const StatusIcon = getStatusIcon(site.status);

    return `
      <div class="p-3 max-w-xs">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-3 h-3 rounded-full" style="background-color: ${getStatusColor(site.status)}"></div>
          <h3 class="font-semibold text-sm">${site.name}</h3>
        </div>
        <div class="text-xs text-gray-600 mb-2">
          <div>Capacity: ${site.capacity} MW</div>
          <div>Current Output: ${Math.round(site.currentOutput || 0)} MW</div>
          <div>Status: ${site.status.toUpperCase()}</div>
        </div>
        ${weather ? `
        <div class="text-xs text-gray-600 mb-2">
          <div>Temperature: ${weather.temperature}°C</div>
          <div>Irradiance: ${weather.irradiance} W/m²</div>
        </div>
        ` : ''}
        <button 
          onclick="window.openInfoWindowDetail('${site.id}')"
          class="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
        >
          View Details
        </button>
      </div>
    `;
  };

  // Add global function for info window button
  useEffect(() => {
    window.openInfoWindowDetail = (siteId: string) => {
      const site = sites.find(s => s.id === siteId);
      if (site) {
        setSelectedSite(site);
        setIsDetailDialogOpen(true);
      }
    };

    return () => {
      delete window.openInfoWindowDetail;
    };
  }, [sites]);

  const handleSiteClick = (site: PortfolioSite) => {
    setSelectedSite(site);
    setIsDetailDialogOpen(true);
  };

  const handleManualRefresh = () => {
    setWeatherData(generateWeatherData(sites));
    setLastRefresh(new Date());
  };

  const portfolioSummary = {
    totalSites: sites.length,
    healthySites: sites.filter((s) => s.status === "healthy").length,
    sitesWithAlerts: sites.filter(
      (s) => s.status === "attention" || s.status === "critical",
    ).length,
    totalActiveAlerts: sites.reduce((sum, s) => sum + (s.activeAlerts || 0), 0),
    totalCapacity: sites.reduce((sum, s) => sum + s.capacity, 0),
    totalOutput: sites.reduce(
      (sum, s) => sum + (s.currentOutput || s.generation),
      0,
    ),
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Portfolio Summary Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Summary Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 flex-1">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {portfolioSummary.totalSites}
                </div>
                <div className="text-xs text-muted-foreground">Total Sites</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {portfolioSummary.healthySites}
                </div>
                <div className="text-xs text-muted-foreground">
                  Healthy Sites
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {portfolioSummary.sitesWithAlerts}
                </div>
                <div className="text-xs text-muted-foreground">
                  Sites with Alerts
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {portfolioSummary.totalActiveAlerts}
                </div>
                <div className="text-xs text-muted-foreground">
                  Active Alerts
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {portfolioSummary.totalCapacity}
                </div>
                <div className="text-xs text-muted-foreground">Total MW</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(portfolioSummary.totalOutput)}
                </div>
                <div className="text-xs text-muted-foreground">Current MWh</div>
              </div>
            </div>

            {/* Map Controls */}
            <div className="flex items-center gap-4 ml-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="weather-overlay"
                  checked={showWeatherOverlay}
                  onCheckedChange={setShowWeatherOverlay}
                />
                <Label htmlFor="weather-overlay" className="text-sm">
                  Weather
                </Label>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                className="gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </Button>
              <div className="text-xs text-muted-foreground">
                Last: {lastRefresh.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Google Maps Container */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Portfolio Geographic Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative w-full h-[600px]">
            {/* Google Maps Container */}
            <div 
              ref={mapRef} 
              className="w-full h-full"
              style={{ minHeight: "600px" }}
            />
            
            {/* Loading Overlay */}
            {!isMapLoaded && (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <div className="text-sm text-gray-600">Loading Google Maps...</div>
                </div>
              </div>
            )}

            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border">
              <div className="text-xs font-medium mb-2">Site Status</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs">Healthy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-xs">Attention</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-xs">Critical</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <span className="text-xs">Offline</span>
                </div>
              </div>
            </div>

            {/* Map Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-10 h-10 p-0"
                onClick={() => {
                  if (mapInstanceRef.current && sites.length > 0 && window.google) {
                    const bounds = new window.google.maps.LatLngBounds();
                    sites.forEach(site => {
                      bounds.extend({ lat: site.coordinates.lat, lng: site.coordinates.lng });
                    });
                    mapInstanceRef.current.fitBounds(bounds);
                  }
                }}
              >
                <Navigation className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-10 h-10 p-0"
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + 1);
                  }
                }}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="w-10 h-10 p-0">
                <Layers className="w-4 h-4" />
              </Button>
            </div>

            {/* Weather Legend */}
            {showWeatherOverlay && (
              <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 border">
                <div className="text-xs font-medium mb-2">Weather</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sun className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs">Sunny</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cloud className="w-3 h-3 text-gray-500" />
                    <span className="text-xs">Cloudy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CloudRain className="w-3 h-3 text-blue-500" />
                    <span className="text-xs">Rainy</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Site Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              {selectedSite?.name}
            </DialogTitle>
            <DialogDescription>
              Site overview and performance summary
            </DialogDescription>
          </DialogHeader>

          {selectedSite && (
            <div className="space-y-6">
              {/* Site Status Header */}
              <div
                className="flex items-center justify-between p-4 rounded-lg"
                style={{
                  backgroundColor: `${getStatusColor(selectedSite.status)}15`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: getStatusColor(selectedSite.status),
                    }}
                  >
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">
                      {selectedSite.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedSite.region}
                    </div>
                  </div>
                </div>
                <Badge
                  style={{
                    backgroundColor: getStatusColor(selectedSite.status),
                  }}
                  className="text-white"
                >
                  {selectedSite.status.toUpperCase()}
                </Badge>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {selectedSite.capacity}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Capacity (MW)
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedSite.currentOutput ||
                        Math.round(selectedSite.generation * 0.8)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Current Output (MW)
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedSite.uptime}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Uptime (%)
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {selectedSite.activeAlerts ||
                        Math.floor(Math.random() * 5)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Active Alerts
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Performance Ratio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold">
                        {selectedSite.pr}%
                      </div>
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Above target (85%)
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Capacity Utilization
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold">
                        {selectedSite.cuf}%
                      </div>
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Within expected range
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Weather Information */}
              {showWeatherOverlay &&
                (() => {
                  const weather = weatherData.find(
                    (w) => w.siteId === selectedSite.id,
                  );
                  const WeatherIcon = weather
                    ? getWeatherIcon(weather.condition)
                    : Sun;

                  return (
                    weather && (
                      <Card className="bg-blue-50 border-blue-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <WeatherIcon className="w-4 h-4 text-blue-600" />
                            Current Weather Conditions
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-4 gap-4 text-center">
                            <div>
                              <div className="flex items-center justify-center gap-1">
                                <Thermometer className="w-3 h-3 text-red-500" />
                                <span className="font-semibold">
                                  {weather.temperature}°C
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Temperature
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-center gap-1">
                                <Cloud className="w-3 h-3 text-gray-500" />
                                <span className="font-semibold">
                                  {weather.cloudCover}%
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Cloud Cover
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-center gap-1">
                                <Wind className="w-3 h-3 text-blue-500" />
                                <span className="font-semibold">
                                  {weather.windSpeed} m/s
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Wind Speed
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-center gap-1">
                                <Sun className="w-3 h-3 text-yellow-500" />
                                <span className="font-semibold">
                                  {weather.irradiance} W/m²
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Irradiance
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  );
                })()}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button asChild className="flex-1">
                  <Link to={`/plants/${selectedSite.id}/monitor`}>
                    <Eye className="w-4 h-4 mr-2" />
                    CMS Details
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to={`/plants/${selectedSite.id}/alerts`}>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    View Alerts
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const url = `https://www.google.com/maps?q=${selectedSite.coordinates.lat},${selectedSite.coordinates.lng}`;
                    window.open(url, '_blank');
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in Maps
                </Button>
              </div>

              {/* Additional Info */}
              <div className="text-xs text-muted-foreground border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">OEM Vendor:</span>{" "}
                    {selectedSite.oemVendor}
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span>{" "}
                    {new Date(selectedSite.lastUpdated).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Coordinates:</span>{" "}
                    {selectedSite.coordinates.lat.toFixed(4)},{" "}
                    {selectedSite.coordinates.lng.toFixed(4)}
                  </div>
                  <div>
                    <span className="font-medium">Total Generation:</span>{" "}
                    {selectedSite.generation.toLocaleString()} MWh
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
