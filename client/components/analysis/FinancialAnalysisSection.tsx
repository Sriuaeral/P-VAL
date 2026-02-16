import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface Plant {
  id: string;
  name: string;
  status: string;
}

interface FinancialAnalysisSectionProps {
  plant: Plant;
}

// Data generators
const generateFinancialLoss = () => [
  { month: "Jan", revenueLoss: 12500, maintenanceCost: 8000, netImpact: -4500 },
  { month: "Feb", revenueLoss: 8900, maintenanceCost: 12000, netImpact: 3100 },
  { month: "Mar", revenueLoss: 15200, maintenanceCost: 9500, netImpact: -5700 },
  { month: "Apr", revenueLoss: 7800, maintenanceCost: 11000, netImpact: 3200 },
  { month: "May", revenueLoss: 11200, maintenanceCost: 7800, netImpact: -3400 },
  { month: "Jun", revenueLoss: 18500, maintenanceCost: 13500, netImpact: -5000 },
];

export function FinancialAnalysisSection({ plant }: FinancialAnalysisSectionProps) {
  return (
    <div className="space-y-6">
      <Card className="border border-gray-200/60 shadow-sm bg-white/95">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-100 rounded-md flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            Revenue Loss vs Maintenance Cost Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="mb-4">
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={generateFinancialLoss()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
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
                <Bar
                  dataKey="revenueLoss"
                  fill="#ef4444"
                  name="Revenue Loss ($)"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="maintenanceCost"
                  fill="#f59e0b"
                  name="Maintenance Cost ($)"
                  radius={[2, 2, 0, 0]}
                />
                <Line
                  type="monotone"
                  dataKey="netImpact"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 1, r: 3 }}
                  activeDot={{ r: 4, stroke: '#10b981', strokeWidth: 1 }}
                  name="Net Impact ($)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
