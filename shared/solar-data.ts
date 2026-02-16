// Solar Asset Management Platform - Mock Data and Types
import { Plant, WeatherData, Alert, KPI, POCData, KPIs, EnergyData, PowerData, InverterHeatmapData, RevenueData, PowerFactorData, PlantMonitoringData, InverterData, InverterHourlyData, InverterTempData } from "./interface";

// Mock Data Generators
//// repalce with api end point
export const generateMockPlants = (): Plant[] =>[
  {
    "id": 1,
    "name": "Mohammed bin Rashid Al Maktoum Solar Park",
    "description": null,
    "imageUrl": null,
    "location": {
      "id": 0,
      "name": "Solar Park",
      "longitude": "55.3670",
      "latitude": "24.8469"
    },
    "capacity": 5000,
    "status": "operational",
    "pr": 82.5,
    "cuf": 23.1,
    "availability": 99.0,
    "alertCount": { "critical": 1, "high": 3, "medium": 4, "low": 6 },
    "lastUpdated": "2024-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "name": "Al Marmoom Desert Solar Site",
    "description": null,
    "imageUrl": null,
    "location": {
      "id": 0,
      "name": "Al Marmoom",
      "longitude": "55.4165",
      "latitude": "24.8240"
    },
    "capacity": 800,
    "status": "maintenance",
    "pr": 83.2,
    "cuf": 22.7,
    "availability": 98.7,
    "alertCount": { "critical": 0, "high": 1, "medium": 3, "low": 5 },
    "lastUpdated": "2024-01-15T10:30:00Z"
  },
  {
    "id": 3,
    "name": "Seih Al Dahl Solar Farm",
    "description": null,
    "imageUrl": null,
    "location": {
      "id": 0,
      "name": "Seih Al Dahl",
      "longitude": "55.6290",
      "latitude": "24.7120"
    },
    "capacity": 600,
    "status": "offline",
    "pr": 84.1,
    "cuf": 22.0,
    "availability": 98.2,
    "alertCount": { "critical": 0, "high": 0, "medium": 2, "low": 4 },
    "lastUpdated": "2024-01-15T10:30:00Z"
  },
  {
    "id": 4,
    "name": "Dubai–Al Ain Road Solar Cluster",
    "description": null,
    "imageUrl": null,
    "location": {
      "id": 0,
      "name": "Dubai-Al Ain",
      "longitude": "55.5158",
      "latitude": "24.8912"
    },
    "capacity": 1000,
    "status": "operational",
    "pr": 85.0,
    "cuf": 23.4,
    "availability": 98.9,
    "alertCount": { "critical": 0, "high": 2, "medium": 3, "low": 7 },
    "lastUpdated": "2024-01-15T10:30:00Z"
  },
  {
    "id": 5,
    "name": "Jebel Ali South Solar Site",
    "description": null,
    "imageUrl": null,
    "location": {
      "id": 0,
      "name": "Jebel Ali South",
      "longitude": "55.0250",
      "latitude": "24.9300"
    },
    "capacity": 1200,
    "status": "operational",
    "pr": 81.9,
    "cuf": 21.8,
    "availability": 97.5,
    "alertCount": { "critical": 0, "high": 1, "medium": 2, "low": 3 },
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
];

export const generateMockWeatherData = (plantId: string): WeatherData => ({
  temperature: 28 + Math.random() * 15,
  windSpeed: 5 + Math.random() * 10,
  humidity: 40 + Math.random() * 30,
  windDirection: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][
    Math.floor(Math.random() * 8)
  ],
  irradiance: 600 + Math.random() * 400,
  timestamp: new Date().toISOString(),
  ghi: 600 + Math.random() * 400,
  dni: 600 + Math.random() * 400,
  cellTemperature: 28 + Math.random() * 15,
});

