import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface Plant {
  id: string;
  name: string;
  status: string;
}

interface PerformanceAnalysisSectionProps {
  plant: Plant;
}

// Data generators
const generatePRTrend = () => [
  { date: "2024-01-01", daily: 85.2, weekly: 84.8, monthly: 85.1 },
  { date: "2024-01-02", daily: 86.1, weekly: 85.0, monthly: 85.1 },
  { date: "2024-01-03", daily: 84.9, weekly: 85.1, monthly: 85.1 },
  { date: "2024-01-04", daily: 87.3, weekly: 85.4, monthly: 85.2 },
  { date: "2024-01-05", daily: 85.8, weekly: 85.6, monthly: 85.3 },
  { date: "2024-01-06", daily: 86.4, weekly: 85.7, monthly: 85.4 },
  { date: "2024-01-07", daily: 85.1, weekly: 85.8, monthly: 85.5 },
];

const generatePRVsIrradiance = () =>
  Array.from({ length: 50 }, () => ({
    irradiance: 400 + Math.random() * 600,
    pr: 75 + Math.random() * 20,
    temperature: 15 + Math.random() * 25,
  }));

export function PerformanceAnalysisSection({ plant }: PerformanceAnalysisSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PR Trend */}
        <Card className="border border-gray-200/60 shadow-sm bg-white/95">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-100 rounded-md flex items-center justify-center">
                <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              Performance Ratio Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="mb-4">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={generatePRTrend()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[80, 90]} tick={{ fontSize: 11, fill: '#64748b' }} />
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
                    dataKey="daily"
                    stroke="#fbbf24"
                    strokeWidth={2}
                    dot={{ fill: '#fbbf24', strokeWidth: 1, r: 3 }}
                    activeDot={{ r: 4, stroke: '#fbbf24', strokeWidth: 1 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weekly"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 1, r: 3 }}
                    activeDot={{ r: 4, stroke: '#10b981', strokeWidth: 1 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="monthly"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 1, r: 3 }}
                    activeDot={{ r: 4, stroke: '#3b82f6', strokeWidth: 1 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* PR vs Irradiance Scatter */}
        <Card className="border border-gray-200/60 shadow-sm bg-white/95">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <div className="w-5 h-5 bg-green-100 rounded-md flex items-center justify-center">
                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              PR vs Irradiance Correlation
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="mb-4">
              <ResponsiveContainer width="100%" height={180}>
                <ScatterChart data={generatePRVsIrradiance()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="irradiance"
                    name="Irradiance"
                    unit="W/m²"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis
                    dataKey="pr"
                    name="PR"
                    unit="%"
                    domain={[70, 100]}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                    }}
                  />
                  <Scatter 
                    dataKey="pr" 
                    fill="#fbbf24"
                    stroke="#d97706"
                    strokeWidth={1}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
