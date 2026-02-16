import "./global.css";
import "./lib/debug-utils"; // Initialize debug utilities

// Suppress Recharts defaultProps warnings until library updates
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Support for defaultProps will be removed') &&
    (args[0].includes('XAxis') || args[0].includes('YAxis'))
  ) {
    return; // Suppress this specific warning
  }
  originalConsoleWarn.apply(console, args);
};

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useState, useEffect } from "react";
import Layout from "./components/Layout";
import { StatusBarProvider } from "@/hooks/use-status-bar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LoginPage } from "@/components/auth/LoginPage";
import { ProtectedRoutes } from "@/components/auth/ProtectedRoutes";
import { AlertProvider } from "@/components/providers/AlertProvider";

const queryClient = new QueryClient();

// Component to handle root route redirection based on auth state
const RootRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Show loading while auth state is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/60 rounded-2xl blur-lg opacity-60"></div>
            <div className="relative bg-gradient-to-r from-primary to-primary/80 p-6 rounded-2xl">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <div className="text-lg font-semibold text-slate-700">
            Loading...
          </div>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated, redirect to plants
  return <Navigate to="/plants" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <StatusBarProvider>
        <AlertProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Login route */}
                <Route path="/login" element={<LoginPage />} />
                
                {/* Redirect root based on auth state */}
                <Route path="/" element={<RootRedirect />} />

                {/* All other routes are protected */}
                <Route path="/*" element={<ProtectedRoutes />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </AlertProvider>
      </StatusBarProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
