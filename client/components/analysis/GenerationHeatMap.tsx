import React from 'react';
import { AnalysisDataPoint } from '../../../shared/interface';

interface HeatMapVisualizationProps {
  data: AnalysisDataPoint[];
  type: 'string' | 'inverter';
  parameter: string;
  title: string;
  idPrefix: string;
  gridRows: number;
}

const getHeatMapColor = (value: number, parameter: string, isInverter: boolean = false) => {
  let normalizedValue = 0;

  if (isInverter) {
    switch (parameter) {
      case "voltage":
        normalizedValue = Math.min(value / 450, 1);
        break;
      case "current":
        normalizedValue = Math.min(value / 40, 1);
        break;
      case "power":
        normalizedValue = Math.min(value / 20000, 1);
        break;
      case "energy":
        normalizedValue = Math.min(value / 15000, 1);
        break;
    }
  } else {
    switch (parameter) {
      case "voltage":
        normalizedValue = Math.min(value / 600, 1);
        break;
      case "current":
        normalizedValue = Math.min(value / 15, 1);
        break;
      case "power":
        normalizedValue = Math.min(value / 6000, 1);
        break;
      case "energy":
        normalizedValue = Math.min(value / 3000, 1);
        break;
    }
  }

  // keep your original color mapping (low=blue, high=red)
  if (normalizedValue < 0.1) return '#1e3a8a';
  if (normalizedValue < 0.3) return '#3b82f6';
  if (normalizedValue < 0.5) return '#22d3ee';
  if (normalizedValue < 0.7) return '#eab308';
  if (normalizedValue < 0.9) return '#f97316';
  return '#dc2626';
};

const transformAnalysisDataToHeatMap = (data: AnalysisDataPoint[], type: 'string' | 'inverter', parameter: string) => {
  const heatMapData = [];
  
  const uniqueIds = [...new Set(data.map(point => point.inverterId))].sort();
  
  const uniqueHours = [...new Set(data.map(point => point.hour))].sort((a, b) => {
    const [hourA, minuteA] = a.split(':').map(Number);
    const [hourB, minuteB] = b.split(':').map(Number);
    if (hourA !== hourB) return hourA - hourB;
    return minuteA - minuteB;
  });
  
  uniqueIds.forEach((id, itemIndex) => {
    uniqueHours.forEach((hour) => {
      const dataPoints = data.filter(point => 
        point.inverterId === id && point.hour === hour
      );
      
      let value = 0;
      if (dataPoints.length > 0) {
        value = dataPoints[0].value;
      }
      
      heatMapData.push({
        [type === 'string' ? 'stringId' : 'inverterId']: id,
        [type === 'string' ? 'stringIndex' : 'inverterIndex']: itemIndex,
        hour: hour,
        value: Math.max(0, value),
        parameter
      });
    });
  });
  
  return heatMapData;
};

const getUnitSymbol = (parameter: string) => {
  switch (parameter) {
    case 'voltage': return 'V';
    case 'current': return 'A';
    case 'power': return 'W';
    case 'energy': return 'kWh';
    default: return '';
  }
};

export const HeatMapVisualization: React.FC<HeatMapVisualizationProps> = ({
  data,
  type,
  parameter,
  title,
  idPrefix,
  gridRows
}) => {
  const heatMapData = transformAnalysisDataToHeatMap(data, type, parameter);
  const itemIds = Array.from(new Set(heatMapData.map(d => d[type === 'string' ? 'stringId' : 'inverterId'])));
  const timeSlots = Array.from(new Set(heatMapData.map(d => d.hour)));
  const unitSymbol = getUnitSymbol(parameter);

  return (
    <div className="flex flex-col h-full">
      {/* Title */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title} {parameter.charAt(0).toUpperCase() + parameter.slice(1)} Heat Map</h3>
        <p className="text-sm text-muted-foreground">
          {parameter.charAt(0).toUpperCase() + parameter.slice(1)} ({unitSymbol}) visualization across time periods
        </p>
      </div>

      {/* Y-axis labels + Heatmap */}
      <div className="flex-grow flex">
        
        {/* Y-axis labels fixed to grid */}
        <div 
          className="w-20 grid text-[9px] font-mono text-gray-600"
          style={{ gridTemplateRows: `repeat(${itemIds.length}, 1fr)` }}
        >
          {itemIds.sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).map((itemId, index) => (
            <div key={itemId} className="flex items-center justify-end pr-1 relative">
              {idPrefix + itemId.replace(idPrefix, '')}
              {index === Math.floor(itemIds.length / 2) && (
                <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs font-medium text-gray-700 whitespace-nowrap">
                  {title}s
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Heat map grid */}
        <div className="flex-1 flex flex-col">
          <div 
            className="flex-1 bg-gray-200 border border-gray-300"
            style={{ 
              display: 'grid', 
              gridTemplateRows: `repeat(${itemIds.length}, 1fr)`, 
              gridTemplateColumns: `repeat(${timeSlots.length}, 1fr)`, 
              gap: '1px' 
            }}
          >
            {itemIds.sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).map((itemId) => 
              timeSlots.map((hour) => {
                const dataPoint = heatMapData.find(d => 
                  d[type === 'string' ? 'stringId' : 'inverterId'] === itemId && 
                  d.hour === hour
                );
                const value = dataPoint?.value || 0;
                return (
                  <div
                    key={`${itemId}-${hour}`}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ 
                      backgroundColor: getHeatMapColor(value, parameter, type === 'inverter')
                    }}
                    title={`${title} ${itemId} at ${hour.toString().padStart(2, '0')}:00 - ${value.toFixed(2)} ${unitSymbol}`}
                  />
                );
              })
            )}
          </div>

          {/* X-axis labels (Time) */}
          <div className="flex flex-col mt-2">
            <div className="flex text-[8px] text-gray-600">
              {timeSlots.filter((_, i) => i % 4 === 0).map((hour) => (
                <div key={hour} className="flex-1 text-center">
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>
            <div className="text-center text-xs font-medium text-gray-700 mt-1">Time (Hours)</div>
          </div>
        </div>
      </div>

      {/* Color scale legend */}
      <div className="flex justify-end px-4">
        <div className="flex items-center gap-2 text-[9px] text-gray-600 bg-white p-2 rounded border">
          <span>Low</span>
          <div className="flex h-3 w-32 border border-gray-300">
            <div className="flex-1" style={{ backgroundColor: '#1e3a8a' }} />
            <div className="flex-1" style={{ backgroundColor: '#3b82f6' }} />
            <div className="flex-1" style={{ backgroundColor: '#22d3ee' }} />
            <div className="flex-1" style={{ backgroundColor: '#eab308' }} />
            <div className="flex-1" style={{ backgroundColor: '#f97316' }} />
            <div className="flex-1" style={{ backgroundColor: '#dc2626' }} />
          </div>
          <span>High</span>
        </div>
      </div>
    </div>
  );
};

export default HeatMapVisualization;
