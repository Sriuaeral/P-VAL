import { useState, useEffect, lazy, Suspense, useMemo, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { Plant, WeatherData, KPI, POCData, Alert, KPIs, EnergyData, PowerData, InverterHeatmapData, RevenueData, PowerFactorData, AlertCount } from "@shared/interface";
import { getPlantWeatherData, getPlantKPIData, getPlantAlertsData, getPlantPOCData, getPlantEnergyData, getPlantPowerData, getPlantInverterHeatmapData, getPlantRevenueData, getPlantPowerFactorData } from '@shared/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Zap,
  DollarSign,
  Battery,
  Power,
  BarChart3,
  Navigation,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUpLeft,
  ArrowDownLeft,
  Clock,
  Sun,
  Leaf,
  Loader2,
} from "lucide-react";
import PlantNavigation from "@/components/PlantNavigation";
import DigitalTwinOperationsCenter from "@/components/DigitalTwinOperationsCenter";
import PowerFactorGauge from "@/components/PowerFactorGauge";
import InverterHeatmap from "@/components/InverterHeatMap";
import HeatMapGrid from "@/components/ui/HeatMapGrid";

// Lazy load heavy components
const SolarPVDiagram = lazy(() => import("@/components/SolarPVDiagram"));

// Loading component for Suspense fallback
const ComponentLoader = () => (
  <div className="flex items-center justify-center h-32 bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg rounded-xl">
    <div className="flex items-center gap-3">
      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
      <span className="text-sm text-gray-600">Loading diagram...</span>
    </div>
  </div>
);

// Data loading states
interface DataLoadingState {
  weather: boolean;
  kpis: boolean;
  alerts: boolean;
  pocData: boolean;
  energyData: boolean;
  powerData: boolean;
  inverterHeatmapData: boolean;
  revenueData: boolean;
  powerFactorData: boolean;
}

