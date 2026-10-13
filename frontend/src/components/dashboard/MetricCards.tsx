import React from 'react';
import { MapPin, AlertOctagon, Users, CloudRain, Clock, ShieldCheck } from 'lucide-react';
import { RiskPrediction, CitizenReport } from '../../types';

interface MetricCardsProps {
  predictions: RiskPrediction[];
  reports: CitizenReport[];
  horizon: string;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ predictions, reports, horizon }) => {
  const severeCount = predictions.filter((p) => p.risk_category === 'Severe').length;
  const highCount = predictions.filter((p) => p.risk_category === 'High').length;
  const moderateCount = predictions.filter((p) => p.risk_category === 'Moderate').length;
  const lowCount = predictions.filter((p) => p.risk_category === 'Low').length;

  const unverifiedReports = reports.filter((r) => r.status === 'Unverified').length;
  const corroboratedReports = reports.filter((r) => r.is_corroborated || r.status === 'Verified').length;

  // Max rain observed in the dataset
  const maxRain = predictions.reduce((max, p) => Math.max(max, p.rainfall_observed_mm), 0);

  const metrics = [
    {
      label: 'Assessed Corridors',
      value: predictions.length.toString(),
      subtext: '18 Pune & PCMC Hotspots',
      icon: MapPin,
      color: 'from-blue-500 to-indigo-600',
      badge: 'Active Grid',
    },
    {
      label: 'High & Severe Risk',
      value: `${severeCount + highCount}`,
      subtext: `${severeCount} Severe • ${highCount} High Risk`,
      icon: AlertOctagon,
      color: 'from-rose-500 to-red-600',
      badge: `Horizon: ${horizon.toUpperCase()}`,
      highlight: true,
    },
    {
      label: 'Citizen Field Reports',
      value: reports.length.toString(),
      subtext: `${corroboratedReports} Corroborated • ${unverifiedReports} Unverified`,
      icon: Users,
      color: 'from-teal-500 to-emerald-600',
      badge: 'Crowdsourced',
    },
    {
      label: 'Peak Rainfall Burden',
      value: `${maxRain.toFixed(1)} mm`,
      subtext: 'Simulated IMD Precipitation',
      icon: CloudRain,
      color: 'from-sky-500 to-cyan-600',
      badge: '15m Telemetry',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div
            key={idx}
            className={`bg-white rounded-2xl p-5 shadow-sm border transition-all hover:shadow-md ${
              m.highlight ? 'border-rose-200/80 bg-rose-50/20' : 'border-slate-200/70'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {m.label}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {m.badge}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {m.value}
                </div>
                <div className="text-xs text-slate-500 mt-1 font-medium">{m.subtext}</div>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-tr ${m.color} text-white shadow-md shadow-slate-200`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