export const generateMockAlerts = (): Alert[] => [
  {
    id: "alert-1",
    plantId: "1",
    plantName: "Plant 1",
    component: "Inverter Unit 5",
    severity: "high",
    message: "Inverter efficiency below threshold (92%)",
    timestamp: "2024-01-15T09:15:00Z",
    status: "active",
  },
  {
    id: "alert-2",
    plantId: "2",
    plantName: "Plant 2",
    component: "String Combiner Box 12",
    severity: "critical",
    message: "DC current imbalance detected - immediate attention required",
    timestamp: "2024-01-15T08:45:00Z",
    status: "acknowledged",
  },
  {
    id: "alert-3",
    plantId: "1",
    plantName: "Plant 1",
    component: "Weather Station",
    severity: "medium",
    message: "Communication timeout - data collection interrupted",
    timestamp: "2024-01-15T07:30:00Z",
    status: "active",
  },
  {
    id: "alert-4",
    plantId: "2",
    plantName: "Plant 2",
    component: "Main Transformer",
    severity: "critical",
    message: "Grid connection lost - plant offline",
    timestamp: "2024-01-15T06:00:00Z",
    status: "active",
  },
];

export const generateMockKPIs = (plantId: string): KPI[] => [
  {
    name: "Target PR",
    value: 85,
    unit: "%",
    target: 85,
    trend: "stable",
    color: "success",
  },
  {
    name: "Current PR",
    value: 86.5,
    unit: "%",
    target: 85,
    trend: "up",
    color: "success",
  },
  {
    name: "CUF",
    value: 23.2,
    unit: "%",
    trend: "up",
    color: "success",
  },
  {
    name: "System Availability",
    value: 98.7,
    unit: "%",
    target: 98,
    trend: "stable",
    color: "success",
  },
];

export const generateMockKPIInfo = (plantId: string): KPIs => ({
  targetPR: 85,
  currentPR: 86.5,
  cuf: 23.2,
  availability: 98.7,
  specificYield: 4.2,
  ppi: 94.8,
  epi: 96.1,
  prRatio: 0.85,
});

export const generateMockPOCData = (plantId: string): POCData => ({
  voltage: {
    value: 33.2 + Math.random() * 2,
    unit: "kV",
    timestamp: new Date().toISOString(),
  },
  current: {
    value: 1250 + Math.random() * 500,
    unit: "A",
    timestamp: new Date().toISOString(),
  },
  frequency: {
    value: 50 + Math.random() * 0.2,
    unit: "Hz",
    timestamp: new Date().toISOString(),
  },
});

export const generateMockEnergyData = (plantId: string): EnergyData[] => {
  const energyData: EnergyData[] = [];
  
  // Generate 24 hours of data
  for (let hour = 0; hour < 24; hour++) {
    const hourStr = String(hour).padStart(2, '0');
    
    // Simulate solar generation pattern (higher during day, lower at night)
    let baseValue = 0;
    if (hour >= 6 && hour <= 18) {
      // Peak generation during daylight hours
      const normalizedHour = (hour - 6) / 12; // 0 to 1
      baseValue = Math.sin(normalizedHour * Math.PI) * 100; // Sine wave pattern
    }
    
    // Add some randomness
    const value = Math.max(0, baseValue + (Math.random() - 0.5) * 20);
    const actualValue = value * (0.8 + Math.random() * 0.4); // 80-120% of expected
    
    energyData.push({
      hour: `${hourStr}:00`,
      value: Math.round(value * 100) / 100,
      actualValue: Math.round(actualValue * 100) / 100,
    });
  }
  
  return energyData;
};

export const generateMockPowerData = (plantId: string): PowerData[] => {
  const powerData: PowerData[] = [];
  
  // Generate 24 hours of data
  for (let hour = 0; hour < 24; hour++) {
    const hourStr = String(hour).padStart(2, '0');
    
    // Simulate solar power generation pattern (higher during day, lower at night)
    let baseValue = 0;
    if (hour >= 6 && hour <= 18) {
      // Peak generation during daylight hours
      const normalizedHour = (hour - 6) / 12; // 0 to 1
      baseValue = Math.sin(normalizedHour * Math.PI) * 50; // Sine wave pattern for power (MW)
    }
    
    // Add some randomness
    const value = Math.max(0, baseValue + (Math.random() - 0.5) * 10);
    const actualValue = value * (0.8 + Math.random() * 0.4); // 80-120% of expected
    
    powerData.push({
      hour: `${hourStr}:00`,
      value: Math.round(value * 100) / 100,
      actualValue: Math.round(actualValue * 100) / 100,
    });
  }
  
  return powerData;
};

