// src/OtherComponents/DonutChartLegendDemo/DonutChartLegendDemo.tsx
import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface DonutData {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  title: string;
  subTitle?: string;
  data: DonutData[];
  height?: number;
  footer?: React.ReactNode;
}

/**
 * Donut chart with legend.
 * Shows a friendly message when there is no data.
 */
const DonutChart: React.FC<DonutChartProps> = ({ title, subTitle, data, height=400, footer }:any) => {
  // Custom legend renderer for better text wrapping and layout
  const renderCustomLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <div className="d-flex flex-wrap justify-content-center gap-2 px-2" style={{ marginTop: '10px' }}>
        {payload.map((entry: any, index: number) => (
          <div
            key={`legend-${index}`}
            className="d-flex align-items-center"
            style={{ fontSize: '12px', maxWidth: '180px' }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: entry.color,
                marginRight: '6px',
                borderRadius: '2px',
                flexShrink: 0
              }}
            />
            <span
              style={{
                color: '#666',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={entry.value}
            >
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (!data || data.length === 0 || data.every(d => d.value === 0)) {
    return (
      <div className="card border-0 shadow-sm h-100" style={{overflowY:'auto'}}>
        <div className="card-body d-flex flex-column justify-content-center align-items-center">
          <h6 className="text-muted mb-2">{title}</h6>
          <p className="text-muted small">No data available</p>
        </div>
      </div>
    );
  }

  // Responsive chart sizing with zoom detection
  const chartHeight = height || 320;
  const zoomLevel = window.devicePixelRatio || 1;
  const isHighZoom = zoomLevel > 1.5;
  
  // Adjust label positioning based on zoom level
  const labelStyle = {
    fontSize: isHighZoom ? '10px' : '12px',
    fontWeight: 'bold' as const,
    fill: '#333'
  };
  
  const pieOuterRadius = isHighZoom ? "65%" : (chartHeight > 300 ? "75%" : "70%");
  const pieInnerRadius = isHighZoom ? "40%" : (chartHeight > 300 ? "50%" : "45%");

  // Custom label with better positioning for high zoom
  const renderLabel = (entry: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = entry;
    const RADIAN = Math.PI / 180;
    // Position label outside the chart
    const radius = outerRadius + 20; // Place label 20px outside the chart
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#333"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={labelStyle}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="card border-0 shadow-sm h-100" style={{overflowY: 'auto'}}>
      <div className="card-body">
        <div className="mb-3">
          <h6 className="text-muted mb-0">{title}</h6>
          {subTitle && <small className="text-muted">{subTitle}</small>}
        </div>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={pieInnerRadius}
              outerRadius={pieOuterRadius}
              paddingAngle={2}
              label={renderLabel}
              labelLine={false}
            >
              {data.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => `${v}`} />
            <Legend 
              verticalAlign="bottom" 
              height={60}
              content={renderCustomLegend}
            />
          </PieChart>
        </ResponsiveContainer>
        {footer && (
          <div className="mt-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonutChart;