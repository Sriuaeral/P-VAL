import { useState, useEffect } from "react";
import { Plant } from "@shared/interface";
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { addDays, format } from "date-fns";
import { Download, Eye, Settings, TrendingUp, AlertTriangle, Zap, Cable, TrendingDown, Target, DollarSign, BarChart3 } from "lucide-react";
import PlantNavigation from "@/components/PlantNavigation";

// Import analysis components
import { GenerationAnalysisSection } from "@/components/analysis/GenerationAnalysisSection";
import { PerformanceAnalysisSection } from "@/components/analysis/PerformanceAnalysisSection";
import { FaultAnalysisSection } from "@/components/analysis/FaultAnalysisSection";
import { ComponentAnalysisSection } from "@/components/analysis/ComponentAnalysisSection";
import { ElectricalAnalysisSection } from "@/components/analysis/ElectricalAnalysisSection";
import { DegradationAnalysisSection } from "@/components/analysis/DegradationAnalysisSection";
import { ComparativeAnalysisSection } from "@/components/analysis/ComparativeAnalysisSection";
import { FinancialAnalysisSection } from "@/components/analysis/FinancialAnalysisSection";
import { CustomAnalysisSection } from "@/components/analysis/CustomAnalysisSection";
import TestSection from "@/components/analysis/TestSection";
import { LossTreeSection } from "@/components/analysis/LossTreeSection";
// Analysis sections configuration
const ANALYSIS_SECTIONS = [
  { id: "generation", label: "Generation Analysis", icon: TrendingUp, component: GenerationAnalysisSection },
  // { id: "performance", label: "PR & CUF Analysis", icon: TrendingUp, component: PerformanceAnalysisSection },
  { id: "faults", label: "Fault & Downtime", icon: AlertTriangle, component: FaultAnalysisSection },
  // { id: "components", label: "Component Performance", icon: Zap, component: ComponentAnalysisSection },
  // { id: "electrical", label: "Electrical Domains", icon: Cable, component: ElectricalAnalysisSection },
  // { id: "degradation", label: "Degradation Analysis", icon: TrendingDown, component: DegradationAnalysisSection },
  // { id: "comparative", label: "Comparative Analytics", icon: Target, component: ComparativeAnalysisSection },
  // { id: "financial", label: "Financial Impact", icon: DollarSign, component: FinancialAnalysisSection },
  { id: "custom", label: "Custom  Analysis", icon: Settings, component: CustomAnalysisSection },
  {id: "Test", label: "Test", icon: Settings, component: TestSection },
  // {id:"LossTree", label: "Loss Tree", icon: Settings, component: LossTreeSection },
];

