import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Settings, RefreshCw, FileImage, Download } from "lucide-react";
import { getAnalysisData } from "@shared/api";
import type { AnalysisRequest } from "@shared/interface";
import StandardChart from "@/components/ui/StandardChart";
import type { CustomAnalysisDataContract } from "@/types/custom-analysis-contract";

interface Plant {
  id: string;
  name: string;
  status: string;
}

interface CustomAnalysisSectionProps {
  plant: Plant;
}

// Parameters for Custom Comparative Analysis
const analysisParameters = [
  { value: "date", label: "Date / Time", type: "time", unit: "" },
  { value: "powerOutput", label: "Power Output", type: "numeric", unit: "kW" },
  { value: "energyGenerated", label: "Energy Generated", type: "numeric", unit: "kWh" },
  { value: "performanceRatio", label: "Performance Ratio", type: "percentage", unit: "%" },
  { value: "inverterTemp", label: "Inverter Temperature", type: "numeric", unit: "°C" },
  { value: "stringVoltage", label: "String Voltage", type: "numeric", unit: "V" },
  { value: "irradiance", label: "Irradiance", type: "numeric", unit: "W/m²" },
  { value: "soilingIndex", label: "Panel Soiling Index", type: "percentage", unit: "%" },
  { value: "energyRevenue", label: "Energy Revenue", type: "currency", unit: "USD" },
  { value: "downtime", label: "Downtime", type: "numeric", unit: "Hours" },
  { value: "faultCount", label: "Fault Count", type: "numeric", unit: "Count" },
  { value: "omCost", label: "O&M Cost", type: "currency", unit: "USD" },
];

