import React from 'react';
import {
  X,
  AlertTriangle,
  CloudRain,
  Mountain,
  Compass,
  Layers,
  Clock,
  ShieldAlert,
  Info,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { RiskPrediction } from '../../types';
import { RiskBadge } from '../common/Badge';

interface LocationDetailPanelProps {
  prediction: RiskPrediction | null;
  onClose: () => void;
  horizon: '1h' | '3h' | '6h';
  setHorizon: (h: '1h' | '3h' | '6h') => void;
}

export const LocationDetailPanel: React.FC<LocationDetailPanelProps> = ({
  prediction,
  onClose,
  horizon,
  setHorizon,
}) => {
  if (!prediction) return null;

  const scorePct = Math.round(prediction.estimated_risk_score * 100);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200/80 max-w-xl w-full flex flex-col space-y-6">
      {/* Top Header */}
      <div className="flex items-start justify-between pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              {prediction.location_id}
            </span>
            <span className="text-xs font-semibold text-slate-500">{prediction.zone}</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
            {prediction.location_name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{prediction.road_type}</p>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Close detail panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Risk Category & Score Overview */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Assessed Hazard Level
            </span>
            <RiskBadge category={prediction.risk_category} size="md" />
          </div>
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
            {(['1h', '3h', '6h'] as const).map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                  horizon === h
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {h.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Hazard score meter */}
        <div className="mb-2">
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-slate-700">Estimated Hazard Score: {prediction.estimated_risk_score.toFixed(3)}</span>
            <span className="text-slate-500">{scorePct}% Susceptibility</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                prediction.risk_category === 'Severe'
                  ? 'bg-rose-500'
                  : prediction.risk_category === 'High'
                  ? 'bg-orange-500'
                  : prediction.risk_category === 'Moderate'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, scorePct))}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-200/60">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            Freshness: <strong>{prediction.data_freshness_minutes} mins ago</strong>
          </span>
          <span className="text-slate-400">Illustrative Demo Estimate (Uncalibrated)</span>
        </div>
      </div>

      {/* Top Contributing Factors Breakdown */}
      <div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-teal-600" />
          Primary Contributing Hazard Drivers
        </h3>

        <div className="space-y-2.5">
          {prediction.contributing_factors.map((factor, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors shadow-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-900">{factor.feature}</span>
                <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                  +{factor.impact_pct}% impact
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-1.5">
                {factor.explanation}
              </p>
              <div className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded inline-block">
                Metric: {factor.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contextual Environmental Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Rainfall */}
        <div className="p-3.5 rounded-xl bg-sky-50/50 border border-sky-100 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-sky-900 mb-2">
            <CloudRain className="w-4 h-4 text-sky-600" />
            Rainfall Context
          </div>
          <div className="space-y-1 text-slate-600">
            <div className="flex justify-between">
              <span>Observed ({horizon}):</span>
              <strong className="text-slate-900">{prediction.rainfall_observed_mm} mm</strong>
            </div>
            <div className="flex justify-between">
              <span>Forecast ({horizon}):</span>
              <strong className="text-slate-900">{prediction.rainfall_forecast_mm} mm</strong>
            </div>
          </div>
        </div>

        {/* Terrain & Drainage */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-2">
            <Mountain className="w-4 h-4 text-slate-600" />
            Terrain &amp; Drainage
          </div>
          <div className="space-y-1 text-slate-600">
            <div className="flex justify-between">
              <span>Elevation / Slope:</span>
              <strong className="text-slate-900">{prediction.elevation_m}m MSL</strong>
            </div>
            <div className="flex justify-between">
              <span>PMC Drainage Score:</span>
              <strong className="text-slate-900">{prediction.drainage_capacity_score.toFixed(1)}/10</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Missing Data / Imputation Warnings */}
      {prediction.missing_data_warnings.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
          <div className="flex items-center gap-1.5 font-bold mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            Data Quality &amp; Simulation Notice
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-amber-800 text-[11px]">
            {prediction.missing_data_warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested Action */}
      <div className="p-4 rounded-xl bg-slate-900 text-white text-xs">
        <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider block mb-1">
          Recommended Municipal Field Action
        </span>
        <p className="font-medium text-slate-100">{prediction.recommended_inspection_priority}</p>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Decision Support Notice:</strong> {prediction.disclaimer} This prediction does NOT represent a confirmed emergency incident.
        </p>
      </div>
    </div>
  );
};
