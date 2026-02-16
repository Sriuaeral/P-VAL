// Service layer exports - SaaS-focused service architecture
export { BaseService } from './base-service';
export { PlantService, plantService } from './plant-service';
export { WorkOrderService, workOrderService } from './work-order-service';

// Re-export HTTP client for direct use if needed
export { httpClient } from '../http-client';
