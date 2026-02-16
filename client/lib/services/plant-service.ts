import { BaseService } from './base-service';
import { Plant, WeatherData, KPIs, Alert, POCData, EnergyData, PowerData, InverterHeatmapData, RevenueData, PowerFactorData, AnalysisRequest, AnalysisResponse, AlertCount } from '@shared/interface';
import { config, getEnvironment, getCurrentBaseUrl, shouldUseAzureFunctions, getAnalysisEndpoint } from '../config';

// Plant Service - SaaS-focused plant data management
export class PlantService extends BaseService {
  private static instance: PlantService;

  constructor() {
    super('PlantService');
  }

  public static getInstance(): PlantService {
    if (!PlantService.instance) {
      PlantService.instance = new PlantService();
    }
    return PlantService.instance;
  }

  // Plant management
  public async getPlants(): Promise<Plant[]> {
    const cacheKey = 'plants_list';
    const cached = this.getCache<Plant[]>(cacheKey);
    if (cached) return cached;

    try {
      // Try development API first
      if (config.isDevelopment) {
        const plants = await this.getDevelopmentPlants();
        if (plants.length > 0) {
          this.setCache(cacheKey, plants);
          return plants;
        }
      }

      // Fallback to Azure Functions
      const plants = await this.get<Plant[]>(config.endpoints.plants);
      this.setCache(cacheKey, plants);
      return plants;
    } catch (error) {
      console.warn('All APIs failed, using mock data');
      const mockPlants = await this.getMockPlants();
      this.setCache(cacheKey, mockPlants, 60000); // Cache mock data for 1 minute
      return mockPlants;
    }
  }

  public async getPlant(id: string): Promise<Plant> {
    const cacheKey = `plant_${id}`;
    const cached = this.getCache<Plant>(cacheKey);
    if (cached) return cached;

    try {
      const plant = await this.get<Plant>(`${config.endpoints.plants}/${id}`);
      this.setCache(cacheKey, plant);
      return plant;
    } catch (error) {
      // Fallback to mock data
      const mockPlants = await this.getMockPlants();
      const plant = mockPlants.find(p => p.id === id);
      if (plant) {
        this.setCache(cacheKey, plant, 60000);
        return plant;
      }
      throw new Error(`Plant with ID ${id} not found`);
    }
  }



  // Weather data
  public async getPlantWeatherData(
    plantId: string, 
    time?: string, 
    date?: string
  ): Promise<WeatherData> {
    const now = new Date();
    const currentTime = time || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const currentDate = date || `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
    
    const cacheKey = `weather_${plantId}_${currentDate}_${currentTime}`;
    const cached = this.getCache<WeatherData>(cacheKey);
    if (cached) return cached;

    try {
      if (config.isDevelopment) {
        const data = await this.getDevelopmentWeatherData(plantId, currentTime, currentDate);
        if (data) {
          this.setCache(cacheKey, data);
          return data;
        }
      }

      // Use the correct API endpoint from Swagger spec
      const endpoint = config.endpoints.weather.replace('{pid}', plantId);
      const data = await this.get<WeatherData>(endpoint);
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn('Weather API failed, using mock data');
      const mockData = await this.getMockWeatherData(plantId);
      this.setCache(cacheKey, mockData, 300000); // 5 minutes
      return mockData;
    }
  }

  // KPI data
  public async getPlantKPIData(
    plantId: string,
    time?: string,
    date?: string
  ): Promise<KPIs> {
    const now = new Date();
    const currentTime = time || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const currentDate = date || `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
    
    const cacheKey = `kpi_${plantId}_${currentDate}_${currentTime}`;
    const cached = this.getCache<KPIs>(cacheKey);
    if (cached) return cached;

    try {
      if (config.isDevelopment) {
        const data = await this.getDevelopmentKPIData(plantId, currentTime, currentDate);
        if (data) {
          this.setCache(cacheKey, data);
          return data;
        }
      }

      // Use the correct API endpoint from Swagger spec
      const endpoint = config.endpoints.kpis.replace('{pid}', plantId);
      const data = await this.get<KPIs>(endpoint);
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn('KPI API failed, using mock data');
      const mockData = await this.getMockKPIData(plantId);
      this.setCache(cacheKey, mockData, 300000); // 5 minutes
      return mockData;
    }
  }

