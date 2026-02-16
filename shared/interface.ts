export interface Plant {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  location: {
    id: number | null;
    name: string;
    latitude: string;
    longitude: string;
  };
  capacity: number;
  status: string;
  pr: number;
  cuf: number;
  availability: number;
  alertCount: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  lastUpdated: string | null;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  ghi: number;
  dni: number;
  cellTemperature: number;
}

export interface KPI {
  targetPR: number;
  currentPR: number;
  cuf: number;
  availability: number;
  specificYield: number;
  ppi: number;
  epi: number;
  prRatio: number;
}

export interface KPIs extends KPI {}

export interface POCData {
  voltage: {
    value: number;
    unit: string;
  };
  current: {
    value: number;
    unit: string;
  };
  frequency: {
    value: number;
    unit: string;
  };
}

export interface Alert {
  id: string;
  type: string;
  severity: string;
  message: string;
  timestamp: string;
  status: string;
}

export interface AlertCount {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface EnergyData {
  hour: string;
  value: number;
  actualValue: number;
}

export interface PowerData {
  hour: string;
  value: number;
  actualValue: number;
}

export interface InverterHeatmapData {
  inverterId: string;
  inverterName: string | null;
  value: number;
  hour: string;
}

export interface RevenueData {
  energyToday: number;
  revenueToday: number;
  energyThisMonth: number;
  revenueThisMonth: number;
  specificYield: number;
  co2Saved: number;
  co2SavedThisMonth: number;
  traiffRate: number;
}

export interface PowerFactorData {
  powerFactor: number;
  avgPowerFactor: number;
  targetPowerFactor: number;
}

// Additional interfaces for API compatibility
export interface PlantMonitoringRequest {
  plantId: string;
  date: string;
  time: string;
}

export interface PlantMonitoringResponse {
  success: boolean;
  data: any;
}

export interface AnalysisRequest {
  plantId: string;
  domain: string;
  param: string;
  startDate: string;
  isSingleDate: boolean;
  stringParam?: string;
  endDate?: string;
}

export interface AnalysisDataPoint {
  inverterId: string;
  inverterName: string | null;
  value: number;
  hour: string;
}

export interface AnalysisResponse {
  reportType: string;
  metric: string;
  layers: number;
  data: AnalysisDataPoint[];
}

export interface PlantMonitoringData {
  plantId: string;
  timestamp: string;
  data: any;
}

export interface InverterData {
  id: string;
  status: string;
  hourlyData: InverterHourlyData[];
}

export interface InverterHourlyData {
  hour: number;
  power: number;
  efficiency: number;
  status: string;
}

export interface InverterTempData {
  inverterId: string;
  temperature: number;
  timestamp: string;
}