import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface Plant {
  id: string;
  name: string;
  status: string;
}

interface FaultAnalysisSectionProps {
  plant: Plant;
}

// Data generators
const generateFaultTrend = () => [
  { month: "Jan", critical: 2, high: 5, medium: 8, low: 12 },
  { month: "Feb", critical: 1, high: 3, medium: 6, low: 9 },
  { month: "Mar", critical: 3, high: 7, medium: 10, low: 15 },
  { month: "Apr", critical: 1, high: 4, medium: 7, low: 11 },
  { month: "May", critical: 2, high: 6, medium: 9, low: 13 },
  { month: "Jun", critical: 4, high: 8, medium: 12, low: 16 },
];

const generateDowntimeBreakdown = () => [
  { component: "Inverters", hours: 45, energyLoss: 120 },
  { component: "Trackers", hours: 32, energyLoss: 85 },
  { component: "Grid Connection", hours: 28, energyLoss: 180 },
  { component: "Weather Station", hours: 15, energyLoss: 25 },
  { component: "Cleaning System", hours: 12, energyLoss: 40 },
  { component: "Security System", hours: 8, energyLoss: 15 },
];

const generateTopFaults = () => [
  { fault: "Inverter 5 Efficiency Drop", count: 15, impact: "High" },
  { fault: "String 12 Underperformance", count: 12, impact: "Medium" },
  { fault: "Tracker Position Error", count: 10, impact: "High" },
  { fault: "Grid Voltage Fluctuation", count: 8, impact: "Critical" },
  { fault: "Weather Sensor Calibration", count: 7, impact: "Low" },
  { fault: "Communication Timeout", count: 6, impact: "Medium" },
  { fault: "DC Isolation Fault", count: 5, impact: "Critical" },
  { fault: "Cleaning Schedule Overdue", count: 4, impact: "Low" },
  { fault: "Temperature Sensor Error", count: 3, impact: "Medium" },
  { fault: "Security Perimeter Alert", count: 2, impact: "Low" },
];

export function FaultAnalysisSection({ plant }: FaultAnalysisSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fault Trend */}
        <Card className="border border-gray-200/60 shadow-sm bg-white/95">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <div className="w-5 h-5 bg-red-100 rounded-md flex items-center justify-center">
                <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              Fault Occurrence Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="mb-4">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={generateFaultTrend()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                    }}
                  />
                  {/* <Legend /> */}
                  <Line
                    type="monotone"
                    dataKey="critical"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', strokeWidth: 1, r: 3 }}
                    activeDot={{ r: 4, stroke: '#ef4444', strokeWidth: 1 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="high"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', strokeWidth: 1, r: 3 }}
                    activeDot={{ r: 4, stroke: '#f59e0b', strokeWidth: 1 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="medium"
                    stroke="#6b7280"
                    strokeWidth={2}
                    dot={{ fill: '#6b7280', strokeWidth: 1, r: 3 }}
                    activeDot={{ r: 4, stroke: '#6b7280', strokeWidth: 1 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="low"
                    stroke="#9ca3af"
                    strokeWidth={2}
                    dot={{ fill: '#9ca3af', strokeWidth: 1, r: 3 }}
                    activeDot={{ r: 4, stroke: '#9ca3af', strokeWidth: 1 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Downtime Breakdown */}
        <Card className="border border-gray-200/60 shadow-sm bg-white/95">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <div className="w-5 h-5 bg-orange-100 rounded-md flex items-center justify-center">
                <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Downtime Hours by Component
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="mb-4">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={generateDowntimeBreakdown()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="component" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                    }}
                  />
                  <Bar
                    dataKey="hours"
                    fill="#f59e0b"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Faults Table */}
      <Card className="border border-gray-200/60 shadow-sm bg-white/95">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <div className="w-5 h-5 bg-red-100 rounded-md flex items-center justify-center">
              <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            Top Faults by Frequency
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="space-y-3">
            {generateTopFaults().map((fault, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50/80 rounded-lg border border-gray-200/60 hover:bg-gray-100/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-200 rounded-md flex items-center justify-center text-gray-700 text-xs font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{fault.fault}</div>
                    <div className="text-xs text-gray-600">Occurrences: {fault.count}</div>
                  </div>
                </div>
                <Badge
                  variant={
                    fault.impact === "Critical"
                      ? "destructive"
                      : fault.impact === "High"
                      ? "default"
                      : fault.impact === "Medium"
                      ? "secondary"
                      : "outline"
                  }
                  className="px-2 py-1 text-xs font-medium"
                >
                  {fault.impact}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
