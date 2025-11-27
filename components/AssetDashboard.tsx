import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Asset } from '../types';

interface AssetDashboardProps {
  assets: Asset[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AssetDashboard: React.FC<AssetDashboardProps> = ({ assets }) => {
  const data = assets.map(asset => ({
    name: asset.symbol,
    value: asset.quantity * asset.currentPrice
  }));

  const totalValue = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold text-slate-800 mb-2">資產配置看板</h3>
      
      <div className="text-center mb-6">
        <span className="text-sm text-gray-500">總資產價值</span>
        <div className="text-3xl font-extrabold text-slate-900 mt-1">
          ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => `$${value.toFixed(2)}`}
              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
        {assets.map((asset) => (
          <div key={asset.id} className="flex justify-between text-sm p-2 hover:bg-gray-50 rounded">
            <div>
              <span className="font-bold text-slate-700">{asset.symbol}</span>
              <span className="text-gray-400 text-xs ml-2">{asset.name}</span>
            </div>
            <div className="text-right">
              <div className="font-medium text-slate-700">{asset.quantity} 股</div>
              <div className="text-xs text-gray-500">均價 ${asset.avgCost}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetDashboard;