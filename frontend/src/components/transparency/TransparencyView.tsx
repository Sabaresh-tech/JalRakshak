import React, { useEffect, useState } from 'react';
import {
  FileText,
  Database,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Workflow,
  ArrowRight,
  Code,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { DataStatus, ModelInfo } from '../../types';
import { apiClient } from '../../api/client';

export const TransparencyView: React.FC = () => {
  const [dataStatus, setDataStatus] = useState<DataStatus | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadTransparencyData() {
      try {
        const [ds, mi] = await Promise.all([
          apiClient.getDataStatus(),
          apiClient.getModelInfo(),
        ]);
        setDataStatus(ds);
        setModelInfo(mi);
      } catch (err) {
        console.error('Error fetching transparency data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTransparencyData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center text-slate-400 text-sm border border-slate-200">
        Loading data provenance and model transparency specifications...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-teal-50 text-teal-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-teal-200">
            Screen G &bull; Scientific Provenance
          </span>
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
            Honest Simulation Disclosure
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Data Provenance, Quality Audits &amp; Model Transparency
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
          Full technical disclosure of input data layers, preprocessing rules, machine learning architecture, validation strategies, and operational constraints.
        </p>

        {/* Clear Non-Fabrication Notice */}
        <div className="mt-4 p-4 rounded-xl bg-teal-50/60 border border-teal-200 text-xs text-teal-950 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-teal-900">Zero Fabricated Evaluation Claims</h4>
            <p className="text-[11px] text-teal-900 leading-relaxed">
              We do not present manufactured F1, Precision, or Recall scores on synthetic labels as real-world accuracy. This prototype relies on physical hydrological principles and calibrated simulation baselines, clearly labeled as <strong>DEMO DATA</strong> until integrated with live PMC sensor telemetry.
            </p>
          </div>
        </div>
      </div>

      {/* Architecture Processing Flow */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Workflow className="w-4 h-4 text-teal-600" />
          End-to-End System Processing Flow
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Sequential pipeline executing data acquisition, feature transformation, hazard calculation, and human decision support:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {modelInfo?.pipeline_stages.map((st, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 relative flex flex-col justify-between"
            >
              <div>
                <span className="w-6 h-6 rounded-lg bg-[#0B2545] text-white text-[10px] font-bold flex items-center justify-center mb-2 shadow-sm">
                  {idx + 1}
                </span>
                <h4 className="font-bold text-xs text-slate-900 mb-1">{st.stage}</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">{st.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Data Sources Registry */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-teal-600" />
          Input Data Sources &amp; Integration Registry
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-bold">Source Name</th>
                <th className="pb-3 font-bold">Category</th>
                <th className="pb-3 font-bold">Providing Agency</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold">Update Cadence</th>
                <th className="pb-3 font-bold">Provenance &amp; Simulation Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataStatus?.active_sources.map((src, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 font-bold text-slate-900 pr-3">{src.name}</td>
                  <td className="py-3 text-slate-600 pr-3">{src.category}</td>
                  <td className="py-3 text-slate-600 pr-3">{src.source_agency}</td>
                  <td className="py-3 pr-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        src.is_synthetic
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {src.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500 pr-3">{src.update_frequency}</td>
                  <td className="py-3 text-slate-600 max-w-xs">{src.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quality Checks & Model Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Quality & Isolation Audit */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Data Quality &amp; Leakage Prevention Audit
          </h3>

          <div className="space-y-3">
            {dataStatus?.quality_checks.map((qc, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-start gap-3"
              >
                <div className="p-1 rounded-full bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{qc.check_name}</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">{qc.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Machine Learning Specs & Known Limitations */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-teal-600" />
              Machine Learning Baseline Specifications
            </h3>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70 text-xs space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span>Model Architecture:</span>
                <strong className="text-slate-900">{modelInfo?.model_type}</strong>
              </div>
              <div className="flex justify-between">
                <span>Version &amp; Artifact:</span>
                <strong className="text-slate-900">{modelInfo?.model_version}</strong>
              </div>
              <div className="flex justify-between">
                <span>Explanation Method:</span>
                <strong className="text-slate-900">{modelInfo?.explanation_method}</strong>
              </div>
              <div className="flex justify-between">
                <span>Random Seed:</span>
                <strong className="text-slate-900">42 (Reproducible Deterministic)</strong>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5 text-rose-800">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              Documented System Limitations
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-600">
              {modelInfo?.known_limitations.map((lim, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span>{lim}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