export default function PlantAnalysis() {
  const { plantId } = useParams<{ plantId: string }>();
  const plant = JSON.parse(localStorage.getItem('selectedPlant') || '{}');
  const [selectedSection, setSelectedSection] = useState("generation");

  if (!plant || !plant.id || !plant.name) {
    return <div>Plant not found</div>;
  }

  const CurrentSectionComponent = ANALYSIS_SECTIONS.find(s => s.id === selectedSection)?.component;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <PlantNavigation />

      <div className="flex-1 p-2 space-y-2 w-full overflow-y-auto">
        {/* Header */}
        {/* <div className="bg-white/90 backdrop-blur-xl border border-white/30 shadow-2xl shadow-blue-500/5 rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  {plant.name} - Analysis Hub
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                  Comprehensive performance analytics and insights dashboard
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge
                  variant={
                    plant.status === "operational"
                      ? "success"
                      : plant.status === "maintenance"
                        ? "warning"
                        : ("destructive" as any)
                  }
                  className="text-sm px-4 py-2 font-semibold shadow-lg"
                >
                  {plant.status.toUpperCase()}
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-3 text-sm px-6 py-3 border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center relative overflow-hidden shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/20 to-transparent rounded-lg"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent rounded-lg"></div>
                    <Download className="w-3.5 h-3.5 text-white relative z-10 drop-shadow-sm" />
                  </div>
                  Export All
                </Button>
              </div>
            </div>
          </div>
        </div> */}

        {/* Navigation Tabs */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-2 relative overflow-hidden flex-shrink-0">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 rounded-2xl"></div>
          <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {ANALYSIS_SECTIONS.map((section) => {
                const Icon = section.icon;
                return (
                  <Button
                    key={section.id}
                    variant={selectedSection === section.id ? "default" : "ghost"}
                    size="sm"
                    className={`gap-1 whitespace-nowrap px-3 py-1.5 text-xs transition-all duration-200 ${
                      selectedSection === section.id 
                        ? "shadow-lg shadow-blue-500/20 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" 
                        : "hover:bg-white/20 hover:text-blue-700 border border-transparent hover:border-white/30"
                    }`}
                    onClick={() => setSelectedSection(section.id)}
                  >
                    <Icon className={`w-3 h-3 ${selectedSection === section.id ? 'text-white' : 'text-blue-600'}`} />
                    {section.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dynamic Section Content */}
        <div className="flex-1 min-h-0">
          {CurrentSectionComponent && <CurrentSectionComponent plant={plant} />}
        </div>
        {/* Summary Insights */}
        {/* <div className="mt-8">
          <Card className="border-0 shadow-2xl shadow-blue-500/10 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                Key Insights for {ANALYSIS_SECTIONS.find((s) => s.id === selectedSection)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-200">
                  <div className="text-sm font-semibold text-blue-800 mb-2">Primary Finding</div>
                  <div className="text-sm text-blue-700 leading-relaxed">
                    {selectedSection === "generation" && "Peak generation occurs at 1:00 PM with 4.2% variance above forecast"}
                    {selectedSection === "performance" && "PR shows strong correlation (r=0.92) with irradiance levels"}
                    {selectedSection === "faults" && "Inverter-related faults account for 60% of critical issues"}
                    {selectedSection === "components" && "Inverter INV-005 shows concerning efficiency decline trend"}
                    {selectedSection === "electrical" && "DC voltage stability within ±2% of nominal values"}
                    {selectedSection === "degradation" && "Annual degradation rate of 0.5% is within industry standards"}
                    {selectedSection === "comparative" && "Plant outperforms peer average by 8.7% in revenue per MW"}
                    {selectedSection === "financial" && "Preventive maintenance shows positive ROI in Q2 and Q4"}
                    {selectedSection === "custom" && "Strong correlation patterns identified in custom parameter analysis"}
                  </div>
                </div>
                <div className="p-6 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl border border-amber-200/50 shadow-lg hover:shadow-xl transition-all duration-200">
                  <div className="text-sm font-semibold text-amber-800 mb-2">Action Required</div>
                  <div className="text-sm text-amber-700 leading-relaxed">
                    {selectedSection === "generation" && "Investigate afternoon dip in Block C performance"}
                    {selectedSection === "performance" && "Review PR deviation patterns during low irradiance periods"}
                    {selectedSection === "faults" && "Schedule immediate inspection of recurring inverter faults"}
                    {selectedSection === "components" && "Plan replacement for underperforming inverter units"}
                    {selectedSection === "electrical" && "Monitor voltage fluctuations during peak load periods"}
                    {selectedSection === "degradation" && "Monitor Block B for accelerated degradation trends"}
                    {selectedSection === "comparative" && "Implement best practices from top-performing sites"}
                    {selectedSection === "financial" && "Optimize maintenance scheduling to reduce revenue losses"}
                    {selectedSection === "custom" && "Investigate identified outliers and correlation patterns"}
                  </div>
                </div>
                <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-200">
                  <div className="text-sm font-semibold text-emerald-800 mb-2">Opportunity</div>
                  <div className="text-sm text-emerald-700 leading-relaxed">
                    {selectedSection === "generation" && "Potential 2.3% generation increase through optimal scheduling"}
                    {selectedSection === "performance" && "Advanced tracker algorithms could improve PR by 1.5%"}
                    {selectedSection === "faults" && "Predictive maintenance could reduce faults by 40%"}
                    {selectedSection === "components" && "String optimization could boost overall efficiency"}
                    {selectedSection === "electrical" && "Enhanced monitoring could prevent voltage-related issues"}
                    {selectedSection === "degradation" && "Proactive panel replacement could maintain performance"}
                    {selectedSection === "comparative" && "Knowledge sharing could elevate all sites' performance"}
                    {selectedSection === "financial" && "Strategic maintenance timing could save $15K annually"}
                    {selectedSection === "custom" && "Advanced analytics could improve decision-making by 25%"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div> */}
      </div>
    </div>
  );
}
