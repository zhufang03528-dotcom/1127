import React from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { CandleData } from '../types';

interface MarketChartProps {
  data: CandleData[];
  symbol: string;
}

// Custom Shape for Candlestick
const CandlestickShape = (props: any) => {
  const { x, width, payload, yAxis } = props;
  
  // Guard clause: Ensure yAxis and its scale function exist before rendering
  if (!yAxis || !yAxis.scale || !payload) {
    return null;
  }

  const { open, close, high, low } = payload;
  const isRising = close > open;
  const color = isRising ? '#10b981' : '#ef4444'; // Emerald 500 or Red 500
  
  // Calculate coordinates safely using the yAxis scale
  const yHigh = yAxis.scale(high);
  const yLow = yAxis.scale(low);
  const yOpen = yAxis.scale(open);
  const yClose = yAxis.scale(close);
  
  // Determine dimensions
  // Recharts coordinates: y=0 is top.
  const barWidth = Math.max(2, width * 0.6);
  const bodyTop = Math.min(yOpen, yClose);
  const bodyHeight = Math.max(1, Math.abs(yOpen - yClose));

  return (
    <g>
      {/* Wick (High to Low) */}
      <line 
        x1={x + width / 2} 
        y1={yHigh} 
        x2={x + width / 2} 
        y2={yLow} 
        stroke={color} 
        strokeWidth={1} 
      />
      {/* Body (Open to Close) */}
      <rect 
        x={x + width / 2 - barWidth / 2} 
        y={bodyTop} 
        width={barWidth} 
        height={bodyHeight} 
        fill={color} 
        stroke="none"
      />
    </g>
  );
};

const MarketChart: React.FC<MarketChartProps> = ({ data, symbol }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-[400px] flex items-center justify-center text-gray-400">
        載入中或無資料...
      </div>
    );
  }

  // Calculate domain with a small buffer for better visualization
  const minPrice = Math.min(...data.map(d => d.low)) * 0.99;
  const maxPrice = Math.max(...data.map(d => d.high)) * 1.01;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-[400px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">{symbol} 行情走勢</h3>
        <div className="flex gap-2">
          <span className="text-xs text-gray-500 flex items-center">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></span> 漲
          </span>
          <span className="text-xs text-gray-500 flex items-center">
             <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span> 跌
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <ComposedChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="dateStr" 
            tick={{ fontSize: 10, fill: '#64748b' }} 
            tickLine={false}
            axisLine={false}
            minTickGap={30}
          />
          <YAxis 
            domain={[minPrice, maxPrice]} 
            tick={{ fontSize: 10, fill: '#64748b' }} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => val.toFixed(0)}
            width={40}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            itemStyle={{ color: '#334155' }}
            labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '0.25rem' }}
            formatter={(value: any, name: string) => {
              if (name === 'close') return [value, '收盤價'];
              if (name === 'open') return [value, '開盤價'];
              if (name === 'high') return [value, '最高價'];
              if (name === 'low') return [value, '最低價'];
              return [value, name];
            }}
          />
          {/* 
            We use a Bar to render the custom candlestick shape. 
            dataKey="close" establishes the base metrics, but the shape uses the full payload.
            isAnimationActive={false} is critical to prevent race conditions with accessing yAxis.scale.
          */}
          <Bar 
            dataKey="close" 
            shape={<CandlestickShape />} 
            isAnimationActive={false} 
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MarketChart;