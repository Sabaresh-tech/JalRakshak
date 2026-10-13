import React from 'react';
import { Map, Navigation, ArrowRight, ShieldAlert, Sparkles, Filter } from 'lucide-react';
import { RiskPrediction, CitizenReport, InspectionPriority } from '../../types';
import { MetricCards } from './MetricCards';
import { RiskDistributionChart } from './RiskDistributionChart';
import { HighPriorityPreview } from './HighPriorityPreview';
import { RecentReportsWidget } from './RecentReportsWidget';

interface OverviewDashboardProps {
  predictions: RiskPrediction[];
  reports: CitizenReport[];
  priorities: InspectionPriority[];
  horizon: '1h' | '3h' | '6h';
  onNavigateToMap: () => void;
  onNavigateToReports: () => void;
  onNavigateToInspection: () => void;
  onNavigateToRoutes: () => void;
  onSelectLocation: (locationId: string) => void;
  onOpenReportModal: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  predictions,
  reports,
  priorities,
  horizon,
  onNavigateToMap,
  onNavigateToReports,
  onNavigateToInspection,
  onNavigateToRoutes,
  onSelectLocation,
  onOpenReportModal,
}) => {
  return (
    <div className="space-y-6">
      {/* Hero Welcome & Quick Action Card */}
      <div className="bg-gradient-to-r from-[#0B2545] via-[#133966] to-[#0D9488] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-teal-200 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            Pune Municipal Decision Support Prototype
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2 leading-tight">
            AI-Driven Urban Waterlogging Risk Intelligence
          </h1>
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-6 font-normal">
            Synthesizes simulated IMD precipitation telemetry, SRTM elevation gradients, PMC stormwater conduit capacities, and crowdsourced field alerts to forecast 1–6 hour road inundation risk across Pune.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onNavigateToMap}
              className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-teal-900/40 hover:scale-[1.02]"
            >
              <Map className="w-4 h-4" />
              <span>Explore Interactive Risk Map</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            <button
              onClick={onNavigateToRoutes}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all backdrop-blur-md border border-white/20"
            >
              <Navigation className="w-4 h-4" />
              <span>Safe Corridor Routing</span>
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-12 -bottom-24 w-80 h-80 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />
      </div>

      {/* Top Level Metric Cards */}
      <MetricCards predictions={predictions} reports={reports} horizon={horizon} />

      {/* Analytics & Priority Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskDistributionChart predictions={predictions} />
        <HighPriorityPreview
          priorities={priorities}
          onViewAll={onNavigateToInspection}
          onSelectLocation={onSelectLocation}
        />
      </div>

      {/* Reports and Citizen Feedback row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentReportsWidget
            reports={reports}
            onViewAll={onNavigateToReports}
            onOpenReportModal={onOpenReportModal}
          />
        </div>

        {/* Transparency callout card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/70 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
              Model &amp; Data Ethics
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed space-y-2">
              <span className="block mb-2">
                <strong>Quarantined Citizen Labels:</strong> Crowdsourced reports provide operational evidence for municipal patrols but are strictly segregated from ML training pipelines to prevent unverified feedback loops.
              </span>
              <span className="block text-slate-500">
                <strong>Hydrological Physical Principles:</strong> Uses topographic wetness indicators, slope gradients, and conduit deficit ratings instead of black-box guesses.
              </span>
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
              100% Deterministic Seed 42
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
