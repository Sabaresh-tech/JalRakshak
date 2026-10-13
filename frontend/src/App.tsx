import React, { useState, useEffect, useCallback } from 'react';
import {
  Header,
  ActiveTab,
} from './components/common/Header';
import { DemoBanner } from './components/common/DemoBanner';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { RiskMap } from './components/map/RiskMap';
import { LocationDetailPanel } from './components/details/LocationDetailPanel';
import { ReportsView } from './components/reports/ReportsView';
import { ReportSubmissionModal } from './components/reports/ReportSubmissionModal';
import { InspectionPrioritiesView } from './components/inspection/InspectionPrioritiesView';
import { TransparencyView } from './components/transparency/TransparencyView';
import { RouteAssessmentView } from './components/routes/RouteAssessmentView';
import { apiClient } from './api/client';
import { Location, RiskPrediction, CitizenReport, InspectionPriority } from './types';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [horizon, setHorizon] = useState<'1h' | '3h' | '6h'>('1h');

  // Core data states
  const [locations, setLocations] = useState<Location[]>([]);
  const [predictions, setPredictions] = useState<RiskPrediction[]>([]);
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [priorities, setPriorities] = useState<InspectionPriority[]>([]);

  // Selection & UI states
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [routeWaypoints, setRouteWaypoints] = useState<[number, number][] | undefined>(undefined);

  // Status states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [locsData, predsData, repsData, priosData] = await Promise.all([
        apiClient.getLocations(),
        apiClient.getRiskPredictions(horizon),
        apiClient.getReports(),
        apiClient.getInspectionPriorities(),
      ]);

      setLocations(locsData);
      setPredictions(predsData);
      setReports(repsData);
      setPriorities(priosData);
    } catch (err: any) {
      console.error('Failed to load application telemetry:', err);
      setError(err.message || 'Unable to connect to backend service at http://127.0.0.1:8000');
    } finally {
      setLoading(false);
    }
  }, [horizon]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Selected prediction object
  const selectedPrediction = predictions.find((p) => p.location_id === selectedLocationId) || null;

  const handleSelectLocation = (locId: string) => {
    setSelectedLocationId(locId);
    if (activeTab !== 'map') {
      setActiveTab('map');
    }
  };

  const handleShowRouteOnMap = (waypoints: [number, number][]) => {
    setRouteWaypoints(waypoints);
    setActiveTab('map');
  };

  const unverifiedReportsCount = reports.filter((r) => r.status === 'Unverified').length;

  return (
    <div className="min-h-screen bg-[#F3F7FA] text-slate-800 flex flex-col font-sans">
      {/* Top Demo Disclosure Banner */}
      <DemoBanner />

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        horizon={horizon}
        setHorizon={setHorizon}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        unverifiedReportsCount={unverifiedReportsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Alert if API failed */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">Service Connection Notice</h4>
                <p className="text-xs text-rose-700 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && predictions.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-slate-600">
              Loading Pune Waterlogging Risk Intelligence...
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Synchronizing simulated IMD feeds, SRTM topography, and PMC drainage models
            </p>
          </div>
        ) : (
          <>
            {/* Screen A: Overview Dashboard */}
            {activeTab === 'overview' && (
              <OverviewDashboard
                predictions={predictions}
                reports={reports}
                priorities={priorities}
                horizon={horizon}
                onNavigateToMap={() => setActiveTab('map')}
                onNavigateToReports={() => setActiveTab('reports')}
                onNavigateToInspection={() => setActiveTab('inspection')}
                onNavigateToRoutes={() => setActiveTab('routes')}
                onSelectLocation={handleSelectLocation}
                onOpenReportModal={() => setIsReportModalOpen(true)}
              />
            )}

            {/* Screen B & Screen C: Interactive Risk Map & Details Panel */}
            {activeTab === 'map' && (
              <div className="space-y-6">
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                  {/* Left / Center Map */}
                  <div className="flex-1 w-full">
                    <RiskMap
                      predictions={predictions}
                      reports={reports}
                      selectedLocationId={selectedLocationId}
                      onSelectLocation={(locId) => setSelectedLocationId(locId)}
                      horizon={horizon}
                      routeWaypoints={routeWaypoints}
                    />
                  </div>

                  {/* Right Side Location Details Panel */}
                  {selectedPrediction && (
                    <div className="w-full lg:w-[420px] shrink-0 animate-fadeIn">
                      <LocationDetailPanel
                        prediction={selectedPrediction}
                        onClose={() => setSelectedLocationId(null)}
                        horizon={horizon}
                        setHorizon={setHorizon}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Screen E: Citizen Reports and Review */}
            {activeTab === 'reports' && (
              <ReportsView
                reports={reports}
                onRefreshReports={fetchData}
                onOpenReportModal={() => setIsReportModalOpen(true)}
              />
            )}

            {/* Screen F: Inspection Priorities */}
            {activeTab === 'inspection' && (
              <InspectionPrioritiesView
                priorities={priorities}
                onSelectLocation={handleSelectLocation}
              />
            )}

            {/* Screen H: Cautious Route Suggestions */}
            {activeTab === 'routes' && (
              <RouteAssessmentView
                onShowRouteOnMap={handleShowRouteOnMap}
                horizon={horizon}
              />
            )}

            {/* Screen G: Data & Model Transparency */}
            {activeTab === 'transparency' && <TransparencyView />}
          </>
        )}
      </main>

      {/* Citizen Report Submission Modal (Screen D) */}
      <ReportSubmissionModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        locations={locations}
        onReportSubmitted={(newReport) => {
          setReports((prev) => [newReport, ...prev]);
          fetchData();
        }}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Pune JalRakshak</span>
            <span>&bull;</span>
            <span>Genesis Hackathon Track 2 Decision-Support Prototype</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Illustrative Hydrological Simulation &bull; Built with FastAPI, Scikit-learn, React &amp; Leaflet
          </div>
        </div>
      </footer>
    </div>
  );
};
