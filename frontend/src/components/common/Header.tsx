import React, { useState } from 'react';
import {
  Waves,
  MapPin,
  ClipboardList,
  AlertCircle,
  FileText,
  Navigation,
  PlusCircle,
  Clock,
  Menu,
  X,
  ShieldAlert,
} from 'lucide-react';

export type ActiveTab = 'overview' | 'map' | 'reports' | 'inspection' | 'routes' | 'transparency';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  horizon: '1h' | '3h' | '6h';
  setHorizon: (h: '1h' | '3h' | '6h') => void;
  onOpenReportModal: () => void;
  unverifiedReportsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  horizon,
  setHorizon,
  onOpenReportModal,
  unverifiedReportsCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }> = [
    { id: 'overview', label: 'Overview', icon: Waves },
    { id: 'map', label: 'Risk Map', icon: MapPin },
    { id: 'reports', label: 'Citizen Reports', icon: AlertCircle, badge: unverifiedReportsCount },
    { id: 'inspection', label: 'Inspection Priorities', icon: ClipboardList },
    { id: 'routes', label: 'Safe Routes', icon: Navigation },
    { id: 'transparency', label: 'Model Transparency', icon: FileText },
  ];

  return (
    <header className="bg-[#0B2545] text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-teal-400 flex items-center justify-center shadow-md shadow-teal-500/20 text-white">
              <Waves className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">Pune JalRakshak</span>
                <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded">
                  Track 2
                </span>
              </div>
              <p className="text-[11px] text-slate-300 tracking-wide font-normal">
                AI Waterlogging Risk &amp; Response Prioritisation
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all relative ${
                    isActive
                      ? 'bg-teal-500 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-1 bg-amber-400 text-slate-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Controls: Forecast Horizon + Submit Report */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Horizon Selector */}
            <div className="flex items-center bg-slate-900/80 p-0.5 rounded-lg border border-slate-700/60">
              <span className="text-[11px] text-slate-400 px-2 flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3 text-teal-400" />
                Horizon:
              </span>
              {(['1h', '3h', '6h'] as const).map((h) => (
                <button
                  key={h}
                  onClick={() => setHorizon(h)}
                  className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all ${
                    horizon === h
                      ? 'bg-teal-500 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {h.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Submit Report Button */}
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-md shadow-teal-900/30 hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Flood</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden gap-2">
            <button
              onClick={onOpenReportModal}
              className="p-2 bg-teal-500 text-white rounded-lg text-xs font-bold sm:hidden"
              title="Report Flood"
            >
              <PlusCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-t border-slate-800 px-4 pt-3 pb-4 space-y-2">
          {/* Horizon Selector */}
          <div className="flex items-center justify-between py-2 border-b border-slate-800">
            <span className="text-xs text-slate-300 font-medium">Forecast Horizon:</span>
            <div className="flex gap-1">
              {(['1h', '3h', '6h'] as const).map((h) => (
                <button
                  key={h}
                  onClick={() => {
                    setHorizon(h);
                  }}
                  className={`text-xs px-2.5 py-1 rounded font-semibold ${
                    horizon === h ? 'bg-teal-500 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {h.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Nav Links */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-teal-500 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-amber-400 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
