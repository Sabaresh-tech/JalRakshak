import React from 'react';
import { ChevronRight, AlertTriangle, ShieldCheck } from 'lucide-react';
import { InspectionPriority } from '../../types';
import { RiskBadge } from '../common/Badge';

interface HighPriorityPreviewProps {
  priorities: InspectionPriority[];
  onViewAll: () => void;
  onSelectLocation: (locationId: string) => void;
}

export const HighPriorityPreview: React.FC<HighPriorityPreviewProps> = ({
  priorities,
  onViewAll,
  onSelectLocation,
}) => {
  const topList = priorities.slice(0, 4);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/70 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              High-Priority Inspection Queue
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked by hydrological risk severity &amp; ground reports
            </p>
          </div>
          <button
            onClick={onViewAll}
            className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 hover:underline"
          >
            Full Queue ({priorities.length})
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {topList.map((item) => (
            <div
              key={item.location_id}
              onClick={() => onSelectLocation(item.location_id)}
              className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-teal-50/40 hover:border-teal-200 transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-[#0B2545] text-white text-xs font-bold flex items-center justify-center shadow-sm">
                  #{item.rank}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {item.location_name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-slate-500">{item.zone}</span>
                    <span className="text-[10px] text-slate-300">•</span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Score: {item.priority_score.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <RiskBadge category={item.risk_category} size="sm" />
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
        <span>Prioritization supports human dispatch decisions; not automated emergency orders.</span>
      </div>
    </div>
  );
};
