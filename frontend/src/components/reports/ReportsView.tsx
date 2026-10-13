import React, { useState } from 'react';
import {
  AlertCircle,
  Filter,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  AlertTriangle,
  RotateCw,
  Search,
  MessageSquare,
  FileCheck2,
} from 'lucide-react';
import { CitizenReport, ReportStatus } from '../../types';
import { ReportStatusBadge } from '../common/Badge';
import { apiClient } from '../../api/client';

interface ReportsViewProps {
  reports: CitizenReport[];
  onRefreshReports: () => void;
  onOpenReportModal: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  reports,
  onRefreshReports,
  onOpenReportModal,
}) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Demo review state for active card
  const [reviewModalReport, setReviewModalReport] = useState<CitizenReport | null>(null);
  const [targetStatus, setTargetStatus] = useState<ReportStatus>('Corroborated');
  const [reviewerNotes, setReviewerNotes] = useState<string>('');

  const filteredReports = reports.filter((r) => {
    if (selectedStatusFilter !== 'ALL' && r.status !== selectedStatusFilter) return false;
    if (
      searchQuery &&
      !r.location_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleOpenReview = (report: CitizenReport) => {
    setReviewModalReport(report);
    setTargetStatus(report.status);
    setReviewerNotes(report.reviewer_notes || '');
  };

  const handleSaveReview = async () => {
    if (!reviewModalReport) return;
    setUpdatingId(reviewModalReport.id);
    try {
      await apiClient.updateReportStatus(
        reviewModalReport.id,
        targetStatus,
        reviewerNotes.trim() || undefined
      );
      setReviewModalReport(null);
      onRefreshReports();
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-teal-50 text-teal-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-teal-200">
                Screen E &bull; Verification Workflow
              </span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                Demo Reviewer Interface
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Citizen Field Reports &amp; Ground Verification
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Crowdsourced incident observations undergo human demo auditing before corroborating inspection queues.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRefreshReports}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              title="Refresh Reports"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenReportModal}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-900/20"
            >
              + Submit New Report
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['ALL', 'Unverified', 'Under review', 'Corroborated', 'Verified', 'Rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatusFilter(st)}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedStatusFilter === st
                    ? 'bg-[#0B2545] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' ? `All (${reports.length})` : st}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by location or text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400 text-sm">
          No reports match the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:border-slate-300 transition-all space-y-4"
            >
              <div>
                {/* Proximity Warning Banner if clustered */}
                {report.proximity_warning && (
                  <div className="mb-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-semibold">{report.proximity_warning}</span>
                  </div>
                )}

                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{report.location_name}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {report.reporter_name}
                      </span>
                    </div>
                  </div>
                  <ReportStatusBadge status={report.status} size="md" />
                </div>

                <p className="text-xs text-slate-700 bg-slate-50/80 p-3 rounded-xl border border-slate-100 leading-relaxed italic">
                  "{report.description}"
                </p>

                {/* Metrics Badges */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                    Depth: {report.water_depth_level}
                  </span>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                    Traffic: {report.traffic_impact}
                  </span>
                  {report.is_corroborated && (
                    <span className="text-[10px] font-bold bg-teal-50 text-teal-800 px-2.5 py-1 rounded-md border border-teal-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-teal-600" />
                      Field Corroborated
                    </span>
                  )}
                </div>

                {/* Reviewer Note if reviewed */}
                {report.reviewer_notes && (
                  <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600">
                    <span className="font-bold text-slate-800">
                      Reviewer Note ({report.reviewed_by || 'Demo Reviewer'}):
                    </span>{' '}
                    {report.reviewer_notes}
                  </div>
                )}
              </div>

              {/* Demo Review Action Control */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  ID: #{report.id} &bull; SQLite Persisted
                </span>
                <button
                  onClick={() => handleOpenReview(report)}
                  className="bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-teal-600" />
                  Review Status (Demo)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Demo Review Modal Dialog */}
      {reviewModalReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Authorized Reviewer Action
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Audit Report #{reviewModalReport.id}
                </h3>
              </div>
              <button
                onClick={() => setReviewModalReport(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <strong className="text-slate-900 block mb-0.5">{reviewModalReport.location_name}</strong>
              <p className="italic">"{reviewModalReport.description}"</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Update Verification Status
              </label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as ReportStatus)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="Unverified">Unverified (Pending inspection)</option>
                <option value="Under review">Under review (Assigned to patrol)</option>
                <option value="Corroborated">Corroborated (Field/CCTV confirmed)</option>
                <option value="Verified">Verified (Official municipal record)</option>
                <option value="Rejected">Rejected (Inconsistent / False alert)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reviewer Notes / Evidence Log
              </label>
              <textarea
                rows={2}
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="e.g. CCTV verified 30cm standing water; sanitary squad notified."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
              <strong>Label Quarantine Rule:</strong> Corroborated reports boost inspection priority rankings, but are strictly quarantined from automated ML model retraining.
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setReviewModalReport(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReview}
                disabled={updatingId !== null}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all shadow-md"
              >
                {updatingId ? 'Saving...' : 'Confirm Decision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
