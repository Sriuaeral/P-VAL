import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { getAnalysisData } from "@shared/api";
import type { AnalysisRequest } from "@shared/interface";

interface Plant {
  id: string;
  name: string;
  status: string;
}

interface DegradationAnalysisSectionProps {
  plant: Plant;
}

export function DegradationAnalysisSection({ plant }: DegradationAnalysisSectionProps) {
  const [degradationData, setDegradationData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch degradation data from API
  const fetchDegradationData = async () => {
    setLoading(true);
    try {
      const request: AnalysisRequest = {
        plantId: plant.id,
        domain: "degradation",
        param: "curve",
        startDate: new Date().toISOString().split('T')[0],
        isSingleDate: true
      };
      
      const response = await getAnalysisData(request);
      if (response?.data) {
        setDegradationData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch degradation data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDegradationData();
  }, [plant.id]);

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200/60 shadow-sm bg-white/95">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-100 rounded-md flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
            DC Degradation Curve (Site and Block Level)
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          ) : degradationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={degradationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis domain={[95, 101]} tick={{ fontSize: 12, fill: '#64748b' }} />
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
                  dataKey="siteLevel"
                  stroke="#fbbf24"
                  strokeWidth={3}
                  dot={{ fill: '#fbbf24', strokeWidth: 1, r: 4 }}
                  activeDot={{ r: 5, stroke: '#fbbf24', strokeWidth: 1 }}
                  name="Site Level"
                />
                <Line
                  type="monotone"
                  dataKey="blockA"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 1, r: 3 }}
                  activeDot={{ r: 4, stroke: '#10b981', strokeWidth: 1 }}
                  name="Block A"
                />
                <Line
                  type="monotone"
                  dataKey="blockB"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 1, r: 3 }}
                  activeDot={{ r: 4, stroke: '#3b82f6', strokeWidth: 1 }}
                  name="Block B"
                />
                <Line
                  type="monotone"
                  dataKey="blockC"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', strokeWidth: 1, r: 3 }}
                  activeDot={{ r: 4, stroke: '#ef4444', strokeWidth: 1 }}
                  name="Block C"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No degradation data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
