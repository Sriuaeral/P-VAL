import React, { memo } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend } from 'recharts';

interface RadarChartProps {
  data: any[];
  dataKey: string;
  title?: string;
  subtitle?: string;
  unit?: string;
  color?: string;
  height?: number | string;
  showLegend?: boolean;
  showGrid?: boolean;
  className?: string;
  maxValue?: number;
  windDirections?: string[];
}

const RadarChartComponent: React.FC<RadarChartProps> = memo(({
  data,
  dataKey,
  title,
  subtitle,
  unit = '',
  color = '#3B82F6',
  height = '80%',
  showLegend = false,
  showGrid = true,
  className = '',
  maxValue,
  windDirections = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
}) => {
  // Transform wind data to radar chart format
  const transformWindData = (windData: any[]) => {
    if (!windData || windData.length === 0) return [];
    
    // For time-series data, create a simple distribution across directions
    // This preserves the actual values from the API response
    const radarData = windDirections.map((direction, index) => {
      // Distribute the actual data points across directions
      const dataIndex = Math.floor((index / windDirections.length) * windData.length);
      const dataPoint = windData[dataIndex];
      const actualValue = dataPoint ? (dataPoint.value || 0) : 0;
      
      // Convert 24-hour format to 12-hour format (e.g., "14:45" -> "2:45 PM")
      let timeLabel = '';
      if (dataPoint && (dataPoint.hour || dataPoint.timestamp)) {
        const timeStr = String(dataPoint.hour || dataPoint.timestamp || '');
        
        // Check if timeStr is in HH:MM format
        if (timeStr && typeof timeStr === 'string' && timeStr.includes(':')) {
          const timeParts = timeStr.split(':');
          if (timeParts.length >= 2) {
            const hours = timeParts[0];
            const minutes = timeParts[1];
            const hour24 = parseInt(hours);
            
            if (!isNaN(hour24) && hour24 >= 0 && hour24 <= 23) {
              const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
              const ampm = hour24 >= 12 ? 'PM' : 'AM';
              timeLabel = `${hour12}:${minutes} ${ampm}`;
            }
          }
        }
      }
      
      return {
        direction,
        timeLabel, // Add time information in 12-hour format
        displayLabel: timeLabel || direction, // Use time if available, otherwise direction
        [dataKey]: actualValue,
        fullValue: actualValue
      };
    });
    
    return radarData;
  };

  const radarData = transformWindData(data);
  const maxRadarValue = maxValue || Math.max(...radarData.map(d => Number(d[dataKey]) || 0), 10);
  
  // Debug logging to verify data binding
  if (data && data.length > 0) {
    console.log('Wind Radar Chart - Input data (first 5 items):', data.slice(0, 5));
    console.log('Wind Radar Chart - Transformed data (first 5 items):', radarData.slice(0, 5));
    console.log('Wind Radar Chart - Zero values in input:', data.filter(d => d.value === 0).length);
    console.log('Wind Radar Chart - Zero values in output:', radarData.filter(d => d[dataKey] === 0).length);
    console.log('Wind Radar Chart - Time labels:', radarData.map(d => d.timeLabel).filter(t => t));
    console.log('Wind Radar Chart - Sample time data types:', data.slice(0, 3).map(d => ({
      hour: d.hour,
      hourType: typeof d.hour,
      timestamp: d.timestamp,
      timestampType: typeof d.timestamp
    })));
  }

  const chartProps = {
    data: radarData,
    margin: { top: 20, right: 30, left: 40, bottom: 40 }
  };

  const tooltipStyle = {
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  };

  const renderTooltip = (props: any) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
      const windSpeed = Number(payload[0].value);
      const windCategory = windSpeed < 2 ? 'Calm' : 
                          windSpeed < 5 ? 'Light' : 
                          windSpeed < 10 ? 'Moderate' : 
                          windSpeed < 15 ? 'Fresh' : 'Strong';
      
      // Get the time label from the payload data
      const timeLabel = payload[0].payload?.timeLabel || '';
      
      return (
        <div style={tooltipStyle} className="p-3">
          <p className="font-medium text-gray-900">{`Time: ${label}`}</p>
          <p className="text-sm text-gray-600">
            {`Wind Speed: ${windSpeed.toFixed(2)} ${unit}`}
          </p>
          <p className="text-xs text-gray-500">
            {`Category: ${windCategory}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {(title || subtitle) && (
        <div className="mb-2 flex-shrink-0">
          {title && (
            <h3 className="text-sm font-semibold text-gray-900">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className="flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height={height}>
          <RadarChart {...chartProps}>
            {showGrid && (
            <PolarGrid 
              stroke="#e2e8f0" 
              strokeWidth={1}
              gridType="polygon"
              radialLines={true}
            />
            )}
            <PolarAngleAxis 
              dataKey="displayLabel" 
              tick={{ fill: '#374151', fontSize: 10 }}
              axisLine={{ stroke: '#374151', strokeWidth: 1 }}
            />
            <PolarRadiusAxis 
              angle={0} 
              domain={[0, maxRadarValue]}
              tick={{ fill: '#374151', fontSize: 10 }}
              axisLine={{ stroke: '#374151', strokeWidth: 1 }}
              tickCount={6}
            />
            <Tooltip content={renderTooltip} />
            {showLegend && <Legend />}
            <Radar
              name={title || dataKey}
              dataKey={dataKey}
              stroke={color}
              fill={color}
              fillOpacity={0.3}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: color }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

RadarChartComponent.displayName = 'RadarChart';

export default RadarChartComponent;
