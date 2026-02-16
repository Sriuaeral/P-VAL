// Enterprise Configuration for Solar Asset Management Platform
export const config = {
  // Environment Configuration
  environment: import.meta.env.MODE || 'development',
  isProduction: import.meta.env.MODE === 'production',
  isDevelopment: import.meta.env.MODE === 'development',
  isStaging: import.meta.env.MODE === 'staging',
  
  // Environment-specific API URLs
  developmentApiUrl: import.meta.env.VITE_DEVELOPMENT_API_URL || 'https://aventrionapim.azure-api.net/ralapi/',
  stagingApiUrl: import.meta.env.VITE_STAGING_API_URL || 'https://aventrionapim.azure-api.net/ralapi/',
  productionApiUrl: import.meta.env.VITE_PRODUCTION_API_URL || 'https://aventrionapim.azure-api.net/ralapi/',
  
  // Azure Functions Configuration (for fallback)
  azureFunctionsUrl: import.meta.env.VITE_AZURE_FUNCTIONS_URL || 'https://aventrionapim.azure-api.net/ralapi',
  azureFunctionsApiKey: import.meta.env.VITE_AZURE_FUNCTIONS_API_KEY || '', // api key for the azure functions
  
  // Legacy support - will be removed in future versions
  baseApiUrl: import.meta.env.VITE_BASE_API_URL || 'https://aventrionapim.azure-api.net/ralapi/',
  
  // Performance Configuration
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  autoRefreshInterval: parseInt(import.meta.env.VITE_AUTO_REFRESH_INTERVAL || '1020000'),
  cacheDuration: parseInt(import.meta.env.VITE_CACHE_DURATION || '300000'), // 5 minutes
  
  // Enterprise Feature Flags
  features: {
    enableRealTimeUpdates: import.meta.env.VITE_ENABLE_REALTIME_UPDATES !== 'false',
    enableAutoRefresh: import.meta.env.VITE_ENABLE_AUTO_REFRESH !== 'false',
    enableErrorReporting: import.meta.env.VITE_ENABLE_ERROR_REPORTING !== 'false',
    enableCaching: import.meta.env.VITE_ENABLE_CACHING !== 'false',
    enableRetryLogic: import.meta.env.VITE_ENABLE_RETRY_LOGIC !== 'false',
    enableCircuitBreaker: import.meta.env.VITE_ENABLE_CIRCUIT_BREAKER !== 'false',
  },
  
  // API Endpoints - Updated to match Swagger specification
  endpoints: {
    // Plant endpoints
    plants: '/v1/plants',
    
    // Alert endpoints
    alerts: '/v1/alerts',
    alertTrends: '/v1/plants/{pid}/alert-trends',
    alertSearch: '/v1/alerts/search',
    alertCritical: '/v1/alerts/critical',
    alertOverdue: '/v1/alerts/overdue',
    alertMetadata: '/v1/alerts/metadata',
    alertBulk: '/v1/alerts/bulk',
    alertById: '/v1/alerts/{id}',
    alertResolve: '/v1/alerts/{id}/resolve',
    alertCancel: '/v1/alerts/{id}/cancel',
    alertAcknowledge: '/v1/alerts/{id}/acknowledge',
    alertEscalate: '/v1/alerts/{id}/escalate',
    alertRelated: '/v1/alerts/{id}/related',
    alertHistory: '/v1/alerts/{id}/history',
    
    // Plant-specific alert endpoints
    plantAlerts: '/v1/plants/{pid}/alerts',
    alertStatusSummary: '/v1/plants/{pid}/alert-status-summary',
    alertCounts: '/v1/plants/{pid}/alert-counts',
    alertStats: '/v1/plants/{pid}/alert-stats',
    alertSeverityTrends: '/v1/plants/{pid}/severity-trends',
    alertResolutionTrends: '/v1/plants/{pid}/resolution-trends',
    alertResolutionMetrics: '/v1/plants/{pid}/resolution-metrics',
    componentAlertDistribution: '/v1/plants/{pid}/component-alert-distribution',
    
    // KPI endpoints
    kpis: '/v1/plants/{pid}/Kpi',
    plantKPIs: '/v1/plants/{pid}/kpis/detailed',
    technicalKPIs: '/v1/plants/{pid}/kpis/technical',
    financialKPIs: '/v1/plants/{pid}/kpis/financial',
    commercialKPIs: '/v1/plants/{pid}/kpis/commercial',
    historicalKPIs: '/v1/plants/{pid}/kpis/historical',
    
    // Plant data endpoints
    weather: '/v1/plants/{pid}/weather',
    energy: '/v1/plants/{pid}/energy',
    power: '/v1/plants/{pid}/power',
    revenue: '/v1/plants/{pid}/revenue',
    heatmap: '/v1/plants/{pid}/heatmap',
    pfactor: '/v1/plants/{pid}/pfactor',
    poc: '/v1/plants/{pid}/poc',
    
    // Work order endpoints
    workorders: '/workorders',
    workorderById: '/workorders/{id}',
    workorderComplete: '/workorders/{id}/complete',
    
    // Analysis endpoints
    analysis: '/v1/analysis', // Base endpoint - will be modified per environment
  },
  
  // Retry Configuration
  retry: {
    maxAttempts: parseInt(import.meta.env.VITE_MAX_RETRY_ATTEMPTS || '3'),
    backoffDelay: parseInt(import.meta.env.VITE_RETRY_BACKOFF_DELAY || '1000'),
  }
};



