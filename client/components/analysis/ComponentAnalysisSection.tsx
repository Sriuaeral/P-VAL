import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface Plant {
  id: string;
  name: string;
  status: string;
}

interface ComponentAnalysisSectionProps {
  plant: Plant;
}

// Data generators
const generateInverterEfficiency = () => [
  { inverter: "INV-001", efficiency: 97.8, trend: "stable" },
  { inverter: "INV-002", efficiency: 96.5, trend: "declining" },
  { inverter: "INV-003", efficiency: 98.1, trend: "improving" },
  { inverter: "INV-004", efficiency: 95.2, trend: "declining" },
  { inverter: "INV-005", efficiency: 94.8, trend: "critical" },
  { inverter: "INV-006", efficiency: 97.9, trend: "stable" },
];

const generateStringPerformance = () =>
  Array.from({ length: 20 }, (_, i) => ({
    string: `STR-${(i + 1).toString().padStart(3, "0")}`,
    performance: 85 + Math.random() * 15,
    current: 8 + Math.random() * 4,
    voltage: 600 + Math.random() * 100,
  }));

export function ComponentAnalysisSection({ plant }: ComponentAnalysisSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inverter Efficiency */}
        <Card className="border border-gray-200/60 shadow-sm bg-white/95">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <div className="w-5 h-5 bg-yellow-100 rounded-md flex items-center justify-center">
                <svg className="w-3 h-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              Inverter Efficiency Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="mb-4">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={generateInverterEfficiency()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="inverter" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[90, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                    }}
                  />
                  <Bar 
                    dataKey="efficiency" 
                    fill="#fbbf24"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* String Performance Scatter */}
        <Card className="border border-gray-200/60 shadow-sm bg-white/95">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <div className="w-5 h-5 bg-green-100 rounded-md flex items-center justify-center">
                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              String-Level Performance Ranking
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="mb-4">
              <ResponsiveContainer width="100%" height={180}>
                <ScatterChart data={generateStringPerformance()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="current" name="Current" unit="A" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis
                    dataKey="performance"
                    name="Performance"
                    unit="%"
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
                    dataKey="performance" 
                    fill="#10b981"
                    stroke="#059669"
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