export default function PlantMonitor() {
  const { plantId } = useParams<{ plantId: string }>();
  const [showDigitalTwin, setShowDigitalTwin] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef(false);
  
  // Global refresh lock to prevent multiple components from refreshing simultaneously
  const globalRefreshLock = useRef(false);
  
  // Data states
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [alerts, setAlerts] = useState<AlertCount | null>(null);
  const [pocData, setPocData] = useState<POCData | null>(null);
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const [powerData, setPowerData] = useState<PowerData[]>([]);
  const [inverterHeatmapData, setInverterHeatmapData] = useState<InverterHeatmapData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [powerFactorData, setPowerFactorData] = useState<PowerFactorData | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState<DataLoadingState>({
    weather: false,
    kpis: false,
    alerts: false,
    pocData: false,
    energyData: false,
    powerData: false,
    inverterHeatmapData: false,
    revenueData: false,
    powerFactorData: false,
  });

  // Use mock data directly

  const plant =  JSON.parse(localStorage.getItem('selectedPlant')) || null;
  const plantName = plant?.name || 'Unknown Plant';

  // Get current date and time for API calls
  // Use a more stable time to prevent cache invalidation every minute
  const getCurrentDateTime = () => {
    const now = new Date();
    const date = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
    // Round down to the nearest 5-minute interval to reduce cache churn
    const minutes = Math.floor(now.getMinutes() / 5) * 5;
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    return { date, time };
  };

  // Optimized data fetching with prioritization and cancellation
  const fetchPlantData = useCallback(async (plantId: string, signal?: AbortSignal) => {
    if (!plantId) return;

    // Prevent multiple simultaneous calls (both local and global)
    if (isFetchingRef.current || globalRefreshLock.current) {
      console.log('Already fetching data, skipping...');
      return;
    }

    isFetchingRef.current = true;
    globalRefreshLock.current = true;

    // Get current date and time
    const { date, time } = getCurrentDateTime();

    // Check if request was cancelled
    if (signal?.aborted) return;

    // Phase 1: Critical data (alerts, KPIs, revenue) - Load first
    setLoading(prev => ({ ...prev, alerts: true, kpis: true, revenueData: true }));
    
    try {
      const [alertsData, kpiData, revenueData] = await Promise.all([
        getPlantAlertsData(plantId, time, date),
        getPlantKPIData(plantId, time, date),
        getPlantRevenueData(plantId, time, date)
      ]);
      
      // Check if request was cancelled before setting state
      if (signal?.aborted) return;
      
      setAlerts(alertsData);
      setKpis(kpiData);
      setRevenueData(revenueData);
    } catch (error) {
      if (!signal?.aborted) {
        console.error('Critical data fetch failed:', error);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(prev => ({ ...prev, alerts: false, kpis: false, revenueData: false }));
      }
    }

    // Check if request was cancelled
    if (signal?.aborted) return;

    // Phase 2: High priority data (weather, POC, power factor) - Load second
    setLoading(prev => ({ ...prev, weather: true, pocData: true, powerFactorData: true }));
    
    try {
      const [weatherData, pocData, powerFactorData] = await Promise.all([
        getPlantWeatherData(plantId, time, date),
        getPlantPOCData(plantId, time, date),
        getPlantPowerFactorData(plantId, time, date)
      ]);
      
      // Check if request was cancelled before setting state
      if (signal?.aborted) return;
      
      setWeather(weatherData);
      setPocData(pocData);
      setPowerFactorData(powerFactorData);
    } catch (error) {
      if (!signal?.aborted) {
        console.error('High priority data fetch failed:', error);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(prev => ({ ...prev, weather: false, pocData: false, powerFactorData: false }));
      }
    }

    // Check if request was cancelled
    if (signal?.aborted) return;

    // Phase 3: Medium priority data (energy, power) - Load third
    setLoading(prev => ({ ...prev, energyData: true, powerData: true }));
    
    try {
      const [energyData, powerData] = await Promise.all([
        getPlantEnergyData(plantId, time, date),
        getPlantPowerData(plantId, time, date)
      ]);
      
      // Check if request was cancelled before setting state
      if (signal?.aborted) return;
      
      setEnergyData(energyData);
      setPowerData(powerData);
    } catch (error) {
      if (!signal?.aborted) {
        console.error('Medium priority data fetch failed:', error);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(prev => ({ ...prev, energyData: false, powerData: false }));
      }
    }

    // Check if request was cancelled
    if (signal?.aborted) return;

    // Phase 4: Low priority data (heatmap) - Load last
    setLoading(prev => ({ ...prev, inverterHeatmapData: true }));
    
    try {
      const heatmapData = await getPlantInverterHeatmapData(plantId, time, date);
      
      // Check if request was cancelled before setting state
      if (signal?.aborted) return;
      
      setInverterHeatmapData(heatmapData);
    } catch (error) {
      if (!signal?.aborted) {
        console.error('Low priority data fetch failed:', error);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(prev => ({ ...prev, inverterHeatmapData: false }));
      }
    }

    // Reset fetching flags
    isFetchingRef.current = false;
    globalRefreshLock.current = false;
  }, []);

  // Manual refresh function
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Single useEffect for all data fetching with cancellation and auto-refresh
  useEffect(() => {
    if (!plantId || !plant?.id) return;

    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Create AbortController for request cancellation
    const abortController = new AbortController();
    
    // Fetch data with cancellation signal
    fetchPlantData(plantId, abortController.signal);

    // Set up auto-refresh every 5 minutes (5 * 60 * 1000 = 300,000 ms)
    // Reduced from 17 minutes to prevent stale data
    intervalRef.current = setInterval(() => {
      console.log('Auto-refreshing data...');
      // Only refresh if not already fetching (both local and global)
      if (!isFetchingRef.current && !globalRefreshLock.current) {
        fetchPlantData(plantId, abortController.signal);
      } else {
        console.log('Skipping auto-refresh - already fetching data');
      }
    }, 5 * 60 * 1000);

    // Cleanup function to cancel requests and clear interval
    return () => {
      abortController.abort();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Reset global lock on cleanup
      globalRefreshLock.current = false;
    };
  }, [plantId, refreshKey, fetchPlantData]);

  // Helper function to safely format numeric values
  const formatNumericValue = (value: string | number | undefined, decimals: number = 1): string => {
    if (value === undefined || value === null) return '--';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '--';
    return decimals > 0 ? numValue.toFixed(decimals) : Math.round(numValue).toString();
  };

  if (!plant) {
    return <div>Plant not found</div>;
  }

  // Memoized data generation functions for performance
  const energyRevenueData = useMemo(() => {
    if (!revenueData) {
      return {
        energyToday: 0,
        revenueToday: 0,
        energyThisMonth: 0,
        revenueThisMonth: 2847,
        specificYield: 0,
        co2Saved: 0,
        co2SavedThisMonth: 0,
        traiffRate: 0,
      };
    }

    return {
      energyToday: revenueData.energyToday,
      revenueToday: revenueData.revenueToday,
      energyThisMonth: revenueData.energyThisMonth,
      revenueThisMonth: revenueData.revenueThisMonth,
      specificYield: revenueData.specificYield,
      co2Saved: revenueData.co2Saved,
      co2SavedThisMonth: revenueData.co2SavedThisMonth,
      traiffRate: revenueData.traiffRate,
    };
  }, [revenueData]);

  const forecastData = useMemo(() => {
    if (!powerData || powerData.length === 0) {
      return [];
    }

    return powerData.map((data) => ({
      hour: data.hour,
      forecast: data.value,
      realTime: data.actualValue,
    }));
  }, [powerData]);

  const energyChartData = useMemo(() => {
    if (!energyData || energyData.length === 0) {
      return [];
    }

    return energyData.map((data) => ({
      hour: data.hour,
      energy: Math.round(data.value),
      actualEnergy: Math.round(data.actualValue)
    }));
  }, [energyData]);

  // Wind direction icon helper
  const getWindDirectionIcon = (direction: string) => {
    const iconMap: { [key: string]: any } = {
      'N': ArrowUp,
      'NE': ArrowUpRight,
      'E': ArrowRight,
      'SE': ArrowDownRight,
      'S': ArrowDown,
      'SW': ArrowDownLeft,
      'W': ArrowLeft,
      'NW': ArrowUpLeft,
    };
    return iconMap[direction] || Navigation;
  };

  // Memoized inverter data generation for HeatMapGrid
  const inverterHeatMapData = useMemo(() => {
    console.log('Inverter Heatmap Data:', inverterHeatmapData);
    console.log('Data length:', inverterHeatmapData?.length);
    
    if (!inverterHeatmapData || inverterHeatmapData.length === 0) {
      console.log('Using mock data - no API data available');
      // Generate mock data for demonstration with realistic heatmap patterns
      const mockData = [];
      for (let inverterIndex = 0; inverterIndex < 22; inverterIndex++) {
        const inverterId = `INV-${(inverterIndex + 1).toString().padStart(3, '0')}`;
        for (let hour = 5; hour <= 19; hour++) {
          // Create realistic patterns: higher values during day hours (6-18), lower at night
          let baseValue = 20;
          if (hour >= 6 && hour <= 18) {
            // Day hours: higher values with some variation
            baseValue = 30 + (hour - 6) * 3 + Math.random() * 20;
          } else if (hour >= 19 && hour <= 23) {
            // Evening: decreasing values
            baseValue = 25 + Math.random() * 15;
          } else {
            // Night hours: lower values
            baseValue = 20 + Math.random() * 10;
          }
          
          // Add some inverter-specific variation
          const inverterVariation = (inverterIndex % 5) * 5;
          const power = Math.min(100, Math.max(0, baseValue + inverterVariation + (Math.random() - 0.5) * 10));
          
          mockData.push({
            inverterId,
            inverterName: inverterId,
            hour: hour.toString().padStart(2, '0') + ':00',
            value: power,
            power: power
          });
        }
      }
      return mockData;
    }
    
    console.log('Using API data - processing real data');
    return inverterHeatmapData.map(data => ({
      inverterId: data.inverterId,
      inverterName: data.inverterName || `INV-${data.inverterId.padStart(3, '0')}`,
      hour: data.hour,
      value: data.value,
      power: data.value
    }));
  }, [inverterHeatmapData]);

  if (!plantId || !plant?.id) {
    return (
      <div className="flex flex-col h-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <PlantNavigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-600" />
            <div className="text-lg font-semibold">Plant not found</div>
            <div className="text-sm text-gray-600">Please select a plant from the plants page</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Plant Navigation with Header */}
      <PlantNavigation onRefresh={handleRefresh} />

      {/* Content */}
      <div className="flex-1 p-3 space-y-3 w-full">

        {/* Solar PV System Block Diagram - Moved to Top */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg rounded-xl p-3">
          <Suspense fallback={<ComponentLoader />}>
            <SolarPVDiagram plantId={plantId!} />
          </Suspense>
        </div>

        {/* Modern KPI Cards */}
        <div className="rounded-2xl bg-white/60 backdrop-blur-md shadow-lg p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Energy Today Card */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg relative overflow-hidden group">
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
                    +2.4%
                  </div>
                </div>
                <div className="mb-2">
                  <h3 className="text-xs font-medium text-gray-600 mb-1">Energy Today</h3>
                  <div className="text-2xl font-bold text-blue-600">
                    {loading.revenueData ? (
                      <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
                    ) : (
                      Math.round(energyRevenueData.energyToday)
                    )}
                  </div>
                  <div className="text-xs text-gray-500">kWh</div>
                </div>
                <div className="text-xs text-gray-600">
                    Plant Capacity: {plant.capacity} KWh
                    <span className="inline-flex items-center ml-2">
                      <div className="w-1.5 h-1.5 bg-gradient-to-br from-green-500 to-green-600 rounded-full mr-1"></div>
                      <span className="text-green-600 font-medium">
                        {loading.revenueData ? '--' : energyRevenueData.specificYield.toFixed(2)}
                      </span>
                    </span>
                  </div>
              </CardContent>
            </Card>

            {/* Revenue Today Card */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br rounded-lg flex items-center justify-center shadow-lg relative overflow-hidden group">
                    {/* Glossy overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded-xl"></div>
                    {/* Inner shadow for depth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent rounded-xl"></div>
                    <img 
                      src="/assets/UAE_Dirham_Symbol.svg" 
                      alt="UAE Dirham" 
                      className="w-6 h-6 relative z-10 drop-shadow-sm" 
                    /> 
                  </div>
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                   Tariff :  {energyRevenueData.traiffRate.toFixed(2)} AED / kWh
                  </div>
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <div className="w-3 h-3 bg-gradient-to-br from-green-500 to-green-600 rounded flex items-center justify-center relative overflow-hidden">
                      {/* Glossy overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded"></div>
                      {/* Inner shadow for depth */}
                      <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent rounded"></div>
                      <TrendingUp className="w-2 h-2 text-white relative z-10 drop-shadow-sm" />
                    </div>
                    +1.8%
                  </div>
                 
                </div>
                <div className="mb-3">
                  <h3 className="text-xs font-medium text-gray-600 mb-1">Revenue Today</h3>
                  <div className="text-3xl font-bold text-green-600">
                    {loading.revenueData ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                    ) : (
                      `${energyRevenueData.revenueToday.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED`
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                    Monthly: {energyRevenueData.revenueThisMonth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
                    <span className="inline-flex items-center ml-2">
                      <div className="w-2 h-2 bg-gradient-to-br from-green-500 to-green-600 rounded-full mr-1"></div>
                      <span className="text-green-600 font-medium">+12.3%</span>
                    </span>
                  </div>
              </CardContent>
            </Card>

            {/* CO2 Saved Card */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden group">
                    {/* Glossy overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded-xl"></div>
                    {/* Inner shadow for depth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent rounded-xl"></div>
                    <Leaf className="w-6 h-6 text-white relative z-10 drop-shadow-sm" />
                  </div>
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <div className="w-3 h-3 bg-gradient-to-br from-green-500 to-green-600 rounded flex items-center justify-center relative overflow-hidden">
                      {/* Glossy overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded"></div>
                      {/* Inner shadow for depth */}
                      <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent rounded"></div>
                      <TrendingUp className="w-2 h-2 text-white relative z-10 drop-shadow-sm" />
                    </div>
                    +3.2%
                  </div>
                </div>
                <div className="mb-3">
                  <h3 className="text-xs font-medium text-gray-600 mb-1">CO2 Saved</h3>
                  <div className="text-3xl font-bold text-green-600">
                    {loading.revenueData ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : (
                      `${energyRevenueData.co2Saved.toFixed(2)}t`
                    )}
                  </div>
                  <div className="text-sm text-gray-500">Tons</div>
                </div>
                <div className="text-sm text-gray-600">
                    This Month: {loading.revenueData ? '--' : `${energyRevenueData.co2SavedThisMonth.toFixed(2)}t`}
                    <span className="inline-flex items-center ml-2">
                      <div className="w-2 h-2 bg-gradient-to-br from-green-500 to-green-600 rounded-full mr-1"></div>
                      <span className="text-green-600 font-medium">+8.7%</span>
                    </span>
                  </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Glassmorphism System Alerts Section */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl p-6 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-orange-500/5 to-yellow-500/5 rounded-3xl"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/10 to-orange-600/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden group animate-blink">
                   {/* Glossy overlay */}
                   <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded-xl"></div>
                   {/* Inner shadow for depth */}
                   <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent rounded-xl"></div>
                   <AlertTriangle className="w-5 h-5 text-white relative z-10 drop-shadow-sm" />
                 </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Alerts
                  </h2>
                  
                </div>
              </div>
              <div className="bg-red-500/20 backdrop-blur-sm text-red-700 px-4 py-2 rounded-full text-xs font-semibold border border-red-300/30 shadow-lg">
                {alerts?.critical + alerts?.high + alerts?.medium + alerts?.low} Active Alerts
              </div>
            </div>

                         {/* Alert Cards */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Critical Alerts Card */}
              <Card className="bg-white/20 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-red-600/10"></div>
                                 <div className="absolute top-3 right-3 w-2 h-2 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-lg animate-blink-fast"></div>
                <CardContent className="p-4 text-center relative z-10">
                                     <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg relative overflow-hidden group animate-blink">
                     {/* Glossy overlay */}
                     <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded-xl"></div>
                     {/* Inner shadow for depth */}
                     <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent rounded-xl"></div>
                     <AlertTriangle className="w-6 h-6 text-white relative z-10 drop-shadow-sm" />
                   </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent mb-1">
                    {alerts?.critical}
                  </div>
                  <h3 className="text-xs font-bold text-gray-1000 mb-1">Critical Alerts</h3>
                  <p className="text-xs text-gray-600">Requires immediate attention</p>
                  {/* <div className="text-sm font-medium text-red-600 bg-white/20 backdrop-blur-sm rounded-xl p-2 border border-white/30">Impact: $2,400/hr</div> */}
                </CardContent>
              </Card>

              {/* High Priority Card */}
              <Card className="bg-white/20 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10"></div>
                                 <div className="absolute top-3 right-3 w-2 h-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-lg animate-blink"></div>
                <CardContent className="p-4 text-center relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg relative overflow-hidden group">
                    {/* Glossy overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded-xl"></div>
                    {/* Inner shadow for depth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent rounded-xl"></div>
                    <AlertTriangle className="w-6 h-6 text-white relative z-10 drop-shadow-sm" />
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent mb-1">
                    {alerts?.high}
                  </div>
                  <h3 className="text-xs font-bold text-gray-1000 mb-1">High Priority</h3>
                  <p className="text-xs text-gray-600">Address within 24 hours</p>
                  {/* <div className="text-sm font-medium text-orange-600 bg-white/20 backdrop-blur-sm rounded-xl p-2 border border-white/30">Impact: $1,200/hr</div> */}
                </CardContent>
              </Card>

              {/* Medium Priority Card */}
              <Card className="bg-white/20 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10"></div>
                                 <div className="absolute top-3 right-3 w-2 h-2 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full shadow-lg animate-blink"></div>
                <CardContent className="p-4 text-center relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg relative overflow-hidden group">
                    {/* Glossy overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded-xl"></div>
                    {/* Inner shadow for depth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent rounded-xl"></div>
                    <AlertTriangle className="w-6 h-6 text-white relative z-10 drop-shadow-sm" />
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent mb-1">
                    {alerts?.medium}
                  </div>
                  <h3 className="text-xs font-bold text-gray-1000 mb-1">Medium Priority</h3>
                  <p className="text-xs text-gray-600">Monitor and review</p>
                  {/* <div className="text-sm font-medium text-yellow-600 bg-white/20 backdrop-blur-sm rounded-xl p-2 border border-white/30">Impact: $400/hr</div> */}
                </CardContent>
              </Card>

              {/* Low Priority Card */}
              <Card className="bg-white/20 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10"></div>
                                 <div className="absolute top-3 right-3 w-2 h-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg animate-blink"></div>
                <CardContent className="p-4 text-center relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg relative overflow-hidden group">
                    {/* Glossy overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded-xl"></div>
                    {/* Inner shadow for depth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent rounded-xl"></div>
                    <AlertTriangle className="w-6 h-6 text-white relative z-10 drop-shadow-sm" />
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-1">
                    {alerts?.low}
                  </div>
                  <h3 className="text-xs font-bold text-gray-1000 mb-1">Low Priority</h3>
                  <p className="text-xs text-gray-600">Informational only</p>
                  {/* <div className="text-sm font-medium text-blue-600 bg-white/20 backdrop-blur-sm rounded-xl p-2 border border-white/30">No Impact</div> */}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Glassmorphism Key Performance Indicators Section */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl p-6 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-blue-500/5 rounded-3xl"></div>
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-indigo-600/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden group">
                {/* Glossy overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded-xl"></div>
                {/* Inner shadow for depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent rounded-xl"></div>
                <BarChart3 className="w-5 h-5 text-white relative z-10 drop-shadow-sm" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Key Performance Indicators
                </h2>
                
              </div>
            </div>

                         {/* KPI Cards Grid */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Row 1 */}
              {/* Target PR */}
              <Card className="bg-white/20 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10"></div>
                <CardContent className="p-4 text-center relative z-10">
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-1">
                    {kpis ? `${Math.round(kpis.targetPR)}%` : '--'}
                  </div>
                  <div className="text-xs font-semibold text-gray-900 mb-1">Target PR</div>
                </CardContent>
              </Card>

              {/* Current PR */}
              <Card className="bg-white/20 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10"></div>
                <CardContent className="p-4 text-center relative z-10">
                  <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-1">
                    {kpis ? `${Math.round(kpis.currentPR)}%` : '--'}
                  </div>
                  <div className="text-xs font-semibold text-gray-900 mb-1">Current PR</div>
                </CardContent>
              </Card>

              {/* CUF */}
              <Card className="bg-white/20 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10"></div>
                <CardContent className="p-4 text-center relative z-10">
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-1">
                    {kpis ? `${Math.round(kpis.cuf)}%` : '--'}
                  </div>
                <div className="text-xs font-semibold text-gray-900 mb-1">CUF</div>
                </CardContent>
              </Card>

              {/* Availability */}
              <Card className="bg-white/20 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10"></div>
                <CardContent className="p-4 text-center relative z-10">
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-1">
                    {kpis ? `${Math.round(kpis.availability)}%` : '--'}
                  </div>
                  <div className="text-xs font-semibold text-gray-900 mb-1"> System Availability</div>
                  {/* <div className="text-xs text-gray-600">System Uptime</div> */}
                </CardContent>
              </Card>

              {/* Row 2 */}
              {/* Specific Yield */}
              <Card className="bg-white/20 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10"></div>
                <CardContent className="p-4 text-center relative z-10">
                  <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent mb-1">
                    {kpis ? Math.round(kpis.specificYield) : '--'} kWh/kWp
                  </div>
                  <div className="text-xs font-semibold text-gray-900 mb-1">Specific Yield</div>
                </CardContent>
              </Card>

              {/* PPI */}
              <Card className="bg-white/20 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10"></div>
                <CardContent className="p-4 text-center relative z-10">
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-1">
                    {kpis ? `${Math.round(kpis.ppi)}` : '--'}
                  </div>
                  <div className="text-xs font-semibold text-gray-900 mb-1">PPI</div>
                </CardContent>
              </Card>

              {/* EPI */}
              <Card className="bg-white/20 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10"></div>
                <CardContent className="p-4 text-center relative z-10">
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-1">
                    {kpis ? `${Math.round(kpis.epi)}` : '--'}
                  </div>
                  <div className="text-xs font-semibold text-gray-900 mb-1">EPI</div>
                </CardContent>
              </Card>

              {/* PR Ratio */}
              <Card className="bg-white/20 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-red-600/10"></div>
                <CardContent className="p-4 text-center relative z-10">
                  <div className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent mb-1">
                    {kpis ? Math.round(kpis.prRatio) : '--'}
                  </div>
                  <div className="text-xs font-semibold text-gray-900 mb-1">PR Ratio</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Glassmorphism Weather Conditions Section */}
        {weather && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl p-6 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-orange-500/5 to-amber-500/5 rounded-3xl"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/10 to-orange-600/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden group">
                  {/* Glossy overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded-xl"></div>
                  {/* Inner shadow for depth */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent rounded-xl"></div>
                  <Sun className="w-5 h-5 text-white relative z-10 drop-shadow-sm" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Weather Conditions
                  </h2>
                </div>
              </div>

                             {/* Weather Cards Grid */}
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
               <Card className="bg-white/20 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10"></div>
                  <CardContent className="p-4 text-center relative z-10">
                    <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent mb-1">
                      {weather ? weather.dni.toFixed(0) + ' W/m²' : '--'}
                    </div>
                    <div className="text-xs font-semibold text-gray-900 mb-1">DNI</div>
                    
                  </CardContent>
                </Card>
                <Card className="bg-white/20 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-amber-600/10"></div>
                  <CardContent className="p-4 text-center relative z-10">
                    <div className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent mb-1">
                      {weather ? `${weather.ghi.toFixed(0)} W/m²` : '--'}
                    </div>
                    <div className="text-xs font-semibold text-gray-900 mb-1">GHI</div>
                    
                  </CardContent>
                </Card>
                <Card className="bg-white/20 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-cyan-600/10"></div>
                  <CardContent className="p-4 text-center relative z-10">
                    <div className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-800 bg-clip-text text-transparent mb-1">
                      {weather ? `${weather.humidity.toFixed(1)}%` : '--'}
                    </div>
                    <div className="text-xs font-semibold text-gray-900 mb-1">Relative Humidity</div>
                    
                  </CardContent>
                </Card>

                <Card className="bg-white/20 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10"></div>
                  <CardContent className="p-4 text-center relative z-10">
                    <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-1">
                      {weather ? `${weather.windSpeed.toFixed(1)} m/s` : '--'}
                    </div>
                    <div className="text-xs font-semibold text-gray-900 mb-1">Wind Speed</div>
                    {/* <div className="text-xs text-gray-600">m/s</div> */}
                  </CardContent>
                </Card>

                
                <Card className="bg-white/20 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10"></div>
                  <CardContent className="p-4 text-center relative z-10">
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-1">
                      {weather ? `${weather.temperature.toFixed(1)}°C` : '--'}
                    </div>
                    <div className="text-xs font-semibold text-gray-900 mb-1">Ambient Temperature</div>
                    
                  </CardContent>
                </Card>


                <Card className="bg-white/20 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10"></div>
                  <CardContent className="p-4 text-center relative z-10">
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-1">
                      {weather ? `${weather.cellTemperature.toFixed(1)}°C` : '--'}
                    </div>
                    <div className="text-xs font-semibold text-gray-900 mb-1">Module Temperature</div>
                    {/* <div className="text-xs text-gray-600">hPa</div> */}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Glassmorphism POC Data and Power Factor Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
                     {/* POC Data */}
           <div className="bg-white/10 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl p-4 lg:p-6 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 rounded-3xl"></div>
              <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 rounded-full blur-xl"></div>
              
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden group">
                    {/* Glossy overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded-xl"></div>
                    {/* Inner shadow for depth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent rounded-xl"></div>
                    <Zap className="w-5 h-5 text-white relative z-10 drop-shadow-sm" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      POC Data
                    </h2>
                   
                  </div>
                </div>

                                 {/* POC Cards Grid */}
                 <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-white/20 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-violet-600/10"></div>
                    <CardContent className="p-4 text-center relative z-10">
                      <div className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-violet-800 bg-clip-text text-transparent mb-1">
                        {pocData ? formatNumericValue(pocData.voltage.value, 0) : '--'} {pocData ? pocData.voltage.unit : '--'}
                      </div>
                      <div className="text-xs font-semibold text-gray-900 mb-1">Voltage</div>
                     
                    </CardContent>
                  </Card>

                  <Card className="bg-white/20 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-sky-600/10"></div>
                    <CardContent className="p-4 text-center relative z-10">
                      <div className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent mb-1">
                        {pocData ? formatNumericValue(pocData.current.value, 0) : '--'} {pocData ? pocData.current.unit : '--'}
                      </div>
                      <div className="text-xs font-semibold text-gray-900 mb-1">Current</div>
                    
                    </CardContent>
                  </Card>

                  <Card className="bg-white/20 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-lime-500/10 to-lime-600/10"></div>
                    <CardContent className="p-4 text-center relative z-10">
                      <div className="text-2xl font-bold bg-gradient-to-r from-lime-600 to-lime-800 bg-clip-text text-transparent mb-1">
                        {pocData ? formatNumericValue(pocData.frequency.value, 0) : '--'} {pocData ? pocData.frequency.unit : '--'}
                      </div>
                      <div className="text-xs font-semibold text-gray-900 mb-1">Frequency</div>
                     
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

                     {/* Power Factor Gauge */}
           <div className="bg-white/10 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl p-4 lg:p-6 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-400/10 to-purple-600/10 rounded-full blur-xl"></div>
            
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden group">
                  {/* Glossy overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded-xl"></div>
                  {/* Inner shadow for depth */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent rounded-xl"></div>
                  <Power className="w-5 h-5 text-white relative z-10 drop-shadow-sm" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Power Factor
                  </h2>
                  
                </div>
              </div>

              {/* Gauge Display */}
              <div className="flex justify-center">
                <div className="relative w-56 h-40 flex items-center justify-center">
                  {loading.powerFactorData ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-pulse bg-gray-200 h-24 w-24 rounded-full"></div>
                    </div>
                  ) : (
                    <PowerFactorGauge value={powerFactorData?.powerFactor || 0.98} />
                  )}
                </div>
              </div>
              
              {/* Power Factor Details */}
              {/* {powerFactorData && (
                <div className="mt-3 text-center">
                  <div className="text-xs text-gray-600 mb-1">
                    Current Power Factor: <span className="font-semibold text-gray-900">{powerFactorData.powerFactor}</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    Average: {powerFactorData.avgPowerFactor} | Target: {powerFactorData.targetPowerFactor}
                  </div>
                  <div className="text-xs text-gray-500">
                    Status: 
                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${
                      powerFactorData.powerFactor >= 0.95 ? 'bg-green-100 text-green-800' :
                      powerFactorData.powerFactor >= 0.90 ? 'bg-blue-100 text-blue-800' :
                      powerFactorData.powerFactor >= 0.85 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {powerFactorData.powerFactor >= 0.95 ? 'excellent' :
                       powerFactorData.powerFactor >= 0.90 ? 'good' :
                       powerFactorData.powerFactor >= 0.85 ? 'fair' : 'poor'}
                    </span>
                  </div>
                </div>
              )} */}
            </div>
          </div>
        </div>

        {/* Glassmorphism Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
                     {/* Power Chart */}
           <div className="bg-white/10 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl p-4 lg:p-6 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 rounded-3xl"></div>
            <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 rounded-full blur-xl"></div>
            
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden group">
                  {/* Glossy overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded-xl"></div>
                  {/* Inner shadow for depth */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent rounded-xl"></div>
                  <Power className="w-5 h-5 text-white relative z-10 drop-shadow-sm" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Power Generation
                  </h2>
                 
                </div>
              </div>

              {/* Chart */}
              <div className="h-96 lg:h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={forecastData.filter(item => {
              const [hour, minute] = item.hour.split(':').map(Number);
              return hour >= 5 && hour < 19;
            }).map(d => ({ ...d, power: d.forecast, actual: d.realTime }))}
                    margin={{ top: 20, right: 20, left: 50, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="hour"
                      stroke="#374151"
                      fontSize={8}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#374151' }}
                      interval="preserveStartEnd"
                      label={{
                        value: 'Time',
                        position: 'bottom',
                        offset: 0,
                        style: { 
                          fontSize: '14px', 
                          fill: '#374151',
                          textAnchor: 'middle'
                        }
                      }}
                    />
                    <YAxis
                      stroke="#374151"
                      fontSize={8}
                      tickLine={false}
                      axisLine={false}
                      //domain={[0, 'dataMax + 50']}
                      tick={{ fill: '#374151' }}
                      width={40}
                      label={{
                        value: 'Power (kW)',
                        position: 'insideLeft',
                        angle: -90,
                        offset: -10,
                        style: { 
                          fontSize: '14px', 
                          fill: '#374151',
                          textAnchor: 'middle'
                        }
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '10px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="power"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      strokeDasharray="5 2"
                      dot={false}
                      name="Actual"
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      strokeDasharray="6 4" 
                      dot={false}
                      name="Expected"
                    />
                    {/* <Legend 
                      wrapperStyle={{ 
                        fontSize: '12px', 
                        paddingTop: '15px',
                        textAlign: 'center'
                      }}
                      iconType="line"
                      height={35}
                      verticalAlign="bottom"
                      align="center"
                    /> */}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

                     {/* Energy Chart */}
           <div className="bg-white/10 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl p-4 lg:p-6 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-teal-500/5 rounded-3xl"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-400/10 to-emerald-600/10 rounded-full blur-xl"></div>
            
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden group">
                  {/* Glossy overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded-xl"></div>
                  {/* Inner shadow for depth */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent rounded-xl"></div>
                  <Zap className="w-5 h-5 text-white relative z-10 drop-shadow-sm" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Energy Generation
                  </h2>
                  
                </div>
              </div>

              {/* Chart */}
              <div className="h-96 lg:h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={energyChartData.filter(item => {
              const [hour, minute] = item.hour.split(':').map(Number);
              return hour >= 5 && hour < 19;
            })} margin={{ top: 20, right: 20, left: 50, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="hour"
                      stroke="#374151"
                      fontSize={8}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#374151' }}
                      interval="preserveStartEnd"
                      label={{
                        value: 'Time',
                        position: 'bottom',
                        offset: 0,
                        style: { 
                          fontSize: '14px', 
                          fill: '#374151',
                          textAnchor: 'middle'
                        }
                      }}
                    />
                    <YAxis
                      stroke="#374151"
                      fontSize={8}
                      tickLine={false}
                      axisLine={false}
                      //unit="kWh"
                      //domain={[0, 'dataMax + 50']}
                      tick={{ fill: '#374151' }}
                      width={40}
                      label={{
                        value: 'Energy (kWh)',
                        position: 'insideLeft',
                        angle: -90,
                        offset: -10,
                        style: { 
                          fontSize: '14px', 
                          fill: '#374151',
                          textAnchor: 'middle'
                        }
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '10px'
                      }}
                    />
                    
                    <Line
                      type="monotone"
                      dataKey="energy"
                      stroke="#3B82F6" // Deep blue for actual
                      strokeWidth={2.5}
                      dot={false}
                      name="Actual"
                      strokeDasharray="5 2 1 2" 
                      activeDot={{ r: 5, fill: '#2563EB' }} // Slightly brighter blue
                    />
                    {/* 'basis' | 'basisClosed' | 'basisOpen' | 
                    'bumpX' | 'bumpY' | 'bump' | 'linear' | 
                    'linearClosed' | 'natural' | 'monotoneX' | 
                    'monotoneY' | 'monotone' | 'step' | 
                    'stepBefore' | 'stepAfter'  */}
                    <Line
                      type="monotone"
                      dataKey="actualEnergy"
                      stroke="#F59E0B" // Emerald green for expected
                      strokeWidth={2}
                      strokeDasharray="6 4 1 2" 
                     // Dashed line for clarity
                      dot={false}
                      name="Expected"
                      activeDot={{ r: 5, fill: '#34D399' }} // Lighter green for hover
                    />
                    {/* <Legend 
                      wrapperStyle={{ 
                        fontSize: '12px', 
                        paddingTop: '15px',
                        textAlign: 'center'
                      }}
                      iconType="line"
                      height={35}
                      verticalAlign="bottom"
                      align="center"
                    /> */}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

             
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Inverter Time-Power Heat Map */}
          <HeatMapGrid
            data={inverterHeatMapData.filter(item => {
              const [hour, minute] = item.hour.split(':').map(Number);
              return hour >= 5 && hour < 19;
            })}
            rowIdField="inverterId"
            rowLabelField="inverterName"
            timeField="hour"
            valueField="power"
            title="Inverter Mapping"
            subtitle="Power output distribution across inverters (5AM-7PM)"
            unit="kW"
            colorScheme="temperature"
            showLegend={true}
            showValuesOnHover={true}
          />
        </div>

        {/* Digital Twin Operations Center */}
        {showDigitalTwin && (
          <DigitalTwinOperationsCenter
            plantId={plantId!}
            onClose={() => setShowDigitalTwin(false)}
          />
        )}
      </div>
    </div>
  );
}
