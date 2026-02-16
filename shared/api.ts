// Legacy API Orchestrator - DEPRECATED
// This file is kept for backward compatibility
// Use the new service layer instead: client/lib/services/

import { Plant, PlantMonitoringRequest, PlantMonitoringResponse, WeatherData, KPIs, Alert, POCData, EnergyData, PowerData, InverterHeatmapData, RevenueData, PowerFactorData, AnalysisRequest, AnalysisResponse, AlertCount } from "./interface";
import { plantService } from "@/lib/services";
import { config } from "@/lib/config";

// Real-time data refresh function
export const refreshPlantData = async (plantId: string): Promise<void> => {
  return plantService.refreshPlantData(plantId);
};

// Plant data functions
export const getPlants = async (): Promise<Plant[]> => {
  return plantService.getPlants();
};

export const getPlant = async (id: string): Promise<Plant> => {
  return plantService.getPlant(id);
};

// Development API endpoint (uses config base URL) - DEPRECATED
export const getDevelopmentPlants = async (): Promise<Plant[]> => {
  return plantService.getPlants(); // Use service layer
};

// Legacy Plants Service - DEPRECATED
export class PlantsService {
  private static instance: PlantsService;

  private constructor() {}
  
  public static getInstance(): PlantsService {
    if (!PlantsService.instance) {
      PlantsService.instance = new PlantsService();
    }
    return PlantsService.instance;
  }

  // Redirect to new service layer
  public async fetchPlants(): Promise<Plant[]> {
    return plantService.getPlants();
  }

  public async refreshPlants(): Promise<Plant[]> {
    return plantService.getPlants(); // Service layer handles caching
  }

  public clearCache(): void {
    // Service layer handles caching
  }
}

// Weather data API
export const getPlantWeatherData = async (plantId: string, time?: string, date?: string): Promise<WeatherData> => {
  return plantService.getPlantWeatherData(plantId, time, date);
};

// KPI data API
export const getPlantKPIData = async (plantId: string, time?: string, date?: string): Promise<KPIs> => {
  return plantService.getPlantKPIData(plantId, time, date);
};

// Alerts data API
export const getPlantAlertsData = async (plantId: string, time?: string, date?: string): Promise<AlertCount> => {
  return plantService.getPlantAlertsData(plantId, time, date);
};

// All remaining API functions redirect to service layer
export const getPlantPOCData = async (plantId: string,time: string = "00:00",date: string = "01-06-2020"): Promise<POCData> => {
  return plantService.getPlantPOCData(plantId, time, date);
};

export const getPlantEnergyData = async (plantId: string, time: string = "00:00", date: string = "01-06-2020"): Promise<EnergyData[]> => {
  return plantService.getPlantEnergyData(plantId, time, date);
};

export const getPlantPowerData = async (plantId: string,time: string = "00:00",date: string = "01-06-2020"): Promise<PowerData[]> => {
  return plantService.getPlantPowerData(plantId, time, date);
};

export const getPlantInverterHeatmapData = async (plantId: string, time: string = "11:00",date: string = "01-06-2020"): Promise<InverterHeatmapData[]> => {
  return plantService.getPlantInverterHeatmapData(plantId, time, date);
};

export const getPlantRevenueData = async (plantId: string,time: string = "00:00",date: string = "01-06-2020"): Promise<RevenueData> => {
  return plantService.getPlantRevenueData(plantId, time, date);
};

export const getPlantPowerFactorData = async (plantId: string,time: string = "00:00",date: string = "01-06-2020"): Promise<PowerFactorData> => {
  return plantService.getPlantPowerFactorData(plantId, time, date);
};

// Analysis API function
export const getAnalysisData = async (request: AnalysisRequest): Promise<AnalysisResponse> => {
  return plantService.getAnalysisData(request);
};

// Export singleton instance
export const plantsService = PlantsService.getInstance();