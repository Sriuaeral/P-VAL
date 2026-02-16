import React, { useMemo } from 'react';
import HeatMapGrid, { HeatMapDataPoint } from '@/components/ui/HeatMapGrid';

export interface InverterHeatmapProps {
  data: any[];
  xlabel: string;
  ylabel: string;
  title?: string;
}

const InverterHeatmap: React.FC<InverterHeatmapProps> = ({ 
  data, 
  xlabel, 
  ylabel, 
  title 
}) => {
  // Transform Nivo heatmap data format to our HeatMapGrid format
  const transformedData = useMemo(() => {
    const heatMapData: HeatMapDataPoint[] = [];
    
    data.forEach(entry => {
      entry.data.forEach((point: { x: string; y: number }) => {
        heatMapData.push({
          id: entry.id,
          value: point.y,
          hour: point.x,
          power: point.y
        });
      });
    });
    
    return heatMapData;
  }, [data]);

  return (
    <div className="w-full h-[500px]">
      <HeatMapGrid
        data={transformedData}
        rowIdField="id"
        timeField="hour"
        valueField="value"
        title={title || `${ylabel} Heat Map`}
        subtitle={`${xlabel} vs ${ylabel} visualization`}
        unit=""
        colorScheme="power"
        showLegend={true}
        showValuesOnHover={true}
        containerClassName="h-full"
      />
    </div>
  );
};

export default InverterHeatmap;