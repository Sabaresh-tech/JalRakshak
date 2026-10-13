import React, { useState, useEffect } from 'react';
import {
  Navigation,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowRight,
  CheckCircle,
  MapPin,
  Compass,
} from 'lucide-react';
import { RouteAssessment, RouteOption } from '../../types';
import { RiskBadge } from '../common/Badge';
import { apiClient } from '../../api/client';

interface RouteAssessmentViewProps {
  onShowRouteOnMap: (waypoints: [number, number][]) => void;
  horizon: '1h' | '3h' | '6h';
}

const PRESET_CORRIDORS = [
  { origin: 'Swargate', destination: 'Pune Station', label: 'Swargate ➔ Pune Railway Station (South-Central Corridor)' },
  { origin: 'Baner', destination: 'Shivajinagar', label: 'Baner / Balewadi ➔ Shivajinagar (West-Central IT Arterial)' },
  { origin: 'Kothrud', destination: 'Pune Camp', label: 'Kothrud (Chandani Chowk) ➔ Pune Camp (Cross-Town Link)' },
];

export const RouteAssessmentView: React.FC<RouteAssessmentViewProps> = ({
  onShowRouteOnMap,
  horizon,
}) => {
  const [selectedCorridorIdx, setSelectedCorridorIdx] = useState<number>(0);
  const [assessment, setAssessment] = useState<RouteAssessment | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoutes() {
      setLoading(true);
      try {
        const c = PRESET_CORRIDORS[selectedCorridorIdx];
        const res = await apiClient.assessRoutes(c.origin, c.destination, horizon);
        setAssessment(res);
        if (res.routes.length > 0) {
          setSelectedRouteId(res.routes[0].route_id);
        }
      } catch (err) {
        console.error('Error assessing routes:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRoutes();
  }, [selectedCorridorIdx, horizon]);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-teal-50 text-teal-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-teal-200">
            Screen H &bull; Experimental Mobility
          </span>
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
            Cautious Route Comparison
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Commuter Corridor Flood Risk Comparison
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
          Evaluates alternative Pune travel corridors against active inundation hazards and railway underpass chokepoints to recommend safer routes during heavy rainfall.
        </p>

        {/* Mandatory Experimental Disclaimer */}
        <div className="mt-4 p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-900">Experimental Decision Support Notice</h4>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Route comparisons are strictly <strong>experimental</strong> and based on illustrative catchment heuristics. Road safety is <strong>never guaranteed</strong>. Motorists must never attempt to navigate through standing water or ignore municipal flood barricades.
            </p>
          </div>
        </div>

        {/* Corridor Selector */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Select Pune Commuter Corridor:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {PRESET_CORRIDORS.map((c, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCorridorIdx(idx)}
                className={`text-left p-3 rounded-xl border text-xs font-bold transition-all ${
                  selectedCorridorIdx === idx
                    ? 'bg-[#0B2545] text-white border-[#0B2545] shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="text-[10px] text-teal-400 uppercase font-mono mb-0.5">
                  Option {idx + 1}
                </div>
                <div>{c.origin} &rarr; {c.destination}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Routes Comparison Cards */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 text-xs border border-slate-200">
          Evaluating hydrological road conditions for candidate routes...
        </div>
      ) : assessment ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assessment.routes.map((route) => {
            const isSelected = selectedRouteId === route.route_id;
            return (
              <div
                key={route.route_id}
                className={`bg-white rounded-2xl p-6 shadow-sm border transition-all flex flex-col justify-between ${
                  isSelected ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">
                      {route.route_id}
                    </span>
                    <RiskBadge category={route.overall_risk_category} size="md" />
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 mb-1">
                    {route.name}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">{route.summary}</p>

                  {/* Route Metrics */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-center mb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Distance</span>
                      <strong className="text-xs text-slate-900">{route.distance_km} km</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Est. Travel</span>
                      <strong className="text-xs text-slate-900">~{route.estimated_time_mins} mins</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Max Hazard</span>
                      <strong className="text-xs text-slate-900">{(route.max_risk_score * 100).toFixed(0)}%</strong>
                    </div>
                  </div>

                  {/* Intersecting Hotspots */}
                  <div className="mb-4">
                    <span className="text-[11px] font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">
                      Intersecting Hotspots Along Route:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {route.affected_hotspots.map((hs, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-semibold bg-rose-50 text-rose-800 px-2.5 py-1 rounded-md border border-rose-200"
                        >
                          ⚠ {hs}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Cautious Advice Banner */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    <strong>Navigation Advisory:</strong> {route.cautious_advice}
                  </div>
                </div>

                {/* Show on Map CTA */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {route.waypoints.length} Corridor Waypoints
                  </span>
                  <button
                    onClick={() => {
                      setSelectedRouteId(route.route_id);
                      onShowRouteOnMap(route.waypoints);
                    }}
                    className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Overlay Route on Map</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
