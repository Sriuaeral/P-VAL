import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Cable } from "lucide-react";

interface Plant {
  id: string;
  name: string;
  status: string;
}

interface ElectricalAnalysisSectionProps {
  plant: Plant;
}

// Data generators
const generateHourlyGeneration = () => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  return hours.map((hour) => ({
    hour: `${hour}:00`,
    generation: hour >= 6 && hour <= 18
      ? Math.max(0, 100 + 150 * Math.sin(((hour - 6) * Math.PI) / 12) + Math.random() * 20 - 10)
      : Math.random() * 5,
  }));
};

// Parameters for Electrical Domains
const electricalDomainParameters = [
  { value: "dcVoltage", label: "DC Voltage", type: "numeric", unit: "V" },
  { value: "dcCurrent", label: "DC Current", type: "numeric", unit: "A" },
  { value: "dcPower", label: "DC Power", type: "numeric", unit: "kW" },
  { value: "acVoltage", label: "AC Voltage", type: "numeric", unit: "V" },
  { value: "acCurrent", label: "AC Current", type: "numeric", unit: "A" },
  { value: "acPower", label: "AC Power", type: "numeric", unit: "kW" },
  { value: "frequency", label: "Frequency", type: "numeric", unit: "Hz" },
  { value: "powerFactor", label: "Power Factor", type: "numeric", unit: "" },
  { value: "efficiency", label: "Inverter Efficiency", type: "percentage", unit: "%" },
  { value: "stringVoltage", label: "String Voltage", type: "numeric", unit: "V" },
  { value: "stringCurrent", label: "String Current", type: "numeric", unit: "A" },
  { value: "inverterTemp", label: "Inverter Temperature", type: "numeric", unit: "°C" },
];

export function ElectricalAnalysisSection({ plant }: ElectricalAnalysisSectionProps) {
  const [selectedElectricalParam, setSelectedElectricalParam] = useState("dcVoltage");

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200/60 shadow-sm bg-white/95">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center">
              <Cable className="w-4 h-4 text-purple-600" />
            </div>
            Electrical Domains Analysis
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Analyze electrical parameters including DC/AC power, voltage, current, and power factor
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Parameter Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Select Electrical Parameter</label>
              <Select value={selectedElectricalParam} onValueChange={setSelectedElectricalParam}>
                <SelectTrigger className="border border-gray-300 hover:border-purple-400 focus:border-purple-500">
                  <SelectValue placeholder="Select parameter" />
                </SelectTrigger>
                <SelectContent>
                  {electricalDomainParameters.map((param) => (
                    <SelectItem key={param.value} value={param.value}>
                      {param.label} {param.unit && `(${param.unit})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Time Range</label>
              <Select defaultValue="today">
                <SelectTrigger className="border border-gray-300 hover:border-purple-400 focus:border-purple-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Chart Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Chart Type</label>
              <Select defaultValue="line">
                <SelectTrigger className="border border-gray-300 hover:border-purple-400 focus:border-purple-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="area">Area Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Chart Display */}
          <div className="mb-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={generateHourlyGeneration()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="generation"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', strokeWidth: 1, r: 3 }}
                  activeDot={{ r: 4, stroke: '#8b5cf6', strokeWidth: 1 }}
                  name={electricalDomainParameters.find(p => p.value === selectedElectricalParam)?.label || "Parameter"}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