// Environment Detection Helper
export const getEnvironment = (): 'development' | 'staging' | 'production' => {
  // Check for explicit environment variables first
  if (import.meta.env.VITE_ENVIRONMENT) {
    return import.meta.env.VITE_ENVIRONMENT as 'development' | 'staging' | 'production';
  }
  
  // Check for NODE_ENV
  if (import.meta.env.NODE_ENV === 'production') {
    return 'production';
  }
  
  // Check for Vite mode
  if (import.meta.env.MODE === 'production') {
    return 'production';
  } else if (import.meta.env.MODE === 'staging') {
    return 'staging';
  }
  
  // Default to development
  return 'development';
};

// Get the appropriate API URL for the current environment
export const getCurrentApiUrl = (endpoint: string = ''): string => {
  const environment = getEnvironment();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  let baseUrl: string;
  
  switch (environment) {
    case 'production':
      baseUrl = config.productionApiUrl;
      break;
    case 'staging':
      baseUrl = config.stagingApiUrl;
      break;
    case 'development':
    default:
      baseUrl = config.developmentApiUrl;
      break;
  }
  
  return cleanEndpoint ? `${baseUrl}/${cleanEndpoint}` : baseUrl;
};

// Get base URL for current environment
export const getCurrentBaseUrl = (): string => {
  const environment = getEnvironment();
  
  switch (environment) {
    case 'production':
      return config.productionApiUrl;
    case 'staging':
      return config.stagingApiUrl;
    case 'development':
    default:
      return config.developmentApiUrl;
  }
};

// Environment-specific URL helpers
export const getDevelopmentApiUrl = (endpoint: string = ''): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return cleanEndpoint ? `${config.developmentApiUrl}/${cleanEndpoint}` : config.developmentApiUrl;
};

// Get the correct analysis endpoint based on environment
export const getAnalysisEndpoint = (): string => {
  const environment = getEnvironment();
  
  switch (environment) {
    case 'development':
      return '/v1/analysis'; // Use Vite proxy in development
    case 'staging':
    case 'production':
    default:
      return config.endpoints.analysis; // Use direct APIM endpoint in production/staging
  }
};

export const getStagingApiUrl = (endpoint: string = ''): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return cleanEndpoint ? `${config.stagingApiUrl}/${cleanEndpoint}` : config.stagingApiUrl;
};

export const getProductionApiUrl = (endpoint: string = ''): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return cleanEndpoint ? `${config.productionApiUrl}/${cleanEndpoint}` : config.productionApiUrl;
};

// Azure Functions URL helper
export const getAzureFunctionUrl = (endpoint: string = ''): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return cleanEndpoint ? `${config.azureFunctionsUrl}/${cleanEndpoint}` : config.azureFunctionsUrl;
};

// Check if we should use Azure Functions as fallback
export const shouldUseAzureFunctions = (): boolean => {
  const environment = getEnvironment();
  
  // Use Azure Functions in production if no production API URL is configured
  if (environment === 'production' && config.productionApiUrl.includes('yourdomain.com')) {
    return true;
  }
  
  // Use Azure Functions if explicitly enabled
  return import.meta.env.VITE_USE_AZURE_FUNCTIONS === 'true';
};

// Date and time utility functions
export const getCurrentDate = (): string => {
  const now = new Date();
  return `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
};

export const getCurrentTime = (): string => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

// Format date for API calls (DD-MM-YYYY)
export const formatDateForAPI = (date: Date): string => {
  return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
};

// Format time for API calls (HH:MM)
export const formatTimeForAPI = (date: Date): string => {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// Environment Helper Functions
export const isDevelopment = (): boolean => config.isDevelopment;
export const isProduction = (): boolean => config.isProduction;
export const isStaging = (): boolean => config.isStaging;

// Feature Helper Functions
export const isFeatureEnabled = (feature: keyof typeof config.features): boolean => {
  return config.features[feature];
};

// API Endpoint Helper
export const getApiEndpoint = (endpoint: keyof typeof config.endpoints): string => {
  return config.endpoints[endpoint];
};

// KPI Endpoint Helper with plant ID replacement
export const getKPIEndpoint = (
  endpoint: 'plantKPIs' | 'technicalKPIs' | 'financialKPIs' | 'commercialKPIs' | 'historicalKPIs',
  plantId: string
): string => {
  return config.endpoints[endpoint].replace('{pid}', plantId);
};

// Log configuration after all functions are defined
const currentEnvironment = getEnvironment();
console.log('🏢 Enterprise Configuration loaded:', {
  environment: currentEnvironment,
  viteMode: config.environment,
  isDevelopment: config.isDevelopment,
  isProduction: config.isProduction,
  isStaging: config.isStaging,
  currentApiUrl: getCurrentBaseUrl(),
  developmentApiUrl: config.developmentApiUrl,
  stagingApiUrl: config.stagingApiUrl,
  productionApiUrl: config.productionApiUrl,
  azureFunctionsUrl: config.azureFunctionsUrl,
  shouldUseAzureFunctions: shouldUseAzureFunctions(),
  apiTimeout: config.apiTimeout,
  cacheDuration: config.cacheDuration,
  features: config.features,
  hasApiKey: !!config.azureFunctionsApiKey,
  legacyBaseUrl: config.baseApiUrl
});
