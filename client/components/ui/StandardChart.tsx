import React, { memo } from 'react';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface StandardChartProps {
  data: any[];
  type: 'line' | 'area';
  dataKey: string;
  xAxisKey: string;
  title?: string;
  subtitle?: string;
  unit?: string;
  color?: string;
  height?: number | string;
  showLegend?: boolean;
  showGrid?: boolean;
  strokeWidth?: number;
  fillOpacity?: number;
  className?: string;
}

const StandardChart: React.FC<StandardChartProps> = memo(({
  data,
  type,
  dataKey,
  xAxisKey,
  title,
  subtitle,
  unit = '',
  color = '#3B82F6',
  height = '80%',
  showLegend = false,
  showGrid = true,
  strokeWidth = 2,
  fillOpacity = 0.3,
  className = ''
}) => {
  const chartProps = {
    data,
    margin: { top: 20, right: 30, left: 40, bottom: 40 }
  };

  const commonAxisProps = {
    stroke: '#374151',
    fontSize: 11,
    tickLine: true,
    axisLine: true,
    tick: { fill: '#374151', fontSize: 11 }
  };

  const tooltipStyle = {
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  };

  const renderChart = () => {
    if (type === 'area') {
      
      // Ensure we have valid data
      const validData = Array.isArray(data) && data.length > 0 ? data : [
        { name: 'Jan', value: 0 },
        { name: 'Feb', value: 0 },
        { name: 'Mar', value: 0 }
      ];
      
      if (!Array.isArray(data) || data.length === 0) {
        // Fallback data is used, no warning needed for production
      }

      return (
        <AreaChart 
          data={validData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
          <XAxis
            dataKey={xAxisKey}
            {...commonAxisProps}
            tickLine={{ stroke: '#374151', strokeWidth: 1 }}
            axisLine={{ stroke: '#374151', strokeWidth: 1 }}
          />
          <YAxis
            {...commonAxisProps}
            tickLine={{ stroke: '#374151', strokeWidth: 1 }}
            axisLine={{ stroke: '#374151', strokeWidth: 1 }}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelFormatter={(label) => `Time: ${label}`}
            formatter={(value: any) => [
              `${Number(value).toFixed(2)} ${unit}`,
              title || dataKey
            ]}
          />
          {showLegend && <Legend />}
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={strokeWidth}
            fill={color}
            fillOpacity={fillOpacity}
            dot={{ r: 3, fill: color }}
            activeDot={{ r: 5, fill: color }}
          />
        </AreaChart>
      );
    }

    return (
      <LineChart {...chartProps}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
        <XAxis
          dataKey={xAxisKey}
          {...commonAxisProps}
          tickLine={{ stroke: '#374151', strokeWidth: 1 }}
          axisLine={{ stroke: '#374151', strokeWidth: 1 }}
          label={{
            value: 'Time',
            position: 'bottom',
            offset: 0,
            style: { 
              fontSize: '14px', 
              fill: '#374151',
              textAnchor: 'middle'
            }}
          }
        />
        <YAxis
          {...commonAxisProps}
          tickLine={{ stroke: '#374151', strokeWidth: 1 }}
          axisLine={{ stroke: '#374151', strokeWidth: 1 }}
          label={{
            value: unit,
            angle: -90,
            position: 'insideLeft',
            style: { textAnchor: 'middle', fontSize: '11px', fill: '#374151' }    
          }}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={(label) => `Time: ${label}`}
          formatter={(value: any) => [
            `${Number(value).toFixed(2)} ${unit}`,
            title || dataKey
          ]}
        />
        {showLegend && <Legend />}
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={strokeWidth}
          dot={false}
          activeDot={{ r: 4, fill: color }}
        />
      </LineChart>
    );
  };

  return (
    <div className={`h-full flex flex-col ${className}`} style={{ minHeight: '120px' }}>
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
      
      <div className="flex-1 min-h-0 relative" style={{ height: height, minHeight: '120px' }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
});

StandardChart.displayName = 'StandardChart';

export default StandardChart;
