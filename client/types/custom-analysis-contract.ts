// Data Contract for Custom Analysis API Response
export interface CustomAnalysisDataContract {
  // Metadata
  reportType: string;
  metric: string;
  layers: number;
  timestamp: string;
  plantId: string;
  
  // Analysis Configuration
  analysisConfig: {
    xParameter: string;
    yParameter: string;
    chartType: string;
    timeRange: string;
    aggregationLevel: 'hourly' | 'daily' | 'monthly';
  };
  
  // Data Points Array
  dataPoints: CustomAnalysisDataPoint[];
  
  // Statistical Summary
  statistics: {
    totalRecords: number;
    minValue: number;
    maxValue: number;
    averageValue: number;
    medianValue: number;
    standardDeviation: number;
    correlation?: number; // For scatter plots
  };
  
  // Data Quality Metrics
  dataQuality: {
    completeness: number; // Percentage of complete records
    accuracy: number; // Data accuracy score
    lastUpdated: string;
    dataSource: string;
  };
  
  // Chart Configuration
  chartConfig: {
    xAxisLabel: string;
    yAxisLabel: string;
    xAxisUnit: string;
    yAxisUnit: string;
    colorScheme: string;
    showTrendLine: boolean;
    showDataLabels: boolean;
  };
}

export interface CustomAnalysisDataPoint {
  // Primary identifiers
  id: string;
  timestamp: string;
  
  // Time-based fields
  date: string;
  hour: string;
  dayOfWeek: string;
  month: string;
  year: string;
  
  // Solar plant metrics
  powerOutput: number; // kW
  energyGenerated: number; // kWh
  performanceRatio: number; // %
  inverterTemp: number; // °C
  stringVoltage: number; // V
  irradiance: number; // W/m²
  soilingIndex: number; // %
  
  // Financial metrics
  energyRevenue: number; // USD
  omCost: number; // USD
  
  // Operational metrics
  downtime: number; // Hours
  faultCount: number; // Count
  
  // Environmental conditions
  ambientTemperature: number; // °C
  humidity: number; // %
  windSpeed: number; // m/s
  windDirection: string;
  
  // Equipment status
  inverterStatus: 'online' | 'offline' | 'fault' | 'maintenance';
  stringStatus: 'active' | 'inactive' | 'fault';
  
  // Calculated fields
  efficiency: number; // %
  availability: number; // %
  capacityFactor: number; // %
  
  // Metadata
  dataQuality: 'high' | 'medium' | 'low';
  isEstimated: boolean;
  notes?: string;
}

// Example data contract instance
export const exampleCustomAnalysisContract: CustomAnalysisDataContract = {
  reportType: "Custom Comparative Analysis",
  metric: "powerOutput-irradiance",
  layers: 1,
  timestamp: "2024-01-15T10:30:00Z",
  plantId: "PLANT-001",
  
  analysisConfig: {
    xParameter: "irradiance",
    yParameter: "powerOutput",
    chartType: "scatter",
    timeRange: "7d",
    aggregationLevel: "hourly"
  },
  
  dataPoints: [
    {
      id: "DP-001",
      timestamp: "2024-01-15T08:00:00Z",
      date: "2024-01-15",
      hour: "08:00",
      dayOfWeek: "Monday",
      month: "January",
      year: "2024",
      powerOutput: 1250.5,
      energyGenerated: 125.05,
      performanceRatio: 0.85,
      inverterTemp: 45.2,
      stringVoltage: 380.5,
      irradiance: 650.3,
      soilingIndex: 0.95,
      energyRevenue: 12.50,
      omCost: 25.00,
      downtime: 0,
      faultCount: 0,
      ambientTemperature: 28.5,
      humidity: 65.2,
      windSpeed: 3.2,
      windDirection: "NE",
      inverterStatus: "online",
      stringStatus: "active",
      efficiency: 0.92,
      availability: 1.0,
      capacityFactor: 0.75,
      dataQuality: "high",
      isEstimated: false,
      notes: "Normal operation"
    },
    {
      id: "DP-002",
      timestamp: "2024-01-15T09:00:00Z",
      date: "2024-01-15",
      hour: "09:00",
      dayOfWeek: "Monday",
      month: "January",
      year: "2024",
      powerOutput: 1850.8,
      energyGenerated: 185.08,
      performanceRatio: 0.88,
      inverterTemp: 48.7,
      stringVoltage: 382.1,
      irradiance: 850.7,
      soilingIndex: 0.94,
      energyRevenue: 18.51,
      omCost: 25.00,
      downtime: 0,
      faultCount: 0,
      ambientTemperature: 31.2,
      humidity: 62.8,
      windSpeed: 4.1,
      windDirection: "E",
      inverterStatus: "online",
      stringStatus: "active",
      efficiency: 0.94,
      availability: 1.0,
      capacityFactor: 0.82,
      dataQuality: "high",
      isEstimated: false,
      notes: "Peak performance"
    },
    {
      id: "DP-003",
      timestamp: "2024-01-15T10:00:00Z",
      date: "2024-01-15",
      hour: "10:00",
      dayOfWeek: "Monday",
      month: "January",
      year: "2024",
      powerOutput: 2100.3,
      energyGenerated: 210.03,
      performanceRatio: 0.91,
      inverterTemp: 52.1,
      stringVoltage: 384.2,
      irradiance: 950.5,
      soilingIndex: 0.93,
      energyRevenue: 21.00,
      omCost: 25.00,
      downtime: 0,
      faultCount: 0,
      ambientTemperature: 33.8,
      humidity: 58.5,
      windSpeed: 5.2,
      windDirection: "SE",
      inverterStatus: "online",
      stringStatus: "active",
      efficiency: 0.96,
      availability: 1.0,
      capacityFactor: 0.89,
      dataQuality: "high",
      isEstimated: false,
      notes: "Optimal conditions"
    }
  ],
  
  statistics: {
    totalRecords: 168, // 7 days * 24 hours
    minValue: 0,
    maxValue: 2100.3,
    averageValue: 1456.7,
    medianValue: 1420.5,
    standardDeviation: 245.8,
    correlation: 0.89
  },
  
  dataQuality: {
    completeness: 98.5,
    accuracy: 97.2,
    lastUpdated: "2024-01-15T10:30:00Z",
    dataSource: "SCADA System v2.1"
  },
  
  chartConfig: {
    xAxisLabel: "Irradiance",
    yAxisLabel: "Power Output",
    xAxisUnit: "W/m²",
    yAxisUnit: "kW",
    colorScheme: "blue",
    showTrendLine: true,
    showDataLabels: false
  }
};