export const generateMockInverterHeatmapData = (plantId: string): InverterHeatmapData[] => {
  const heatmapData: InverterHeatmapData[] = [];
  
  // Generate data for 24 inverters
  for (let inverterId = 1; inverterId <= 24; inverterId++) {
    // Generate data for 24 hours
    for (let hour = 0; hour < 24; hour++) {
      const hourStr = String(hour).padStart(2, '0');
      
      // Simulate inverter temperature based on time of day and inverter position
      let baseTemp = 25; // Base temperature
      
      // Higher temperature during daylight hours (6 AM - 6 PM)
      if (hour >= 6 && hour <= 18) {
        const normalizedHour = (hour - 6) / 12; // 0 to 1
        baseTemp += Math.sin(normalizedHour * Math.PI) * 15; // Peak at noon
      }
      
      // Add some variation based on inverter position (some inverters run hotter)
      const inverterVariation = (inverterId % 3) * 2; // 0, 2, or 4 degrees
      const randomVariation = (Math.random() - 0.5) * 4; // ±2 degrees
      
      const temperature = Math.max(20, baseTemp + inverterVariation + randomVariation);
      
      heatmapData.push({
        inverterId: inverterId.toString(),
        inverterName: `INV-${inverterId.toString().padStart(3, '0')}`,
        inverterTemperature: Math.round(temperature * 100) / 100,
        hour: `${hourStr}:00`,
      });
    }
  }
  
  return heatmapData;
};

export const generateMockRevenueData = (plantId: string): RevenueData => {
  const plant = generateMockPlants().find(p => p.id === plantId);
  const capacity = plant?.capacity || 5000; // MW
  
  // Calculate realistic values based on plant capacity
  const energyToday = capacity * 8.7; // kWh per MW capacity
  const ppaTariff = 0.065; // USD per kWh
  const revenueToday = energyToday * ppaTariff;
  
  // Monthly values (simulate 15 days)
  const energyThisMonth = energyToday * 15;
  const revenueThisMonth = energyThisMonth * ppaTariff;
  
  // Specific yield calculation
  const specificYield = energyToday / capacity; // kWh/kWp
  
  // CO2 savings (kg CO2 per kWh)
  const co2Saved = energyToday * 0.0005; // tons
  const co2SavedThisMonth = co2Saved * 15;
  
  return {
    energyToday: Math.round(energyToday),
    revenueToday: Math.round(revenueToday),
    energyThisMonth: Math.round(energyThisMonth),
    revenueThisMonth: Math.round(revenueThisMonth),
    specificYield: Math.round(specificYield * 100) / 100,
    co2Saved: Math.round(co2Saved * 100) / 100,
    co2SavedThisMonth: Math.round(co2SavedThisMonth * 100) / 100,
  };
};

export const generateMockPowerFactorData = (plantId: string): PowerFactorData => {
  // Generate realistic power factor values (typically between 0.85 and 0.99)
  const baseValue = 0.95; // Good power factor
  const variation = (Math.random() - 0.5) * 0.1; // ±0.05 variation
  const powerFactor = Math.max(0.85, Math.min(0.99, baseValue + variation));
  
  // Generate average power factor (slightly lower than current)
  const avgPowerFactor = Math.max(0.80, powerFactor - (Math.random() * 0.05));
  
  // Target power factor (typically 0.95)
  const targetPowerFactor = 0.95;
  
  return {
    powerFactor: Math.round(powerFactor * 1000) / 1000, // Round to 3 decimal places
    avgPowerFactor: Math.round(avgPowerFactor * 1000) / 1000,
    targetPowerFactor: targetPowerFactor,
  };
};