export function CustomAnalysisSection({ plant }: CustomAnalysisSectionProps) {
  const [xParameter, setXParameter] = useState("date");
  const [yParameter, setYParameter] = useState("powerOutput");
  const [chartType, setChartType] = useState("line");
  const [customData, setCustomData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch custom analysis data from API
  const fetchCustomData = async () => {
    setLoading(true);
    try {
      const request: AnalysisRequest = {
        plantId: plant.id,
        domain: "custom",
        param: `${xParameter}-${yParameter}`,
        startDate: new Date().toISOString().split('T')[0],
        isSingleDate: true
      };
      
      const response: any = await getAnalysisData(request);

      // If API returns the new comprehensive contract
      if (response && Array.isArray(response.dataPoints)) {
        const contract = response as CustomAnalysisDataContract;

        // Normalize chart type casing from API (e.g., "Line" -> "line")
        if (contract.analysisConfig?.chartType) {
          const normalized = String(contract.analysisConfig.chartType).toLowerCase();
          if (["line", "area", "scatter", "bar"].includes(normalized)) {
            setChartType(normalized);
          }
        }

        // Sync selected axes with API contract if provided
        if (contract.analysisConfig?.xParameter) {
          setXParameter(contract.analysisConfig.xParameter);
        }
        if (contract.analysisConfig?.yParameter) {
          setYParameter(contract.analysisConfig.yParameter);
        }

        // Map contract data points to chart-friendly records keyed by selected params
        const mapped = contract.dataPoints.map((p) => ({
          // Common time fields
          date: p.date ?? p.timestamp ?? "",
          hour: p.hour ?? "",
          // Numeric metrics (ensure keys exist for dynamic access in charts)
          powerOutput: p.powerOutput ?? 0,
          energyGenerated: p.energyGenerated ?? 0,
          performanceRatio: p.performanceRatio ?? 0,
          inverterTemp: p.inverterTemp ?? 0,
          stringVoltage: p.stringVoltage ?? 0,
          irradiance: p.irradiance ?? 0,
          soilingIndex: p.soilingIndex ?? 0,
          energyRevenue: p.energyRevenue ?? 0,
          downtime: p.downtime ?? 0,
          faultCount: p.faultCount ?? 0,
          omCost: p.omCost ?? 0,
        }));

        setCustomData(mapped);
      } else if (response?.data) {
        // Legacy path (simple array with { hour, value, ... })
        // Create chart-friendly objects that expose dynamic keys for the current selection
        const legacyArray: any[] = Array.isArray(response.data) ? response.data : [];
        const mappedLegacy = legacyArray.map((p, idx) => {
          // Resolve X value
          let xValue: any = p[xParameter];
          if (xValue === undefined) {
            if (xParameter === 'date' || xParameter === 'hour') {
              xValue = p.hour ?? '';
            } else {
              // If the legacy payload doesn't contain the requested x metric, fall back to hour or index
              xValue = p.hour ?? idx;
            }
          }

          // Resolve Y value
          let yValue: any = p[yParameter];
          if (yValue === undefined) {
            // Legacy payload exposes the single metric as `value`
            yValue = p.value ?? 0;
          }

          return {
            date: p.hour ?? '',
            hour: p.hour ?? '',
            // Provide all known numeric fields if present to enable switching without refetch
            powerOutput: p.powerOutput ?? p.value ?? 0,
            energyGenerated: p.energyGenerated ?? 0,
            performanceRatio: p.performanceRatio ?? 0,
            inverterTemp: p.inverterTemp ?? 0,
            stringVoltage: p.stringVoltage ?? 0,
            irradiance: p.irradiance ?? 0,
            soilingIndex: p.soilingIndex ?? 0,
            energyRevenue: p.energyRevenue ?? 0,
            downtime: p.downtime ?? 0,
            faultCount: p.faultCount ?? 0,
            omCost: p.omCost ?? 0,
            // Dynamic axes for the chart
            [xParameter]: xValue,
            [yParameter]: yValue,
          };
        });

        setCustomData(mappedLegacy);
      }
    } catch (error) {
      console.error('Failed to fetch custom analysis data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (xParameter && yParameter) {
      fetchCustomData();
    }
  }, [xParameter, yParameter, plant.id]);

  const handleRefresh = () => {
    fetchCustomData();
  };

  const handleExport = () => {
    // Export functionality
    console.log('Exporting custom analysis data...');
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!customData.length) {
      return (
        <div className="h-80 flex items-center justify-center text-muted-foreground">
          No data available for selected parameters
        </div>
      );
    }

    const xParam = analysisParameters.find(p => p.value === xParameter);
    const yParam = analysisParameters.find(p => p.value === yParameter);

    switch (chartType) {
      case "line":
        return (
          <StandardChart
            data={customData}
            type="line"
            dataKey={yParameter}
            xAxisKey={xParameter}
            title={`${yParam?.label} vs ${xParam?.label}`}
            subtitle={`Custom analysis: ${yParam?.label} over ${xParam?.label}`}
            unit={yParam?.unit || ''}
            color="#3b82f6"
            height={300}
            showLegend={false}
            showGrid={true}
            strokeWidth={2}
          />
        );
      case "area":
        return (
          <StandardChart
            data={customData}
            type="area"
            dataKey={yParameter}
            xAxisKey={xParameter}
            title={`${yParam?.label} vs ${xParam?.label}`}
            subtitle={`Custom analysis: ${yParam?.label} over ${xParam?.label}`}
            unit={yParam?.unit || ''}
            color="#3b82f6"
            height={300}
            showLegend={false}
            showGrid={true}
            strokeWidth={2}
            fillOpacity={0.3}
          />
        );
      case "scatter":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={customData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xParameter} />
              <YAxis dataKey={yParameter} />
              <Tooltip />
              <Scatter dataKey={yParameter} fill="#10b981" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={customData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xParameter=='date'?'hour':xParameter} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={yParameter} fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Custom Analysis Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">X-Axis Parameter</label>
              <Select value={xParameter} onValueChange={setXParameter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {analysisParameters.map((param) => (
                    <SelectItem key={param.value} value={param.value}>
                      {param.label} {param.unit && `(${param.unit})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Y-Axis Parameter</label>
              <Select value={yParameter} onValueChange={setYParameter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {analysisParameters.map((param) => (
                    <SelectItem key={param.value} value={param.value}>
                      {param.label} {param.unit && `(${param.unit})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Chart Type</label>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="scatter">Scatter Plot</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            {xParameter && yParameter ? (
              <>
                {analysisParameters.find(p => p.value === xParameter)?.label} vs{' '}
                {analysisParameters.find(p => p.value === yParameter)?.label}
              </>
            ) : (
              'Custom Analysis Chart'
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>
    </div>
  );
}
