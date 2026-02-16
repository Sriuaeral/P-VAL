import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface Plant {
  id: string;
  name: string;
  status: string;
}

interface ComparativeAnalysisSectionProps {
  plant: Plant;
}

// Data generators
const generateSiteComparison = () => [
  { site: "Rajasthan A", revenueMW: 2.4, downtimeHours: 45, faultRate: 0.8 },
  { site: "Gujarat B", revenueMW: 2.7, downtimeHours: 32, faultRate: 0.6 },
  { site: "Tamil Nadu C", revenueMW: 2.1, downtimeHours: 67, faultRate: 1.2 },
  { site: "Karnataka D", revenueMW: 2.5, downtimeHours: 38, faultRate: 0.7 },
  { site: "Peer Average", revenueMW: 2.3, downtimeHours: 50, faultRate: 0.9 },
];

export function ComparativeAnalysisSection({ plant }: ComparativeAnalysisSectionProps) {
  return (
    <div className="space-y-6">
      <Card className="border border-gray-200/60 shadow-sm bg-white/95">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            Multi-Site Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="mb-4">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={generateSiteComparison()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="site" tick={{ fontSize: 12, fill: '#64748b' }} />
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
                  dataKey="revenueMW"
                  fill="#F5C842"
                  name="Revenue per MW"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="downtimeHours"
                  fill="#EF4444"
                  name="Downtime Hours"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
