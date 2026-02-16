import ApiService from './api';
import { getKPIEndpoint } from './config';

// KPI Data Types
export interface TechnicalKPI {
  id: string;
  name: string;
  value: number;
  unit: string;
  target?: number;
  trend: "up" | "down" | "stable";
  change: number;
  chartType: "line" | "area" | "bar";
  chartData: ChartDataPoint[];
}

export interface FinancialKPI {
  id: string;
  name: string;
  value: number;
  unit: string;
  target?: number;
  trend: "up" | "down" | "stable";
  change: number;
  chartType: "line" | "area" | "bar" | "pie";
  chartData: ChartDataPoint[];
}

export interface CommercialKPI {
  name: string;
  value: string; // Formatted string like "AED 47.2M"
}

export interface ChartDataPoint {
  name: string;
  value: number;
  target?: number;
}

export interface PlantKPIResponse {
  plantId: string;
  plantName: string;
  timestamp: string;
  technicalKPIs: TechnicalKPI[];
  financialKPIs: FinancialKPI[];
  commercialKPIs: CommercialKPI[];
  summary: {
    totalKPIs: number;
    onTarget: number;
    improving: number;
    declining: number;
    overallHealth: "excellent" | "good" | "fair" | "poor";
  };
}

export interface HistoricalKPIResponse {
  plantId: string;
  kpiId: string;
  timeRange: string;
  data: HistoricalDataPoint[];
}

export interface HistoricalDataPoint {
  timestamp: string;
  value: number;
  target?: number;
  unit: string;
}

// KPI Service Class
export class KPIService {
  /**
   * Get detailed KPI data for a plant (all KPIs)
   */
  static async getPlantKPIs(plantId: string): Promise<PlantKPIResponse> {
    try {
      const endpoint = getKPIEndpoint('plantKPIs', plantId);
      return await ApiService.get<PlantKPIResponse>(endpoint);
    } catch (error) {
      console.error('Error fetching plant KPIs:', error);
      throw error;
    }
  }

  /**
   * Get technical KPIs for a plant
   */
  static async getTechnicalKPIs(plantId: string, timeRange?: string): Promise<TechnicalKPI[]> {
    try {
      const endpoint = getKPIEndpoint('technicalKPIs', plantId);
      const queryParams = timeRange ? `?timeRange=${timeRange}` : '';
      return await ApiService.get<TechnicalKPI[]>(`${endpoint}${queryParams}`);
    } catch (error) {
      console.error('Error fetching technical KPIs:', error);
      throw error;
    }
  }

  /**
   * Get financial KPIs for a plant
   */
  static async getFinancialKPIs(plantId: string, timeRange?: string): Promise<FinancialKPI[]> {
    try {
      const endpoint = getKPIEndpoint('financialKPIs', plantId);
      const queryParams = timeRange ? `?timeRange=${timeRange}` : '';
      return await ApiService.get<FinancialKPI[]>(`${endpoint}${queryParams}`);
    } catch (error) {
      console.error('Error fetching financial KPIs:', error);
      throw error;
    }
  }

  /**
   * Get commercial KPIs for a plant
   */
  static async getCommercialKPIs(plantId: string): Promise<CommercialKPI[]> {
    try {
      const endpoint = getKPIEndpoint('commercialKPIs', plantId);
      return await ApiService.get<CommercialKPI[]>(endpoint);
    } catch (error) {
      console.error('Error fetching commercial KPIs:', error);
      throw error;
    }
  }

  /**
   * Get historical KPI data for charts
   */
  static async getHistoricalKPIs(
    plantId: string,
    kpiId: string,
    timeRange: string = '6m'
  ): Promise<HistoricalKPIResponse> {
    try {
      const endpoint = getKPIEndpoint('historicalKPIs', plantId);
      const queryParams = ApiService.createQueryParams({ kpiId, timeRange });
      return await ApiService.get<HistoricalKPIResponse>(`${endpoint}?${queryParams}`);
    } catch (error) {
      console.error('Error fetching historical KPIs:', error);
      throw error;
    }
  }

  /**
   * Get multiple historical KPIs for comparison
   */
  static async getMultipleHistoricalKPIs(
    plantId: string,
    kpiIds: string[],
    timeRange: string = '6m'
  ): Promise<HistoricalKPIResponse[]> {
    try {
      const promises = kpiIds.map(kpiId => 
        this.getHistoricalKPIs(plantId, kpiId, timeRange)
      );
      return await Promise.all(promises);
    } catch (error) {
      console.error('Error fetching multiple historical KPIs:', error);
      throw error;
    }
  }
}

// Export default instance
export default KPIService;
