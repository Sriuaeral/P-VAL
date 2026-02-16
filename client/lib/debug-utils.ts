// Debug utilities for monitoring API calls and failures
import { PlantService } from './services/plant-service';

// Global debug utilities for browser console
declare global {
  interface Window {
    debugAPI: {
      getFailedEndpoints: () => any;
      clearFailedEndpoints: () => void;
      getServiceMetrics: () => any;
      getPlantService: () => PlantService;
    };
  }
}

// Initialize debug utilities
export function initializeDebugUtils() {
  const plantService = PlantService.getInstance();
  
  window.debugAPI = {
    // Get failed endpoints status
    getFailedEndpoints: () => {
      const status = plantService.getFailedEndpointsStatus();
      console.table(status);
      return status;
    },
    
    // Clear failed endpoints (useful for testing)
    clearFailedEndpoints: () => {
      plantService.clearFailedEndpoints();
      console.log('✅ Cleared all failed endpoints');
    },
    
    // Get service metrics
    getServiceMetrics: () => {
      const metrics = plantService.getMetrics();
      console.log('📊 Service Metrics:', metrics);
      return metrics;
    },
    
    // Get plant service instance
    getPlantService: () => plantService,
  };
  
  console.log('🔧 Debug utilities initialized! Use window.debugAPI to access:');
  console.log('  - debugAPI.getFailedEndpoints() - Show failed endpoints');
  console.log('  - debugAPI.clearFailedEndpoints() - Clear failed endpoints');
  console.log('  - debugAPI.getServiceMetrics() - Show service metrics');
  console.log('  - debugAPI.getPlantService() - Get plant service instance');
}

// Auto-initialize in development
if (import.meta.env.DEV) {
  initializeDebugUtils();
}
