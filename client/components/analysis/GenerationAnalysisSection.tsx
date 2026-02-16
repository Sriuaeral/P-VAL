import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format } from "date-fns";
import { Calendar, Download, FileImage, RefreshCw, BarChart3, Cable, Power, Zap, Target, Sun } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { getAnalysisData } from "@shared/api";
import type { AnalysisRequest, AnalysisResponse, AnalysisDataPoint, Plant } from "@shared/interface";
import { EnhancedHeatMap } from "@/components/analysis/EnhancedHeatMap";
import { HeatMapGrid } from "@/components/ui/HeatMapGrid";
import StandardChart from "@/components/ui/StandardChart";
import RadarChart from "@/components/ui/RadarChart";
import { useAlert } from "@/hooks/use-alert";
// Removed unused imports for HeatMapNivo
interface GenerationAnalysisSectionProps {
  plant: Plant;
}
export function GenerationAnalysisSection({ plant }: GenerationAnalysisSectionProps) {
  const alert = useAlert();
  const [selectedMainTab, setSelectedMainTab] = useState("dc-string");
  const [selectedSubTab, setSelectedSubTab] = useState("string");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<{from: Date, to: Date}>({from: new Date(), to: new Date()});
  const [dateMode, setDateMode] = useState<'single' | 'range'>('single');
  const [stringParameter, setStringParameter] = useState<'voltage' | 'current' | 'power' | 'energy'>('voltage');
  const [inverterParameter, setInverterParameter] = useState<'voltage' | 'current' | 'power' | 'energy'>('voltage');
  const [analysisData, setAnalysisData] = useState<AnalysisDataPoint[] | null>(null);

  // Removed mock analysis data generator - using real API only

  // Memoized data transformation functions
  const transformAnalysisDataToChart = useCallback((data: AnalysisDataPoint[]) => {
    // Map API data directly to chart format - no aggregation needed
    return data.map(point => {
      const [hourNum, minuteNum] = point.hour.split(':').map(Number);
      return {
        timestamp: point.hour, // Use exact hour from API (e.g., "09:45")
        hour: hourNum,
        minute: minuteNum || 0,
        value: point.value // Use exact value from API - no averaging
      };
    }).sort((a, b) => {
      // Sort by time: first by hour, then by minute
      if (a.hour !== b.hour) {
        return a.hour - b.hour;
      }
      return a.minute - b.minute;
    });
  }, []);


  // Removed unused custom heatmap transformation function

  const mainTabs = [
    {
      id: "dc-string",
      label: "DC String",
      icon: Cable,
      subTabs: [
        { id: "string", label: "String", unit: "" },
        { id: "voltage", label: "Voltage", unit: "V" },
        { id: "current", label: "Current", unit: "A" },
        { id: "power", label: "Power", unit: "W" },
        { id: "energy", label: "Energy", unit: "kWh" },
      ],
    },
    {
      id: "ac-inverter",
      label: "AC Inverter",
      icon: Power,
      subTabs: [
        { id: "inverter", label: "Inverter", unit: "" },
        { id: "voltage", label: "Voltage", unit: "V" },
        { id: "current", label: "Current", unit: "A" },
        { id: "power", label: "Power", unit: "W" },
        { id: "energy", label: "Energy", unit: "kWh" },
      ],
    },
    {
      id: "high-voltage",
      label: "Medium Voltage",
      icon: Zap,
      subTabs: [
        { id: "voltage", label: "Voltage", unit: "V" },
        { id: "current", label: "Current", unit: "A" },
        { id: "power", label: "Power", unit: "W" },
        { id: "temperature", label: "Temperature", unit: "°C" },
      ],
    },
    {
      id: "poc",
      label: "POC",
      icon: Target,
      subTabs: [
        { id: "voltage", label: "Voltage", unit: "V" },
        { id: "power", label: "Power", unit: "W" },
        { id: "frequency", label: "Frequency", unit: "Hz" },
        { id: "energy-meter", label: "Energy Meter", unit: "kWh" },
        { id: "power-factor", label: "Power Factor", unit: "" },
        { id: "reactive-power", label: "Reactive Power", unit: "VAR" },
        { id: "var-compensation", label: "VAR Compensation", unit: "VAR" },
      ],
    },
    {
      id: "weather",
      label: "Weather Domains",
      icon: Sun,
      subTabs: [
        { id: "irradianceGHI", label: "Irradiance GHI", unit: "W/m²" },
        { id: "irradianceDNI", label: "Irradiance DNI", unit: "W/m²" },
        { id: "temperature", label: "Temperature", unit: "°C" },
        { id: "wind", label: "Wind", unit: "m/s" }, /// wind speed with radar chart
        { id: "humidity", label: "Humidity", unit: "%" },
        { id: "ambient-temp", label: "Ambient Temp", unit: "°C" },
        { id: "module-temp", label: "Module Temp", unit: "°C" },/// cell temp
      ],
    },
  ];

  const currentMainTab = mainTabs.find((tab) => tab.id === selectedMainTab);
  const currentSubTab = currentMainTab?.subTabs.find((tab) => tab.id === selectedSubTab);

  const handleMainTabChange = (tabId: string) => {
    setSelectedMainTab(tabId);
    const newMainTab = mainTabs.find((tab) => tab.id === tabId);
    if (newMainTab && newMainTab.subTabs.length > 0) {
      setSelectedSubTab(newMainTab.subTabs[0].id);
    }
  };

  const handleSubTabChange = (subTabId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setSelectedSubTab(subTabId);
      setIsLoading(false);
    }, 300);
  };

  // Analysis API integration
  // const fetchAnalysisData = async () => {
  //   setIsLoading(true);
  //   try {
  //     const request: AnalysisRequest = {
  //       plantId: plant.id || '',
  //       // Keep original behavior: analysisType is selected sub-tab, except for weather
  //       analysisType: selectedMainTab === 'weather' ? 'weather' : selectedMainTab,
  //       parameters: {
  //         // Original date shape and format
  //         startDate: dateMode === 'single' ? format(selectedDate, 'yyyy-MM-dd') : format(dateRange.from, 'yyyy-MM-dd'),
  //         isSingleDate: dateMode === 'single',
  //         endDate: dateMode === 'range' ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
  //         // Original param field usage
  //         stringParam:
  //           selectedMainTab === 'weather' ? selectedSubTab :
  //           (selectedMainTab === 'dc-string' && selectedSubTab === 'string') ? stringParameter :
  //           (selectedMainTab === 'ac-inverter' && selectedSubTab === 'inverter') ? inverterParameter :
  //           undefined,
  //       },
  //     };
  //     const response = await getAnalysisData(request);
  //     console.log('API Response:', response);
  //     if (response && (response as any).success && (response as any).results) {
  //       const results = (response as any).results as AnalysisDataPoint[];
  //       console.log('Setting analysis data:', results);
  //       setAnalysisData(results);
  //     } else if ((response as any)?.data?.data) {
  //       // Fallback mapping if API returns data in { data: { data: [] } } shape
  //       const raw = (response as any).data.data;
  //       setAnalysisData(raw as AnalysisDataPoint[]);
  //     } else {
  //       console.error('Analysis API returned no results');
  //       setAnalysisData([]);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching analysis data:", error);
  //     setAnalysisData([]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };


  const fetchAnalysisData = async () => {
    setIsLoading(true);
    try {
      const request: AnalysisRequest = {
        plantId: plant.id.toString(),
        domain: selectedMainTab,
        param: selectedSubTab,
        startDate: dateMode === 'single' ? format(selectedDate, 'yyyy-MM-dd') : format(dateRange.from, 'yyyy-MM-dd'),
        isSingleDate: dateMode === 'single',
        stringParam: (selectedMainTab === 'dc-string' && selectedSubTab === 'string') ? stringParameter : 
                    (selectedMainTab === 'ac-inverter' && selectedSubTab === 'inverter') ? inverterParameter : undefined,
        endDate: dateMode === 'range' ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
      };
      const response = await getAnalysisData(request);
      setAnalysisData(response.data);
    } catch (error) {
      console.error("Error fetching analysis data:", error);
      setAnalysisData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch analysis data when parameters change (with debouncing) - ADDED
  useEffect(() => {
    if (plant.id) {
      const timeoutId = setTimeout(() => {
        fetchAnalysisData();
      }, 500); // Debounce API calls by 500ms
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedMainTab, selectedSubTab, selectedDate, dateRange, dateMode, stringParameter, inverterParameter]);

  // Handle refresh button click - ADDED
  const handleRefresh = () => {
    if (plant.id) {
      fetchAnalysisData();
    }
  };

  // Export functions - ADDED
  const exportToCSV = () => {
    if (!analysisData || analysisData.length === 0) {
      alert.validationError('No data available to export');
      return;
    }

    const headers = ['Inverter ID', 'Inverter Name', 'Time', 'Value', 'Parameter'];
    const csvContent = [
      headers.join(','),
      ...analysisData.map(point => [
        point.inverterId,
        point.inverterName || '',
        point.hour,
        point.value,
        selectedSubTab
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedMainTab}-${selectedSubTab}-${format(selectedDate, 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPNG = () => {
    // const graphElement = document.querySelector('[data-graph-container]');
    // if (!graphElement) {
    //   alert('Graph element not found');
    //   return;
    // }

    // // Use native browser API to capture the graph
    // try {
    //   // Create a canvas element
    //   const canvas = document.createElement('canvas');
    //   const ctx = canvas.getContext('2d');
    //   if (!ctx) {
    //     alert('Canvas context not available');
    //     return;
    //   }

    //   // Set canvas size to match the graph element
    //   const rect = graphElement.getBoundingClientRect();
    //   canvas.width = rect.width * 2; // Higher resolution
    //   canvas.height = rect.height * 2;
    //   ctx.scale(2, 2);

    //   // Fill with white background
    //   ctx.fillStyle = '#ffffff';
    //   ctx.fillRect(0, 0, rect.width, rect.height);

    //   // Draw the graph content (simplified approach)
    //   ctx.fillStyle = '#000000';
    //   ctx.font = '12px Arial';
    //   ctx.fillText(`${selectedMainTab} - ${selectedSubTab}`, 10, 20);
    //   ctx.fillText(`Date: ${format(selectedDate, 'yyyy-MM-dd')}`, 10, 40);
    //   ctx.fillText('Graph export - Use CSV for detailed data', 10, 60);

    //   // Download the canvas as PNG
    //   const link = document.createElement('a');
    //   link.download = `${selectedMainTab}-${selectedSubTab}-${format(selectedDate, 'yyyy-MM-dd')}.png`;
    //   link.href = canvas.toDataURL('image/png');
    //   link.click();
    // } catch (err) {
    //   console.error('Error generating PNG:', err);
    //   alert('Error generating PNG. Please try CSV export instead.');
    // }

    alert.featureUnderConstruction('PNG export');
  };

  // Memoized chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => {
    if (!analysisData) return [];
    return transformAnalysisDataToChart(analysisData);
  }, [analysisData, transformAnalysisDataToChart]);
  
  // Memoized validated chart data
  const validatedChartData = useMemo(() => {
    return chartData.map(item => ({
      timestamp: item.timestamp || '00:00',
      hour: item.hour || 0,
      minute: item.minute || 0,
      value: typeof item.value === 'number' ? item.value : 0
    }));
  }, [chartData]);
  
  const hasData = useMemo(() => {
    return validatedChartData.length > 0 && validatedChartData.some((d) => d.value > 0);
  }, [validatedChartData]);
  
  // Debug logging for production troubleshooting
  if (analysisData && chartData.length > 0) {
    // Validate chart data structure
    const invalidData = chartData.filter(d => !d.timestamp || typeof d.value !== 'number');
    if (invalidData.length > 0) {
      console.warn('Invalid chart data detected:', invalidData);
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header - Fixed Height */}
      {/* <div className="flex items-center justify-between h-16 px-4 border-b bg-background flex-shrink-0">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Generation Analysis</h2>
          <p className="text-xs text-muted-foreground">
            Interactive electrical domain analysis with real-time parameter monitoring
          </p>
        </div>
      </div> */}

      {/* Main Layout Container - Fixed Height */}
      <div className="flex-1 grid grid-cols-12 gap-0 p-0 overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
        {/* Analysis Domains Accordion */}
        <div className="col-span-12 lg:col-span-3 xl:col-span-2">
          <Card className="h-full">
            <CardContent className="p-4">
              <Accordion type="multiple" defaultValue={["electrical"]} className="w-full">
                {/* Electrical Domains */}
                <AccordionItem value="electrical" className="border-b">
                  <AccordionTrigger className="text-xs font-medium text-muted-foreground uppercase tracking-wide hover:no-underline py-2">
                    Electrical Domains
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="space-y-1">
                      {mainTabs.slice(0, 4).map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => handleMainTabChange(tab.id)}
                            className={`w-full p-2 rounded-lg text-left transition-all duration-200 flex items-center gap-2 ${
                              selectedMainTab === tab.id
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "hover:bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <Icon className="w-3 h-3 flex-shrink-0" />
                            <span className="text-xs font-medium">{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Weather Domains */}
                <AccordionItem value="weather" className="border-b-0">
                  <AccordionTrigger className="text-xs font-medium text-muted-foreground uppercase tracking-wide hover:no-underline py-2">
                    Weather Domains
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="space-y-1">
                      {(() => {
                        const weatherTab = mainTabs.find((t) => t.id === "weather");
                        const Icon = weatherTab?.icon || Sun;
                        return weatherTab?.subTabs.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => {
                              if (selectedMainTab !== "weather") handleMainTabChange("weather");
                              handleSubTabChange(sub.id);
                            }}
                            className={`w-full p-2 rounded-lg text-left transition-all duration-200 flex items-center gap-2 ${
                              selectedMainTab === "weather" && selectedSubTab === sub.id
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "hover:bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <Icon className="w-3 h-3 flex-shrink-0" />
                            <span className="text-xs font-medium">{sub.label}</span>
                          </button>
                        ));
                      })()}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Central Graph Display Area - Fixed Layout */}
        <div className="col-span-12 lg:col-span-9 xl:col-span-10 flex flex-col h-full overflow-hidden">
          {/* Date Selection and Controls - Fixed Height */}
          <Card className="h-16 mb-2">
            <CardContent className="p-3 h-full flex items-center">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Date Mode:</span>
                    <Select value={dateMode} onValueChange={(value: 'single' | 'range') => setDateMode(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single Date</SelectItem>
                        <SelectItem value="range">Date Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                {dateMode === 'single' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Date:</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <Calendar className="w-4 h-4" />
                          {format(selectedDate, "PPP")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <div className="p-3">
                          <input
                            type="date"
                            value={format(selectedDate, "yyyy-MM-dd")}
                            onChange={(e) => setSelectedDate(new Date(e.target.value))}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">From:</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Calendar className="w-4 h-4 mr-1" />
                          {format(dateRange.from, "MMM dd")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <div className="p-3">
                          <input
                            type="date"
                            value={format(dateRange.from, "yyyy-MM-dd")}
                            onChange={(e) => setDateRange({...dateRange, from: new Date(e.target.value)})}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <span className="text-sm font-medium">To:</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Calendar className="w-4 h-4 mr-1" />
                          {format(dateRange.to, "MMM dd")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <div className="p-3">
                          <input
                            type="date"
                            value={format(dateRange.to, "yyyy-MM-dd")}
                            onChange={(e) => setDateRange({...dateRange, to: new Date(e.target.value)})}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {/* String Parameter Selection */}
                {selectedMainTab === 'dc-string' && selectedSubTab === 'string' && (
                  <div className="flex items-center gap-2 ml-6 border-l pl-6">
                    <span className="text-sm font-medium">String Parameter:</span>
                    <Select value={stringParameter} onValueChange={(value: 'voltage' | 'current' | 'power' | 'energy') => setStringParameter(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="voltage">Voltage (V)</SelectItem>
                        <SelectItem value="current">Current (A)</SelectItem>
                        <SelectItem value="power">Power (W)</SelectItem>
                        <SelectItem value="energy">Energy (kWh)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Inverter Parameter Selection */}
                {selectedMainTab === 'ac-inverter' && selectedSubTab === 'inverter' && (
                  <div className="flex items-center gap-2 ml-6 border-l pl-6">
                    <span className="text-sm font-medium">Inverter Parameter:</span>
                    <Select value={inverterParameter} onValueChange={(value: 'voltage' | 'current' | 'power' | 'energy') => setInverterParameter(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="voltage">Voltage (V)</SelectItem>
                        <SelectItem value="current">Current (A)</SelectItem>
                        <SelectItem value="power">Power (W)</SelectItem>
                        <SelectItem value="energy">Energy (kWh)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? 'Loading...' : 'Refresh'}
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={exportToCSV}>
                    <Download className="w-3 h-3" />
                    CSV
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={exportToPNG}>
                    <FileImage className="w-3 h-3" />
                    PNG
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
{/* Horizontal Sub-Tabs - Fixed Height (hidden for Weather domain) */}
{selectedMainTab !== 'weather' && (
            <Card className="h-10 mt-2">
              <CardContent className="p-2 h-full flex items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground mr-2">Parameters:</span>
                  <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                    {currentMainTab?.subTabs.map((subTab) => (
                      <button
                        key={subTab.id}
                        onClick={() => handleSubTabChange(subTab.id)}
                        disabled={isLoading}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                          selectedSubTab === subTab.id
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {subTab.label}
                        {subTab.unit && <span className="ml-1 opacity-75">({subTab.unit})</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Graph Card - Fixed Height */}
          <Card className="flex-1 overflow-hidden" style={{ height: 'calc(100vh - 160px)' }}>
            <CardContent className="h-full p-3 overflow-hidden">
              <div className="h-full overflow-hidden" data-graph-container>
                {/* Data Source Indicator - ADDED */}
                {/* Loading Indicator for Analysis Data - ADDED */}
                {isLoading && (
                  <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700 text-sm">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Fetching analysis data...</span>
                    </div>
                  </div>
                )}
                
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span className="text-sm">Loading graph data...</span>
                    </div>
                  </div>
                ) : selectedMainTab === 'dc-string' && selectedSubTab === 'string' ? (
                  
                  // DC String Heat Map Visualization
                  <EnhancedHeatMap
                    data={analysisData || []}
                    type="string"
                    parameter={stringParameter}
                    title="String"
                    idPrefix="str"
                    gridRows={24}
                  />
                ) : selectedMainTab === 'ac-inverter' && selectedSubTab === 'inverter' ? (
                  // AC Inverter Heat Map Visualization
                  <EnhancedHeatMap
                    data={analysisData || []}
                    type="inverter"
                    parameter={inverterParameter}
                    title="Inverter"
                    idPrefix="INV-"
                    gridRows={20}
                  />
                ) : selectedMainTab === 'weather' ? (
                  // Weather Domains Visualization
                  <div className="h-full flex flex-col" style={{ height: 'calc(80vh - 180px)' }}>
                    {selectedSubTab === 'wind' ? (
                      // Wind Radar Chart
                      <RadarChart
                        data={validatedChartData}
                        dataKey="value"
                        title={`Wind Speed Analysis`}
                        subtitle={`Wind speed distribution across compass directions with radar visualization`}
                        unit="m/s"
                        color="#10B981"
                        height="100%"
                        showLegend={false}
                        showGrid={true}
                        maxValue={20}
                        className="h-full"
                      />
                    ) : (
                      // Other Weather Parameters
                      <StandardChart
                        data={validatedChartData}
                        type="area"
                        dataKey="value"
                        xAxisKey="timestamp"
                        title={`${currentSubTab?.label || 'Weather Data'} Analysis`}
                        subtitle={`${currentSubTab?.label ? `${currentSubTab.label} monitoring` : 'Weather parameter monitoring'} with 24-hour trend visualization`}
                        unit={currentSubTab?.unit || ''}
                        color="#3B82F6"
                        height="100%"
                        showLegend={false}
                        showGrid={true}
                        strokeWidth={2}
                        fillOpacity={0.6}
                        className="h-full"
                      />
                    )}
                  </div>
                ) : hasData ? (
                  <div className="h-full flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
                    <StandardChart
                      data={validatedChartData}
                      type="line"
                      dataKey="value"
                      xAxisKey="timestamp"
                      title={`${currentMainTab?.label} - ${currentSubTab?.label} Analysis`}
                      subtitle={`${currentSubTab?.label ? `${currentSubTab.label} monitoring` : 'Parameter monitoring'} with 24-hour trend visualization`}
                      unit={currentSubTab?.unit || ''}
                      color="#F5C842"
                      height="100%"
                      showLegend={false}
                      showGrid={true}
                      strokeWidth={2}
                      className="h-full"
                    />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/30">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium text-muted-foreground mb-1">No data available</h3>
                      <p className="text-sm text-muted-foreground/70">
                        No operational data found for the selected parameter
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          
        </div>
      </div>
    </div>
  );
}
