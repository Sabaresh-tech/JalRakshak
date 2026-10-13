import React from 'react';
import { MessageSquare, AlertCircle, Clock, ChevronRight, User } from 'lucide-react';
import { CitizenReport } from '../../types';
import { ReportStatusBadge } from '../common/Badge';

interface RecentReportsWidgetProps {
  reports: CitizenReport[];
  onViewAll: () => void;
  onOpenReportModal: () => void;
}

export const RecentReportsWidget: React.FC<RecentReportsWidgetProps> = ({
  reports,
  onViewAll,
  onOpenReportModal,
}) => {
  const recent = reports.slice(0, 4);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/70 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-600" />
              Recent Citizen Field Reports
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Crowdsourced observations (Unverified until reviewed)
            </p>
          </div>
          <button
            onClick={onViewAll}
            className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 hover:underline"
          >
            Review All ({reports.length})
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recent.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No citizen reports recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((rep) => (
              <div
                key={rep.id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/60 transition-all text-xs"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 truncate max-w-[180px]">
                    {rep.location_name}
                  </span>
                  <ReportStatusBadge status={rep.status} size="sm" />
                </div>
                <p className="text-slate-600 line-clamp-2 leading-relaxed">
                  "{rep.description}"
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/50 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-slate-500">
                    <User className="w-3 h-3" />
                    {rep.reporter_name}
                  </span>
                  <span className="font-medium text-slate-500 bg-slate-200/70 px-1.5 py-0.5 rounded text-[10px]">
                    {rep.water_depth_level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-500">
          Encountering water accumulation on your route?
        </span>
        <button
          onClick={onOpenReportModal}
          className="text-xs font-bold text-teal-600 hover:text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 hover:bg-teal-100 transition-colors"
        >
          + Submit Report
        </button>
      </div>
    </div>
  );
};
