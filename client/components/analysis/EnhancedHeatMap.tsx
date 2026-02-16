import React, { useMemo, memo } from 'react';
import { AnalysisDataPoint } from '../../../shared/interface';

interface EnhancedHeatMapProps {
  data: AnalysisDataPoint[];
  type: 'string' | 'inverter';
  parameter: string;
  title: string;
  idPrefix: string;
  gridRows: number;
  unit?: string;
  colorScheme?: 'power' | 'voltage' | 'current' | 'energy' | 'temperature' | 'custom';
  customColors?: string[];
  showLegend?: boolean;
  showValuesOnHover?: boolean;
  className?: string;
  containerClassName?: string;
}

const getColorForValue = (value: number, minValue: number, maxValue: number, customColors?: string[]): string => {
  if (customColors && customColors.length > 0) {
    // Use custom color mapping
    const normalizedValue = Math.min(Math.max(value, 0), 100) / 100;
    const colorIndex = Math.floor(normalizedValue * (customColors.length - 1));
    return customColors[colorIndex];
  }

  // Data-driven color scheme based on actual data range
  // Calculate normalized value (0-1 scale) based on actual data min/max
  const dataRange = maxValue - minValue;
  if (dataRange === 0) {
    // If all values are the same, return red for zero or green for non-zero
    return value === 0 ? '#dc2626' : '#22c55e';
  }
  
  const normalizedValue = (value - minValue) / dataRange;

  // Red-Yellow-Green diverging color scheme
  // Zero values are red, increasing values go through yellow to green
  if (value === 0) return '#dc2626'; // Red for zero
  if (normalizedValue < 0.2) return '#ef4444'; // Light red
  if (normalizedValue < 0.4) return '#f97316'; // Orange-red
  if (normalizedValue < 0.6) return '#eab308'; // Yellow
  if (normalizedValue < 0.8) return '#84cc16'; // Yellow-green
  if (normalizedValue < 0.95) return '#22c55e'; // Green
  return '#16a34a'; // Dark green (highest values)
};