  // Alerts data
  public async getPlantAlertsData(
    plantId: string,
    time?: string,
    date?: string
  ): Promise<AlertCount> {
    const now = new Date();
    const currentTime = time || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const currentDate = date || `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
    
    const cacheKey = `alerts_${plantId}_${currentDate}_${currentTime}`;
    const cached = this.getCache<AlertCount>(cacheKey);
    if (cached) return cached;

    try {
      if (config.isDevelopment) {
        const data = await this.getDevelopmentAlertsData(plantId, currentTime, currentDate);
        if (data) {
          this.setCache(cacheKey, data);
          return data;
        }
      }

      // Use the correct API endpoint from Swagger spec
      const endpoint = config.endpoints.plantAlerts.replace('{pid}', plantId);
      const data = await this.get<AlertCount>(endpoint);
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn('Alerts API failed, using mock data');
      const mockData = await this.getMockAlertsData(plantId);
      this.setCache(cacheKey, mockData, 60000); // 1 minute
      return mockData;
    }
  }

  // POC data
  public async getPlantPOCData(plantId: string, time: string = "00:00", date: string = "01-06-2020"): Promise<POCData> {
    const cacheKey = `poc_${plantId}_${time}_${date}`;
    const cached = this.getCache<POCData>(cacheKey);
    if (cached) return cached;

    try {
      if (config.isDevelopment) {
        const data = await this.getDevelopmentPOCData(plantId, time, date);
        if (data) {
          this.setCache(cacheKey, data);
          return data;
        }
      }

      // Use the correct API endpoint from Swagger spec
      const endpoint = config.endpoints.poc.replace('{pid}', plantId);
      const data = await this.get<POCData>(endpoint);
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn('POC API failed, using mock data');
      const mockData = await this.getMockPOCData(plantId);
      this.setCache(cacheKey, mockData, 300000); // 5 minutes
      return mockData;
    }
  }

  // Energy data
  public async getPlantEnergyData(plantId: string, time: string = "00:00", date: string = "01-06-2020"): Promise<EnergyData[]> {
    const cacheKey = `energy_${plantId}_${time}_${date}`;
    const cached = this.getCache<EnergyData[]>(cacheKey);
    if (cached) return cached;

    try {
      if (config.isDevelopment) {
        const data = await this.getDevelopmentEnergyData(plantId, time, date);
        if (data) {
          this.setCache(cacheKey, data);
          return data;
        }
      }

      // Use the correct API endpoint from Swagger spec
      const endpoint = config.endpoints.energy.replace('{pid}', plantId);
      const data = await this.get<EnergyData[]>(endpoint);
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn('Energy API failed, using mock data');
      const mockData = await this.getMockEnergyData(plantId);
      this.setCache(cacheKey, mockData, 300000); // 5 minutes
      return mockData;
    }
  }

  // Power data
  public async getPlantPowerData(plantId: string, time: string = "00:00", date: string = "01-06-2020"): Promise<PowerData[]> {
    const cacheKey = `power_${plantId}_${time}_${date}`;
    const cached = this.getCache<PowerData[]>(cacheKey);
    if (cached) return cached;

    try {
      if (config.isDevelopment) {
        const data = await this.getDevelopmentPowerData(plantId, time, date);
        if (data) {
          this.setCache(cacheKey, data);
          return data;
        }
      }

      // Use the correct API endpoint from Swagger spec
      const endpoint = config.endpoints.power.replace('{pid}', plantId);
      const data = await this.get<PowerData[]>(endpoint);
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn('Power API failed, using mock data');
      const mockData = await this.getMockPowerData(plantId);
      this.setCache(cacheKey, mockData, 300000); // 5 minutes
      return mockData;
    }
  }

  // Inverter heatmap data
  public async getPlantInverterHeatmapData(plantId: string, time: string = "11:00", date: string = "01-06-2020"): Promise<InverterHeatmapData[]> {
    const cacheKey = `heatmap_${plantId}_${time}_${date}`;
    const cached = this.getCache<InverterHeatmapData[]>(cacheKey);
    if (cached) return cached;

    try {
      if (config.isDevelopment) {
        const data = await this.getDevelopmentInverterHeatmapData(plantId, time, date);
        if (data) {
          this.setCache(cacheKey, data);
          return data;
        }
      }

      // Use the correct API endpoint from Swagger spec
      const endpoint = config.endpoints.heatmap.replace('{pid}', plantId);
      const data = await this.get<InverterHeatmapData[]>(endpoint);
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn('Inverter Heatmap API failed, using mock data');
      const mockData = await this.getMockInverterHeatmapData(plantId);
      this.setCache(cacheKey, mockData, 300000); // 5 minutes
      return mockData;
    }
  }

  // Revenue data
  public async getPlantRevenueData(plantId: string, time: string = "00:00", date: string = "01-06-2020"): Promise<RevenueData> {
    const cacheKey = `revenue_${plantId}_${time}_${date}`;
    const cached = this.getCache<RevenueData>(cacheKey);
    if (cached) return cached;

    try {
      if (config.isDevelopment) {
        const data = await this.getDevelopmentRevenueData(plantId, time, date);
        if (data) {
          this.setCache(cacheKey, data);
          return data;
        }
      }

      // Use the correct API endpoint from Swagger spec
      const endpoint = config.endpoints.revenue.replace('{pid}', plantId);
      const data = await this.get<RevenueData>(endpoint);
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn('Revenue API failed, using mock data');
      const mockData = await this.getMockRevenueData(plantId);
      this.setCache(cacheKey, mockData, 300000); // 5 minutes
      return mockData;
    }
  }

  // Power factor data
  public async getPlantPowerFactorData(plantId: string, time: string = "00:00", date: string = "01-06-2020"): Promise<PowerFactorData> {
    const cacheKey = `pfactor_${plantId}_${time}_${date}`;
    const cached = this.getCache<PowerFactorData>(cacheKey);
    if (cached) return cached;

    try {
      if (config.isDevelopment) {
        const data = await this.getDevelopmentPowerFactorData(plantId, time, date);
        if (data) {
          this.setCache(cacheKey, data);
          return data;
        }
      }

      // Use the correct API endpoint from Swagger spec
      const endpoint = config.endpoints.pfactor.replace('{pid}', plantId);
      const data = await this.get<PowerFactorData>(endpoint);
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn('Power Factor API failed, using mock data');
      const mockData = await this.getMockPowerFactorData(plantId);
      this.setCache(cacheKey, mockData, 300000); // 5 minutes
      return mockData;
    }
  }

  // Analysis data
  public async getAnalysisData(request: AnalysisRequest): Promise<AnalysisResponse> {
    const cacheKey = `analysis_${JSON.stringify(request)}`;
    const cached = this.getCache<AnalysisResponse>(cacheKey);
    if (cached) return cached;

    try {
      const endpoint = getAnalysisEndpoint();
      const data = await this.post<AnalysisResponse>(endpoint, request);
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn('Analysis API failed, using mock data');
      const mockData = this.generateMockAnalysisData(request);
      this.setCache(cacheKey, mockData, 300000); // 5 minutes
      return mockData;
    }
  }

  // Force refresh all data for a plant
  public async refreshPlantData(plantId: string): Promise<void> {
    this.clearCache(`.*${plantId}.*`);
  }

  // Get failed endpoints status for debugging
  public getFailedEndpointsStatus() {
    return super.getFailedEndpointsStatus();
  }

  // Clear failed endpoints (useful for testing or manual recovery)
  public clearFailedEndpoints() {
    super.clearFailedEndpoints();
  }

  // Private helper methods
  private getDateFromTimeRange(timeRange?: string): string {
    if (!timeRange) return "01-06-2020";
    
    const now = new Date();
    let targetDate: Date;

    switch (timeRange) {
      case "1h":
        targetDate = now;
        break;
      case "24h":
        targetDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        targetDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        targetDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        targetDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        targetDate = new Date("2020-06-01");
    }

    return `${String(targetDate.getDate()).padStart(2, '0')}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${targetDate.getFullYear()}`;
  }

  // Development API methods
  private async getDevelopmentPlants(): Promise<Plant[]> {
    try {
      const environment = getEnvironment();
      const baseUrl = getCurrentBaseUrl();
      const response = await fetch(`${baseUrl}/v1/plants`);
      
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      }
    } catch (error) {
      console.warn(`Plants API failed for ${getEnvironment()}:`, error);
    }
    return [];
  }

  private async getDevelopmentWeatherData(plantId: string, time: string, date: string): Promise<WeatherData | null> {
    try {
      const baseUrl = getCurrentBaseUrl();
      const response = await fetch(`${baseUrl}/v1/plants/${plantId}/weather?time=${time}&date=${date}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn(`Weather API failed for ${getEnvironment()}:`, error);
    }
    return null;
  }

  private async getDevelopmentKPIData(plantId: string, time: string, date: string): Promise<KPIs | null> {
    try {
      const baseUrl = getCurrentBaseUrl();
      const response = await fetch(`${baseUrl}/v1/plants/${plantId}/Kpi?time=${time}&date=${date}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn(`KPI API failed for ${getEnvironment()}:`, error);
    }
    return null;
  }

  private async getDevelopmentAlertsData(plantId: string, time: string, date: string): Promise<AlertCount | null> {
    try {
      const baseUrl = getCurrentBaseUrl();
      const response = await fetch(`${baseUrl}/v1/plants/${plantId}/alerts?time=${time}&date=${date}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn(`Alerts API failed for ${getEnvironment()}:`, error);
    }
    return null;
  }

  private async getDevelopmentPOCData(plantId: string, time: string, date: string): Promise<POCData | null> {
    try {
      const baseUrl = getCurrentBaseUrl();
      const response = await fetch(`${baseUrl}/v1/plants/${plantId}/poc?time=${time}&date=${date}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn(`POC API failed for ${getEnvironment()}:`, error);
    }
    return null;
  }

  private async getDevelopmentEnergyData(plantId: string, time: string, date: string): Promise<EnergyData[] | null> {
    try {
      const baseUrl = getCurrentBaseUrl();
      const response = await fetch(`${baseUrl}/v1/plants/${plantId}/energy?time=${time}&date=${date}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn(`Energy API failed for ${getEnvironment()}:`, error);
    }
    return null;
  }

  private async getDevelopmentPowerData(plantId: string, time: string, date: string): Promise<PowerData[] | null> {
    try {
      const baseUrl = getCurrentBaseUrl();
      const response = await fetch(`${baseUrl}/v1/plants/${plantId}/power?time=${time}&date=${date}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn(`Power API failed for ${getEnvironment()}:`, error);
    }
    return null;
  }

  private async getDevelopmentInverterHeatmapData(plantId: string, time: string, date: string): Promise<InverterHeatmapData[] | null> {
    try {
      const baseUrl = getCurrentBaseUrl();
      const response = await fetch(`${baseUrl}/v1/plants/${plantId}/heatmap?time=${time}&date=${date}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn(`Inverter Heatmap API failed for ${getEnvironment()}:`, error);
    }
    return null;
  }

  private async getDevelopmentRevenueData(plantId: string, time: string, date: string): Promise<RevenueData | null> {
    try {
      const baseUrl = getCurrentBaseUrl();
      const response = await fetch(`${baseUrl}/v1/plants/${plantId}/revenue?time=${time}&date=${date}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn(`Revenue API failed for ${getEnvironment()}:`, error);
    }
    return null;
  }

  private async getDevelopmentPowerFactorData(plantId: string, time: string, date: string): Promise<PowerFactorData | null> {
    try {
      const baseUrl = getCurrentBaseUrl();
      const response = await fetch(`${baseUrl}/v1/plants/${plantId}/pfactor?time=${time}&date=${date}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn(`Power Factor API failed for ${getEnvironment()}:`, error);
    }
    return null;
  }


  // Mock data methods
  private async getMockPlants(): Promise<Plant[]> {
    const { generateMockPlants } = await import('@shared/solar-data');
    return generateMockPlants();
  }


  private async getMockWeatherData(plantId: string): Promise<WeatherData> {
    const { generateMockWeatherData } = await import('@shared/solar-data');
    return generateMockWeatherData(plantId);
  }

  private async getMockKPIData(plantId: string): Promise<KPIs> {
    const { generateMockKPIInfo } = await import('@shared/solar-data');
    return generateMockKPIInfo(plantId);
  }

  private async getMockAlertsData(plantId: string): Promise<AlertCount> {
    const { generateMockAlerts } = await import('@shared/solar-data');
    const allAlerts = generateMockAlerts();
    return allAlerts.filter(alert => alert.plantId === plantId).reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as AlertCount);
  }

  private async getMockPOCData(plantId: string): Promise<POCData> {
    const { generateMockPOCData } = await import('@shared/solar-data');
    return generateMockPOCData(plantId);
  }

  private async getMockEnergyData(plantId: string): Promise<EnergyData[]> {
    const { generateMockEnergyData } = await import('@shared/solar-data');
    return generateMockEnergyData(plantId);
  }

  private async getMockPowerData(plantId: string): Promise<PowerData[]> {
    const { generateMockPowerData } = await import('@shared/solar-data');
    return generateMockPowerData(plantId);
  }

  private async getMockInverterHeatmapData(plantId: string): Promise<InverterHeatmapData[]> {
    const { generateMockInverterHeatmapData } = await import('@shared/solar-data');
    return generateMockInverterHeatmapData(plantId);
  }

  private async getMockRevenueData(plantId: string): Promise<RevenueData> {
    const { generateMockRevenueData } = await import('@shared/solar-data');
    return generateMockRevenueData(plantId);
  }

  private async getMockPowerFactorData(plantId: string): Promise<PowerFactorData> {
    const { generateMockPowerFactorData } = await import('@shared/solar-data');
    return generateMockPowerFactorData(plantId);
  }

  private generateMockAnalysisData(request: AnalysisRequest): AnalysisResponse {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const mockData: any[] = [];
    
    for (let i = 1; i <= 20; i++) {
      for (const hour of hours) {
        let value = 0;
        
        if (hour >= 6 && hour <= 18) {
          const solarFactor = Math.sin(((hour - 6) * Math.PI) / 12);
          
          switch (request.param) {
            case "voltage":
              value = 380 + solarFactor * 50 + Math.random() * 20;
              break;
            case "current":
              value = 10 + solarFactor * 25 + Math.random() * 5;
              break;
            case "power":
              value = 5000 + solarFactor * 15000 + Math.random() * 1000;
              break;
            case "energy":
              value = hour * 800 * solarFactor + Math.random() * 200;
              break;
            default:
              value = Math.random() * 100;
          }
        }
        
        mockData.push({
          inverterId: i.toString(),
          inverterName: `INV-${i.toString().padStart(3, '0')}`,
          value: Math.max(0, value),
          hour: `${hour.toString().padStart(2, '0')}:00`
        });
      }
    }
    
    return {
      reportType: `${request.domain} Analysis`,
      metric: request.param,
      layers: 1,
      data: mockData
    };
  }

}

// Export singleton instance
export const plantService = PlantService.getInstance();
