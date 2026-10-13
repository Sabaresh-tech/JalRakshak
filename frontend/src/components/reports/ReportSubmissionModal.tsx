import React, { useState } from 'react';
import {
  AlertTriangle,
  Upload,
  CheckCircle2,
  Clock,
  MapPin,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Location, CitizenReport } from '../../types';
import { apiClient } from '../../api/client';

interface ReportSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: Location[];
  onReportSubmitted: (newReport: CitizenReport) => void;
}

export const ReportSubmissionModal: React.FC<ReportSubmissionModalProps> = ({
  isOpen,
  onClose,
  locations,
  onReportSubmitted,
}) => {
  const [selectedLocId, setSelectedLocId] = useState<string>(locations[0]?.id || '');
  const [customLocName, setCustomLocName] = useState<string>('');
  const [waterDepth, setWaterDepth] = useState<string>('Knee deep (15-45cm)');
  const [trafficImpact, setTrafficImpact] = useState<string>('Single lane blocked');
  const [description, setDescription] = useState<string>('');
  const [reporterName, setReporterName] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  // States
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successReport, setSuccessReport] = useState<CitizenReport | null>(null);

  const resetForm = () => {
    setDescription('');
    setReporterName('');
    setFile(null);
    setErrorMessage(null);
    setSuccessReport(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (description.trim().length < 5) {
      setErrorMessage('Please provide at least 5 characters describing the waterlogging situation.');
      return;
    }

    setSubmitting(true);
    try {
      // Find coordinates
      const loc = locations.find((l) => l.id === selectedLocId);
      const lat = loc ? loc.latitude : 18.5204;
      const lon = loc ? loc.longitude : 73.8567;
      const finalLocName = customLocName.trim() || (loc ? loc.name : 'Pune Corridor');

      // 1. Submit citizen report to backend
      const report = await apiClient.submitReport({
        location_id: selectedLocId || undefined,
        location_name: finalLocName,
        latitude: lat,
        longitude: lon,
        water_depth_level: waterDepth,
        traffic_impact: trafficImpact,
        description: description.trim(),
        reporter_name: reporterName.trim() || 'Citizen Reporter',
      });

      // 2. Upload image if selected
      if (file) {
        try {
          await apiClient.uploadReportImage(file);
        } catch (imgErr) {
          console.warn('Image upload failed, report saved without image:', imgErr);
        }
      }

      setSuccessReport(report);
      onReportSubmitted(report);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Submit Citizen Waterlogging Report"
      subtitle="Your field observation helps municipal teams identify critical street flooding"
      maxWidth="lg"
    >
      {successReport ? (
        <div className="py-6 text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900">Report Successfully Submitted!</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Your report for <strong>{successReport.location_name}</strong> has been logged in the system.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 text-left max-w-sm mx-auto">
            <div className="font-bold mb-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-700" />
              Initial Status: Unverified
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              In accordance with verification integrity standards, every new citizen submission begins in the <strong>Unverified</strong> state until vetted by a municipal demo reviewer.
            </p>
          </div>

          {successReport.proximity_warning && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs text-orange-900 text-left max-w-sm mx-auto">
              <span className="font-bold">{successReport.proximity_warning}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleClose}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-colors shadow-md"
            >
              Done &bull; View on Reports Board
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Location Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Select Monitored Pune Hotspot
            </label>
            <select
              value={selectedLocId}
              onChange={(e) => setSelectedLocId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 outline-none"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.zone})
                </option>
              ))}
            </select>
          </div>

          {/* Custom Landmark / Road name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Specific Landmark or Street Details (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Near Bus Stop, In front of bank ATM"
              value={customLocName}
              onChange={(e) => setCustomLocName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          {/* Water Depth & Traffic Impact Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Estimated Water Depth</label>
              <select
                value={waterDepth}
                onChange={(e) => setWaterDepth(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="Ankle deep (< 15cm)">Ankle deep (&lt; 15cm)</option>
                <option value="Knee deep (15-45cm)">Knee deep (15–45cm)</option>
                <option value="Waist deep (> 45cm)">Waist deep (&gt; 45cm)</option>
                <option value="Submerged road">Submerged road (Inundated)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Traffic Impact</label>
              <select
                value={trafficImpact}
                onChange={(e) => setTrafficImpact(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="Normal">Normal flow</option>
                <option value="Slow moving">Slow moving</option>
                <option value="Single lane blocked">Single lane blocked</option>
                <option value="Completely stranded">Completely stranded</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Situation Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Describe standing water, stalled vehicles, blocked drainage grills, or pedestrian difficulties..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
              required
            />
          </div>

          {/* Reporter Name & Image Upload */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Your Name / ID (Optional)</label>
              <input
                type="text"
                placeholder="Citizen Commuter"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Optional Photo (Max 5MB)</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-1.5 text-slate-600 text-[11px] focus:ring-2 focus:ring-teal-500 outline-none file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-teal-50 file:text-teal-700 file:font-semibold"
              />
            </div>
          </div>

          {/* Integrity Note */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-[11px] leading-relaxed">
            * Submissions are recorded in SQLite as <strong>Unverified</strong> and reviewed for proximity clusters before triggering municipal inspection priority changes.
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2 rounded-xl transition-all shadow-md disabled:opacity-50"
            >
              {submitting ? 'Submitting Report...' : 'Submit Report'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