export const generateMockPlantMonitoringData = (plantId: string): PlantMonitoringData => {
  const timestamp = new Date().toISOString();
  const plant = generateMockPlants().find(p => p.id === plantId);
  const capacity = plant?.capacity || 5000;

  // Generate inverter data
  const inverters: InverterData[] = [];
  const inverterTemp: InverterTempData = {};
  
  for (let i = 1; i <= 24; i++) {
    const inverterId = i.toString();
    const status = Math.random() > 0.9 ? "Warning" : Math.random() > 0.95 ? "Fault" : "OK";
    const power = (capacity / 24) * (0.8 + Math.random() * 0.4);
    const efficiency = 85 + Math.random() * 10;
    const temperature = 25 + Math.random() * 20;

    // Generate hourly data for the inverter
    const hourlyData: InverterHourlyData[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourPower = hour >= 6 && hour <= 18 ? power * (0.5 + Math.random() * 0.5) : power * 0.1;
      hourlyData.push({
        hour,
        power: Math.round(hourPower * 100) / 100,
        efficiency: Math.round((efficiency + (Math.random() - 0.5) * 5) * 100) / 100,
        temperature: Math.round((temperature + (Math.random() - 0.5) * 10) * 100) / 100,
        status: status,
        timestamp: timestamp
      });
    }

    inverters.push({
      id: inverterId,
      status: status as "OK" | "Warning" | "Fault",
      power: Math.round(power * 100) / 100,
      efficiency: Math.round(efficiency * 100) / 100,
      temperature: Math.round(temperature * 100) / 100,
      hourlyData,
      timestamp
    });

    // Generate temperature data for heatmap
    inverterTemp[inverterId] = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourTemp = hour >= 6 && hour <= 18 ? 
        temperature + Math.sin(((hour - 6) * Math.PI) / 12) * 10 : 
        temperature - 5;
      inverterTemp[inverterId].push({
        temperature: Math.round(hourTemp * 100) / 100
      });
    }
  }

  return {
    plantId,
    timestamp,
    weather: generateMockWeatherData(plantId),
    powerGeneration: {
      currentPower: Math.round(capacity * (0.6 + Math.random() * 0.3) * 100) / 100,
      expectedPower: Math.round(capacity * 0.8 * 100) / 100,
      powerFactor: 0.95 + (Math.random() - 0.5) * 0.1,
      efficiency: 85 + Math.random() * 10,
      timestamp
    },
    energyProduction: {
      dailyEnergy: Math.round(capacity * 8.7 * 100) / 100,
      monthlyEnergy: Math.round(capacity * 8.7 * 15 * 100) / 100,
      yearlyEnergy: Math.round(capacity * 8.7 * 365 * 100) / 100,
      specificYield: 4.2 + Math.random() * 0.5,
      timestamp
    },
    systemPerformance: {
      performanceRatio: 85 + Math.random() * 5,
      capacityUtilizationFactor: 22 + Math.random() * 3,
      availability: 98 + Math.random() * 2,
      performanceIndex: 94 + Math.random() * 4,
      energyIndex: 96 + Math.random() * 3,
      timestamp
    },
    alerts: generateMockAlerts().filter(alert => alert.plantId === plantId),
    inverters,
    gridConnection: {
      voltage: 33.2 + Math.random() * 2,
      current: 1250 + Math.random() * 500,
      frequency: 50 + Math.random() * 0.2,
      powerFactor: 0.95 + (Math.random() - 0.5) * 0.1,
      gridStatus: "connected",
      timestamp
    },
    environmentalImpact: {
      co2Saved: Math.round(capacity * 0.5 * 100) / 100,
      treesEquivalent: Math.round(capacity * 25),
      carbonOffset: Math.round(capacity * 0.5 * 100) / 100,
      timestamp
    },
    inverterTemp
  };
};
