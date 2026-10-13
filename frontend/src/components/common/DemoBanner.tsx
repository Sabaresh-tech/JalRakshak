import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-teal-500/10 border-b border-amber-200/80 px-4 py-2 text-xs text-amber-900 flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 font-bold bg-amber-600 text-white text-[10px] uppercase px-2 py-0.5 rounded tracking-wider shadow-sm">
          <AlertTriangle className="w-3 h-3" />
          Demo Data Mode
        </span>
        <span className="font-medium text-slate-700">
          Hydrological estimates and rainfall profiles are illustrative calibrated simulations. Not an official emergency warning dispatch.
        </span>
      </div>
      <div className="flex items-center gap-2 text-slate-600 text-[11px]">
        <Info className="w-3.5 h-3.5 text-teal-700" />
        <span>IMD Pune Simulated Feeds &bull; Fixed Random Seed 42 &bull; Quarantined ML Labels</span>
      </div>
    </div>
  );
};
