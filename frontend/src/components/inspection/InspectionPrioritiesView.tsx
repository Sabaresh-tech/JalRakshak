import React from 'react';
import {
  ClipboardList,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { InspectionPriority } from '../../types';
import { RiskBadge } from '../common/Badge';

interface InspectionPrioritiesViewProps {
  priorities: InspectionPriority[];
  onSelectLocation: (locationId: string) => void;
}

export const InspectionPrioritiesView: React.FC<InspectionPrioritiesViewProps> = ({
  priorities,
  onSelectLocation,
}) => {
  return (
    <div className="space-y-6">
      {/* Header and Context Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-teal-50 text-teal-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-teal-200">
            Screen F &bull; Decision Support
          </span>
          <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
            Transparent Heuristic Ranking
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Municipal Inspection &amp; Patrol Priorities
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
          Ranks Pune road corridors to assist municipal junior engineers and rapid response squads in prioritizing physical dewatering, drainage grating clearance, and traffic diversion interventions.
        </p>

        {/* Clear Non-Dispatch System Notice */}
        <div className="mt-4 p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Human Decision-Support Notice:</strong> This queue assists human supervisors in dispatch scheduling. It does <em>not</em> constitute an automated emergency dispatch order and must always be supplemented with physical safety assessments.
          </p>
        </div>
      </div>

      {/* Priorities List */}
      <div className="space-y-4">
        {priorities.map((item) => (
          <div
            key={item.location_id}
            className={`bg-white rounded-2xl p-6 shadow-sm border transition-all hover:shadow-md ${
              item.rank <= 3 ? 'border-l-4 border-l-rose-500 border-slate-200' : 'border-slate-200/80'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-start gap-4">
                {/* Rank Badge */}
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-base shadow-sm shrink-0 ${
                    item.rank === 1
                      ? 'bg-rose-600 text-white shadow-rose-200'
                      : item.rank <= 3
                      ? 'bg-orange-500 text-white shadow-orange-200'
                      : 'bg-[#0B2545] text-white shadow-slate-200'
                  }`}
                >
                  #{item.rank}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-base text-slate-900">
                      {item.location_name}
                    </h3>
                    <RiskBadge category={item.risk_category} size="sm" />
                    <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {item.zone}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>
                      Priority Index: <strong>{item.priority_score.toFixed(3)}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      {item.evidence_freshness}
                    </span>
                  </div>
                </div>
              </div>

              {/* Inspect Button */}
              <button
                onClick={() => onSelectLocation(item.location_id)}
                className="self-start md:self-auto flex items-center gap-1.5 bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 font-bold text-xs px-4 py-2 rounded-xl border border-slate-200 transition-colors"
              >
                <span>Examine Catchment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Reasons and Suggested Action Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-xs">
              {/* Transparent Ranking Drivers */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <span className="font-bold text-slate-700 block mb-2 uppercase text-[10px] tracking-wider">
                  Transparent Ranking Drivers
                </span>
                <ul className="space-y-1.5 text-slate-600">
                  {item.reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Field Action */}
              <div className="bg-teal-50/40 rounded-xl p-4 border border-teal-100 flex flex-col justify-between">
                <div>
                  <span className="font-bold text-teal-900 block mb-2 uppercase text-[10px] tracking-wider">
                    Recommended PMC Field Intervention
                  </span>
                  <p className="text-slate-800 font-medium leading-relaxed">
                    {item.suggested_action}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-teal-200/50 flex items-center justify-between text-[11px] text-teal-900">
                  <span>
                    Crowdsourced Evidence:{' '}
                    <strong>{item.corroborated_reports_count} Corroborated</strong>,{' '}
                    <strong>{item.unverified_reports_count} Pending</strong>
                  </span>
                  <span className="text-[10px] text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded font-semibold">
                    {item.critical_infrastructure}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