const getLegendColors = (colorScheme: string, customColors?: string[]): string[] => {
  if (customColors && customColors.length > 0) {
    return customColors;
  }
  // Red-Yellow-Green diverging color scheme
  return ['#dc2626', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#16a34a'];
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

// Format time labels for better display - Compact version
const formatTimeLabel = (timeSlot: string, index: number, totalSlots: number) => {
  const [hours, minutes] = timeSlot.split(':').map(Number);
  
  // For many time slots, show fewer labels to avoid crowding
  if (totalSlots > 48) {
    // Show every 6th label for very dense data
    if (index % 6 === 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}`;
    }
    return '';
  } else if (totalSlots > 24) {
    // Show every 3rd label for dense data
    if (index % 3 === 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}`;
    }
    return '';
  } else if (totalSlots > 12) {
    // Show every 2nd label for moderate data
    if (index % 2 === 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}`;
    }
    return '';
  } else {
    // Show all labels for few time slots
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  }
};

export const EnhancedHeatMap: React.FC<EnhancedHeatMapProps> = memo(({
  data,
  type,
  parameter,
  title,
  idPrefix,
  gridRows,
  unit,
  colorScheme = 'power',
  customColors,
  showLegend = true,
  showValuesOnHover = true,
  className = '',
  containerClassName = ''
}) => {
  const plant = JSON.parse(localStorage.getItem('selectedPlant') || '{}');
  
  // Memoize data processing to prevent unnecessary re-renders
  const { heatMapData, itemIds, timeSlots, dataMap, legendColors, unitSymbol, minValue, maxValue } = useMemo(() => {
    // Transform data to heatmap format
    const uniqueIds = [...new Set(data.map(point => point.inverterId))].sort((a, b) => {
      // Natural numeric sorting
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
    
    const uniqueHours = [...new Set(data.map(point => point.hour))].sort((a, b) => {
      const parseTime = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return (hours || 0) * 60 + (minutes || 0);
      };
      return parseTime(a) - parseTime(b);
    });
    
    const heatMapData = [];
    const allValues: number[] = [];
    
    uniqueIds.forEach((id, itemIndex) => {
      uniqueHours.forEach((hour) => {
        const dataPoints = data.filter(point => 
          point.inverterId === id && point.hour === hour
        );
        
        let value = 0;
        if (dataPoints.length > 0) {
          value = dataPoints[0].value;
        }
        
        allValues.push(value);
        
        heatMapData.push({
          [type === 'string' ? 'stringId' : 'inverterId']: id,
          [type === 'string' ? 'stringIndex' : 'inverterIndex']: itemIndex,
          hour: hour,
          value: Math.max(0, value),
          parameter
        });
      });
    });
    
    // Calculate data range for color coding
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    
    // Create a map for quick lookup
    const dataMap = new Map();
    heatMapData.forEach(item => {
      const key = `${item[type === 'string' ? 'stringId' : 'inverterId']}-${item.hour}`;
      dataMap.set(key, item);
    });
    
    const legendColors = getLegendColors(colorScheme, customColors);
    const unitSymbol = unit || getUnitSymbol(parameter);
    
    return { heatMapData, itemIds: uniqueIds, timeSlots: uniqueHours, dataMap, legendColors, unitSymbol, minValue, maxValue };
  }, [data, type, parameter, colorScheme, customColors, unit]);

  return (
    <div className={`bg-white/10 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-3 lg:p-4 relative overflow-hidden ${containerClassName}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-rose-500/5 rounded-2xl"></div>
      <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-lg"></div>
      
      <div className="relative z-10">
        {/* Compact Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded-lg"></div>
            <svg className="w-3 h-3 text-white relative z-10" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zM8 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H9a1 1 0 01-1-1V4zM15 3a1 1 0 00-1 1v12a1 1 0 001 1h2a1 1 0 001-1V4a1 1 0 00-1-1h-2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm lg:text-base font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
              {title} {parameter.charAt(0).toUpperCase() + parameter.slice(1)} 
            </h2>
            <p className="text-[10px] lg:text-xs text-gray-600 truncate">
              {parameter.charAt(0).toUpperCase() + parameter.slice(1)} ({unitSymbol}) across time periods
            </p>
          </div>
        </div>

        {/* Compact Heat Map */}
        <div className={`relative bg-white/50 backdrop-blur-sm rounded-lg p-2 lg:p-3 border border-white/30 shadow-lg ${className}`}>
          {/* Compact heat map grid - fits within container (no horizontal scroll) */}
          <div className="flex">
            {/* Y-axis labels (Rows) - Compact width */}
            <div className="w-12 lg:w-16 flex flex-col text-[8px] lg:text-[10px] text-gray-700 mr-2 lg:mr-3 flex-shrink-0">
              {itemIds.map((itemId) => (
                <div key={itemId} className="h-4 lg:h-5 flex items-center justify-end text-[8px] lg:text-[9px] font-semibold bg-gray-100/80 rounded-l-md border-r border-gray-300 px-1 lg:px-2">
                  {idPrefix + itemId.replace(idPrefix, '')}
                </div>
              ))}
            </div>

            {/* Heat map grid - Flexible columns to fit container */}
            <div className="flex-1 min-w-0">
              <div className="bg-white border border-gray-300 rounded-r-md overflow-hidden shadow-inner">
                {itemIds.map((itemId) => (
                  <div key={itemId} className="flex h-4 lg:h-5 border-b border-gray-200">
                    {timeSlots.map((timeSlot, index) => {
                      const key = `${itemId}-${timeSlot}`;
                      const dataPoint = dataMap.get(key);
                      const value = dataPoint ? dataPoint.value : 0;
                      const color = getColorForValue(value, minValue, maxValue, customColors);
                      
                      return (
                        <div
                          key={timeSlot}
                          className="h-4 lg:h-5 border-r border-gray-200 last:border-r-0 cursor-pointer hover:opacity-90 hover:scale-105 transition-all duration-200 relative group"
                          style={{ 
                            backgroundColor: color,
                            flex: '1 1 0%',
                            minWidth: 0
                          }}
                          title={`${title} ${itemId} at ${timeSlot} - ${value.toFixed(1)} ${unitSymbol}`}
                        >
                          {/* Value overlay on hover */}
                          {showValuesOnHover && (
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                              <span className="text-white text-[6px] lg:text-[7px] font-bold drop-shadow-lg">
                                {value.toFixed(0)}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Compact Footer with time labels - Fit to width */}
          <div className="flex mt-1 lg:mt-2">
            <div className="w-12 lg:w-16 mr-2 lg:mr-3 flex-shrink-0"></div> {/* Spacer for row labels */}
            <div className="flex-1 min-w-0">
              <div className="flex text-[8px] lg:text-[9px] text-gray-600 font-semibold">
                {timeSlots.map((timeSlot, index) => (
                  <div 
                    key={timeSlot} 
                    className="text-center py-0.5 bg-gray-100/80 rounded-b-md border-t border-gray-300 flex-1"
                    style={{ 
                      minWidth: 0,
                      fontSize: timeSlots.length > 48 ? '6px' : timeSlots.length > 24 ? '7px' : '8px'
                    }}
                    title={timeSlot} // Show full time on hover
                  >
                    {formatTimeLabel(timeSlot, index, timeSlots.length)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Compact Color scale legend */}
          {showLegend && (
            <div className="flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-4 mt-3 lg:mt-4">
              <div className="flex items-center gap-1 lg:gap-2">
                <span className="text-[10px] lg:text-xs font-semibold text-gray-700">
                  {title} {parameter.charAt(0).toUpperCase() + parameter.slice(1)} {unitSymbol && `(${unitSymbol})`}
                </span>
              </div>
              <div className="flex items-center gap-2 lg:gap-3">
                <span className="text-[8px] lg:text-[10px] text-gray-600 font-medium">Low</span>
                <div className="flex h-3 lg:h-4 w-24 lg:w-32 border border-gray-300 rounded-md overflow-hidden shadow-inner">
                  {legendColors.map((color, index) => (
                    <div key={index} className="flex-1" style={{ backgroundColor: color }} />
                  ))}
                </div>
                <span className="text-[8px] lg:text-[10px] text-gray-600 font-medium">High</span>
              </div>
              <div className="text-[8px] lg:text-[10px] text-gray-500 hidden lg:block">
                Hover for values
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

EnhancedHeatMap.displayName = 'EnhancedHeatMap';

export default EnhancedHeatMap;
