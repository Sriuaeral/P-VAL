import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import Layout from '../Layout';

// Lazy load all pages for better performance
const Plants = React.lazy(() => import("../../pages/Plants"));
const PlantMonitor = React.lazy(() => import("../../pages/PlantMonitor"));
const PlantKPI = React.lazy(() => import("../../pages/PlantKPI"));
const GlobalAlerts = React.lazy(() => import("../../pages/GlobalAlerts"));
const AssetHealth = React.lazy(() => import("../../pages/AssetHealth"));
const PlantAnalysis = React.lazy(() => import("../../pages/PlantAnalysis"));
const PlantDataHealth = React.lazy(() => import("../../pages/PlantDataHealth"));
const PlantReports = React.lazy(() => import("../../pages/PlantReports"));
const PlantBESS = React.lazy(() => import("../../pages/PlantBESS"));
const Portfolio = React.lazy(() => import("../../pages/Portfolio"));
const ESGDashboard = React.lazy(() => import("../../pages/ESGDashboard"));
const Tests = React.lazy(() => import("../../pages/Tests"));
const Stock = React.lazy(() => import("../../pages/Stock"));
const Payments = React.lazy(() => import("../../pages/Payments"));
const SupplyChain = React.lazy(() => import("../../pages/SupplyChain"));
const Clients = React.lazy(() => import("../../pages/Clients"));
const PlaceholderPage = React.lazy(() => import("../../pages/PlaceholderPage"));
const PlantAlerts = React.lazy(() => import("../../pages/PlantAlerts"));
const PlantDocuments = React.lazy(() => import("../../pages/PlantDocuments"));
const PlantInventory = React.lazy(() => import("../../pages/PlantInventory"));
const PlantRobots = React.lazy(() => import("../../pages/PlantRobots"));
const PlantTracking = React.lazy(() => import("../../pages/PlantTracking"));
const PlantTrackers = React.lazy(() => import("../../pages/PlantTrackers"));
const PlantSimulator = React.lazy(() => import("../../pages/PlantSimulator"));
const PlantWorkOrders = React.lazy(() => import("../../pages/PlantWorkOrders"));
const NotFound = React.lazy(() => import("../../pages/NotFound"));

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20 flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/60 rounded-2xl blur-lg opacity-60"></div>
        <div className="relative bg-gradient-to-r from-primary to-primary/80 p-6 rounded-2xl">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
      <div className="text-lg font-semibold text-slate-700 dark:text-slate-300">
        Loading...
      </div>
      <div className="text-sm text-slate-500 dark:text-slate-400">
        Please wait while we prepare your dashboard
      </div>
    </div>
  </div>
);

// Helper component to wrap routes with ProtectedRoute and Layout
const ProtectedRouteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute>
    <Layout>
      <Suspense fallback={<LoadingSpinner />}>
        {children}
      </Suspense>
    </Layout>
  </ProtectedRoute>
);

export const ProtectedRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Main Application Routes - All Protected */}
      <Route
        path="/plants"
        element={
          <ProtectedRouteWrapper>
            <Plants />
          </ProtectedRouteWrapper>
        }
      />

      {/* Plant-specific routes */}
      <Route
        path="/plants/:plantId/monitor"
        element={
          <ProtectedRouteWrapper>
            <PlantMonitor />
          </ProtectedRouteWrapper>
        }
      />

      <Route
        path="/plants/:plantId/analysis"
        element={
          <ProtectedRouteWrapper>
            <PlantAnalysis />
          </ProtectedRouteWrapper>
        }
      />

      <Route
        path="/plants/:plantId/data-health"
        element={
          <ProtectedRouteWrapper>
            <PlantDataHealth />
          </ProtectedRouteWrapper>
        }
      />

      <Route
        path="/plants/:plantId/alerts"
        element={
          <ProtectedRouteWrapper>
            <PlantAlerts />
          </ProtectedRouteWrapper>
        }
      />

      <Route
        path="/plants/:plantId/work-orders"
        element={
          <ProtectedRouteWrapper>
            <PlantWorkOrders />
          </ProtectedRouteWrapper>
        }
      />

      <Route
        path="/plants/:plantId/kpi"
        element={
          <ProtectedRouteWrapper>
            <PlantKPI />
          </ProtectedRouteWrapper>
        }
      />

      <Route
        path="/plants/:plantId/documents"
        element={
          <ProtectedRouteWrapper>
            <PlantDocuments />
          </ProtectedRouteWrapper>
        }
      />

      <Route
        path="/plants/:plantId/reports"
        element={
          <ProtectedRouteWrapper>
            <PlantReports />
          </ProtectedRouteWrapper>
        }
      />

      <Route
        path="/plants/:plantId/bess"
        element={
          <ProtectedRouteWrapper>
            <PlantBESS />
          </ProtectedRouteWrapper>
        }
      />

      <Route
        path="/plants/:plantId/inventory"
        element={
          <ProtectedRouteWrapper>
            <PlantInventory />
          </ProtectedRouteWrapper>
        }
      />

      <Route
        path="/plants/:plantId/tracking"
        element={
          <ProtectedRouteWrapper>
            <PlantTracking />
          </ProtectedRouteWrapper>
        }
      />

      <Route
        path="/plants/:plantId/robots"
        element={
          <ProtectedRouteWrapper>
            <PlantRobots />
          </ProtectedRouteWrapper>
        }
      />

      <Route
        path="/plants/:plantId/trackers"
        element={
          <ProtectedRouteWrapper>
            <PlantTrackers />
          </ProtectedRouteWrapper>
        }
      />

      <Route
        path="/plants/:plantId/simulator"
        element={
          <ProtectedRouteWrapper>
            <PlantSimulator />
          </ProtectedRouteWrapper>
        }
      />

      {/* Global Module Routes */}
      <Route
        path="/alerts"
        element={
          <ProtectedRouteWrapper>
            <GlobalAlerts />
          </ProtectedRouteWrapper>
        }
      />

      <Route
        path="/asset-health"
        element={
          <ProtectedRouteWrapper>
            <AssetHealth />
          </ProtectedRouteWrapper>
        }
      />

      <Route
        path="/portfolio"
        element={
          <ProtectedRouteWrapper>
            <Portfolio />
          </ProtectedRouteWrapper>
        }
      />

      <Route
        path="/esg"
        element={
          <ProtectedRouteWrapper>
            <ESGDashboard />
          </ProtectedRouteWrapper>
        }
      />

      <Route
        path="/tests"
        element={
          <ProtectedRouteWrapper>
            <Tests />
          </ProtectedRouteWrapper>
        }
      />

      <Route
        path="/stock"
        element={
          <ProtectedRouteWrapper>
            <Stock />
          </ProtectedRouteWrapper>
        }
      />

      <Route
        path="/payments"
        element={
          <ProtectedRouteWrapper>
            <Payments />
          </ProtectedRouteWrapper>
        }
      />

      <Route
        path="/supply-chain"
        element={
          <ProtectedRouteWrapper>
            <SupplyChain />
          </ProtectedRouteWrapper>
        }
      />

      <Route
        path="/clients"
        element={
          <ProtectedRouteWrapper>
            <Clients />
          </ProtectedRouteWrapper>
        }
      />

      {/* Catch-all route */}
      <Route 
        path="*" 
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <NotFound />
          </Suspense>
        } 
      />
    </Routes>
  );
};
