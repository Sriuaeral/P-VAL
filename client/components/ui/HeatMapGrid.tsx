import React, { useMemo, memo } from 'react';

export interface HeatMapDataPoint {
  [key: string]: any;
}

export interface HeatMapGridProps {
  data: HeatMapDataPoint[];
  rowIdField: string; // Field name for row identifiers (e.g., 'inverterId', 'stringId')
  rowLabelField?: string; // Field name for row display labels (e.g., 'inverterName', 'stringName')
  timeField: string; // Field name for time identifiers (e.g., 'hour')
  valueField: string; // Field name for values (e.g., 'value', 'power')
  title: string;
  subtitle?: string;
  unit?: string;
  colorScheme?: 'power' | 'voltage' | 'current' | 'energy' | 'temperature' | 'custom';
  customColors?: string[];
  showLegend?: boolean;
  showValuesOnHover?: boolean;
  className?: string;
  containerClassName?: string;
  tooltipPrefix?: string; // Prefix for tooltip display (e.g., 'INV', 'STR')
}

const getColorForValue = (value: number, minValue: number, maxValue: number, customColors?: string[]): string => {
  if (customColors && customColors.length > 0) {
    // Use custom color mapping
    const normalizedValue = Math.min(Math.max(value, 0), 100) / 100;
    const colorIndex = Math.floor(normalizedValue * (customColors.length - 1));
    return customColors[colorIndex];
  }

  // Data-driven red-yellow-green diverging color scheme
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

  // Red-Yellow-Green diverging color scheme for all schemes
  return ['#dc2626', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#16a34a'];
};

// Format time labels for better display (show every 4th label for 15-minute intervals)
const formatTimeLabel = (timeSlot: string, index: number) => {
  const [hours, minutes] = timeSlot.split(':').map(Number);
  // Show label every hour (every 4th 15-minute interval) or for specific times
  if (minutes === 0 || (hours === 0 && minutes === 0) || (hours === 12 && minutes === 0) || (hours === 23 && minutes === 45)) {
    return timeSlot;
  }
  // For other intervals, show abbreviated format
  if (minutes === 15 || minutes === 30 || minutes === 45) {
    return `${minutes}`;
  }
  return '';
};

export const HeatMapGrid: React.FC<HeatMapGridProps> = memo(({
  data,
  rowIdField,
  rowLabelField,
  timeField,
  valueField,
  title,
  subtitle,
  unit = '',
  colorScheme = 'power',
  customColors,
  showLegend = true,
  showValuesOnHover = true,
  className = '',
  containerClassName = '',
  tooltipPrefix = ''
}) => {
  const plant  = JSON.parse(localStorage.getItem('selectedPlant') || '{}');
  // Memoize data processing to prevent unnecessary re-renders
  const { uniqueRows, uniqueTimeSlots, dataMap, legendColors, minValue, maxValue } = useMemo(() => {
    const uniqueRows = Array.from(new Set(data.map(item => item[rowIdField]))).sort((a, b) => {
      // Extract numeric part from strings like "I1", "INV-1", "I10" -> 1, 1, 10
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      return numA - numB;  // Natural numeric order: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11...
    });
    const uniqueTimeSlots = Array.from(new Set(data.map(item => item[timeField]))).sort((a, b) => {
      // Parse time strings (e.g., "09:45", "14:30") for proper chronological sorting
      const parseTime = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return (hours || 0) * 60 + (minutes || 0);
      };
      return parseTime(a) - parseTime(b);
    });
    
    // Calculate data range for color coding
    const allValues = data.map(item => item[valueField] || 0);
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    
    // Create a map for quick lookup
    const dataMap = new Map();
    data.forEach(item => {
      const key = `${item[rowIdField]}-${item[timeField]}`;
      dataMap.set(key, item);
    });

    const legendColors = getLegendColors(colorScheme, customColors);
    
    return { uniqueRows, uniqueTimeSlots, dataMap, legendColors, minValue, maxValue };
  }, [data, rowIdField, timeField, valueField, colorScheme, customColors]);

  return (
    <div className={`bg-white/10 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl p-4 lg:p-6 relative overflow-hidden ${containerClassName}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-rose-500/5 rounded-3xl"></div>
      <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-xl"></div>
      
      <div className="relative z-10">
        {/* Header - Only show if title is provided */}
        {title && (
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden group">
              {/* Glossy overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded-xl"></div>
              {/* Inner shadow for depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent rounded-xl"></div>
              <svg className="w-5 h-5 text-white relative z-10 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zM8 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H9a1 1 0 01-1-1V4zM15 3a1 1 0 00-1 1v12a1 1 0 001 1h2a1 1 0 001-1V4a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-gray-600">{subtitle}</p>
              )}
            </div>
          </div>
        )}

        {/* Heat Map */}
        <div className={`relative bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg ${className}`}>
          {/* Heat map grid */}
          <div className="flex">
            {/* Y-axis labels (Rows) */}
            <div className="w-20 flex flex-col text-xs text-gray-700 mr-3">
              {uniqueRows.map((rowId) => {
                const rowData = data.find(item => item[rowIdField] === rowId);
                const displayLabel = rowLabelField && rowData ? rowData[rowLabelField] : rowId;
                return (
                  <div key={rowId} className="h-6 flex items-center justify-end text-[10px] font-semibold bg-gray-100/80 rounded-l-lg border-r border-gray-300 px-2">
                    {displayLabel}
                  </div>
                );
              })}
            </div>

            {/* Heat map grid */}
            <div className="flex-1">
              <div className="bg-white border-2 border-gray-300 rounded-r-lg overflow-hidden shadow-inner">
                {uniqueRows.map((rowId) => (
                  <div key={rowId} className="flex h-6 border-b border-gray-200">
                    {uniqueTimeSlots.map((timeSlot, index) => {
                      const key = `${rowId}-${timeSlot}`;
                      const dataPoint = dataMap.get(key);
                      const value = dataPoint ? dataPoint[valueField] : 0;
                      const color = getColorForValue(value, minValue, maxValue, customColors);
                      
                      return (
                        <div
                          key={timeSlot}
                          className="h-6 border-r border-gray-200 last:border-r-0 cursor-pointer hover:opacity-90 hover:scale-105 transition-all duration-200 relative group"
                          style={{ 
                            backgroundColor: color,
                            minWidth: `${100 / uniqueTimeSlots.length}%`,
                            maxWidth: `${100 / uniqueTimeSlots.length}%`,
                            flex: `0 0 ${100 / uniqueTimeSlots.length}%`
                          }}
                          title={`${tooltipPrefix}${rowId} at ${timeSlot} - ${value.toFixed(1)} ${unit}`}
                        >
                          {/* Value overlay on hover */}
                          {showValuesOnHover && (
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                              <span className="text-white text-[8px] font-bold drop-shadow-lg">
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

          {/* Footer with time labels */}
          <div className="flex mt-2">
            <div className="w-20 mr-3"></div> {/* Spacer for row labels */}
            <div className="flex-1">
              <div className="flex text-xs text-gray-600 font-semibold">
                {uniqueTimeSlots.map((timeSlot, index) => (
                  <div 
                    key={timeSlot} 
                    className="flex-1 text-center py-0.5 bg-gray-100/80 rounded-b-lg border-t border-gray-300"
                    style={{ 
                      minWidth: `${100 / uniqueTimeSlots.length}%`,
                      maxWidth: `${100 / uniqueTimeSlots.length}%`,
                      fontSize: uniqueTimeSlots.length > 48 ? '9px' : '10px'
                    }}
                    title={timeSlot} // Show full time on hover
                  >
                    {formatTimeLabel(timeSlot, index)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Color scale legend */}
          {showLegend && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">
                  {title} {unit && `(${unit})`}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-600 font-medium">Low</span>
                <div className="flex h-6 w-48 border-2 border-gray-300 rounded-lg overflow-hidden shadow-inner">
                  {legendColors.map((color, index) => (
                    <div key={index} className="flex-1" style={{ backgroundColor: color }} />
                  ))}
                </div>
                <span className="text-xs text-gray-600 font-medium">High</span>
              </div>
              <div className="text-xs text-gray-500">
                Hover over cells for values
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

HeatMapGrid.displayName = 'HeatMapGrid';

export default HeatMapGrid;
