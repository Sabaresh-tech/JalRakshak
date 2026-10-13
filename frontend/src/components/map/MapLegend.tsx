import React from 'react';

export const MapLegend: React.FC = () => {
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl p-3.5 shadow-lg border border-slate-200/80 text-xs max-w-xs pointer-events-auto">
      <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2 flex items-center justify-between">
        <span>Map Legend</span>
        <span className="text-[10px] text-slate-500 font-normal">Pune Grid</span>
      </div>

      {/* Model Risk Predictions */}
      <div className="mb-3">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
          Estimated Waterlogging Risk
        </span>
        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#EF4444] border-2 border-white shadow-sm shrink-0" />
            <span className="text-slate-700 font-medium">Severe Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#F97316] border-2 border-white shadow-sm shrink-0" />
            <span className="text-slate-700 font-medium">High Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#F59E0B] border-2 border-white shadow-sm shrink-0" />
            <span className="text-slate-700 font-medium">Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#10B981] border-2 border-white shadow-sm shrink-0" />
            <span className="text-slate-700 font-medium">Low Risk</span>
          </div>
        </div>
      </div>

      {/* Citizen Field Reports */}
      <div className="pt-2 border-t border-slate-100">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
          Crowdsourced Field Alerts
        </span>
        <div className="space-y-1 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500 text-white flex items-center justify-center font-bold text-[8px]">
              !
            </span>
            <span className="text-slate-700">Unverified / In Review</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-teal-600 text-white flex items-center justify-center font-bold text-[8px]">
              ✓
            </span>
            <span className="text-slate-700">Corroborated / Verified</span>
          </div>
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-500 leading-tight">
        * Coloured markers represent estimated susceptibility, NOT measured water depth.
      </div>
    </div>
  );
};
