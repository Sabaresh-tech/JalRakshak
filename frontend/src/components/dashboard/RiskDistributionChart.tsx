import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { RiskPrediction } from '../../types';

interface RiskDistributionChartProps {
  predictions: RiskPrediction[];
}

export const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({ predictions }) => {
  const counts = {
    Low: predictions.filter((p) => p.risk_category === 'Low').length,
    Moderate: predictions.filter((p) => p.risk_category === 'Moderate').length,
    High: predictions.filter((p) => p.risk_category === 'High').length,
    Severe: predictions.filter((p) => p.risk_category === 'Severe').length,
  };

  const data = [
    { name: 'Low Risk', count: counts.Low, color: '#10B981', category: 'Low' },
    { name: 'Moderate', count: counts.Moderate, color: '#F59E0B', category: 'Moderate' },
    { name: 'High Risk', count: counts.High, color: '#F97316', category: 'High' },
    { name: 'Severe Risk', count: counts.Severe, color: '#EF4444', category: 'Severe' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/70">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Risk Category Distribution
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Breakdown across all 18 evaluated Pune catchment zones
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
          Total: {predictions.length} Hotspots
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="name"
              stroke="#64748B"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-800">
                      <p className="font-bold">{d.name}</p>
                      <p className="text-slate-300 mt-1">
                        <span className="text-teal-400 font-bold">{d.count}</span> locations ({((d.count / (predictions.length || 1)) * 100).toFixed(0)}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={48}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
        {data.map((d) => (
          <div key={d.name} className="flex flex-col items-center">
            <span className="w-2.5 h-2.5 rounded-full mb-1" style={{ backgroundColor: d.color }} />
            <span className="text-[11px] font-medium text-slate-500">{d.name}</span>
            <span className="text-sm font-bold text-slate-800">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
