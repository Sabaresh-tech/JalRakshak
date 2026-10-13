import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Filter,
  Eye,
  EyeOff,
  Layers,
  MapPin,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { RiskPrediction, CitizenReport, RiskCategory } from '../../types';
import { MapLegend } from './MapLegend';

interface RiskMapProps {
  predictions: RiskPrediction[];
  reports: CitizenReport[];
  selectedLocationId: string | null;
  onSelectLocation: (locationId: string) => void;
  horizon: '1h' | '3h' | '6h';
  routeWaypoints?: [number, number][];
}

const COLOR_MAP: Record<RiskCategory, string> = {
  Severe: '#EF4444',
  High: '#F97316',
  Moderate: '#F59E0B',
  Low: '#10B981',
};

export const RiskMap: React.FC<RiskMapProps> = ({
  predictions,
  reports,
  selectedLocationId,
  onSelectLocation,
  horizon,
  routeWaypoints,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const reportsLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  // Filters state
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('ALL');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('ALL');
  const [showReportsLayer, setShowReportsLayer] = useState<boolean>(true);

  // Get distinct zones
  const zones = Array.from(new Set(predictions.map((p) => p.zone))).sort();

  // Filtered predictions
  const filteredPredictions = predictions.filter((p) => {
    if (selectedRiskFilter !== 'ALL' && p.risk_category !== selectedRiskFilter) return false;
    if (selectedZoneFilter !== 'ALL' && p.zone !== selectedZoneFilter) return false;
    return true;
  });

  // 1. Initialize Map instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered around central Pune
    const map = L.map(mapContainerRef.current, {
      center: [18.5204, 73.8567],
      zoom: 12.5,
      zoomControl: false,
    });

    // Add zoom control top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Standard OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    reportsLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Render Prediction Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    filteredPredictions.forEach((pred) => {
      const color = COLOR_MAP[pred.risk_category] || '#10B981';
      const isSelected = selectedLocationId === pred.location_id;
      const isSevere = pred.risk_category === 'Severe';

      const pulseClass = isSevere ? 'marker-severe-pulse' : '';
      const ringClass = isSelected ? 'ring-4 ring-teal-500 ring-offset-2' : '';

      // Create custom SVG HTML marker
      const customIcon = L.divIcon({
        className: 'custom-risk-marker',
        html: `
          <div class="relative group cursor-pointer" style="transform: translate(-50%, -50%);">
            <div class="${pulseClass} ${ringClass} w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg transition-transform hover:scale-125" style="background-color: ${color}; border: 2.5px solid #ffffff;">
              <span>${Math.round(pred.estimated_risk_score * 100)}</span>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([pred.latitude, pred.longitude], { icon: customIcon });

      // Popup content
      const popupHtml = `
        <div class="p-3 text-xs font-sans max-w-[240px]">
          <div class="flex items-center justify-between mb-1.5">
            <span class="font-bold text-slate-900 text-sm leading-tight">${pred.location_name}</span>
          </div>
          <p class="text-slate-500 text-[11px] mb-2">${pred.zone} • ${pred.road_type}</p>
          <div class="flex items-center gap-2 mb-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold text-white" style="background-color: ${color}">
              ${pred.risk_category} Risk (${(pred.estimated_risk_score * 100).toFixed(0)}%)
            </span>
            <span class="text-[10px] text-slate-500 font-medium">${pred.rainfall_observed_mm}mm rain</span>
          </div>
          <p class="text-[11px] text-slate-600 line-clamp-2 mb-2">
            ${pred.contributing_factors[0]?.explanation || 'Hydrological risk assessment computed.'}
          </p>
          <button id="view-loc-${pred.location_id}" class="w-full bg-[#0B2545] hover:bg-teal-600 text-white font-bold py-1.5 px-3 rounded-lg text-[11px] transition-colors">
            Inspect Full Details &rarr;
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        onSelectLocation(pred.location_id);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-loc-${pred.location_id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectLocation(pred.location_id);
          };
        }
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [filteredPredictions, selectedLocationId, onSelectLocation]);

  // 3. Render Citizen Reports Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !reportsLayerRef.current) return;

    reportsLayerRef.current.clearLayers();

    if (!showReportsLayer) return;

    reports.forEach((rep) => {
      const isCorroborated = rep.is_corroborated || rep.status === 'Verified';
      const bgColor = isCorroborated ? '#0D9488' : '#F59E0B';
      const symbol = isCorroborated ? '✓' : '!';

      const reportIcon = L.divIcon({
        className: 'custom-report-marker',
        html: `
          <div class="cursor-pointer" style="transform: translate(-50%, -50%);" title="${rep.location_name}: ${rep.water_depth_level}">
            <div class="w-6 h-6 rounded-md flex items-center justify-center text-white font-extrabold text-[11px] shadow-md border-2 border-white" style="background-color: ${bgColor}">
              ${symbol}
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([rep.latitude, rep.longitude], { icon: reportIcon });

      const popupHtml = `
        <div class="p-3 text-xs font-sans max-w-[220px]">
          <div class="flex items-center justify-between mb-1">
            <span class="font-bold text-slate-900">${rep.location_name}</span>
            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded text-white" style="background-color: ${bgColor}">
              ${rep.status}
            </span>
          </div>
          <p class="text-slate-600 italic text-[11px] mb-2">"${rep.description}"</p>
          <div class="text-[10px] text-slate-500 space-y-0.5">
            <div>Depth: <strong>${rep.water_depth_level}</strong></div>
            <div>Impact: <strong>${rep.traffic_impact}</strong></div>
            <div>Reporter: ${rep.reporter_name}</div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      reportsLayerRef.current?.addLayer(marker);
    });
  }, [reports, showReportsLayer]);

  // 4. Render Route Overlay if provided
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (routeLayerRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    if (routeWaypoints && routeWaypoints.length > 1) {
      const polyline = L.polyline(routeWaypoints, {
        color: '#0D9488',
        weight: 6,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(mapInstanceRef.current);

      routeLayerRef.current = polyline;
      mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }
  }, [routeWaypoints]);

  // Reset view to central Pune
  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([18.5204, 73.8567], 12.5);
    }
  };

  return (
    <div className="relative w-full h-[680px] rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 bg-white">
      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 max-w-[calc(100%-4rem)] pointer-events-auto">
        {/* Risk Filter */}
        <div className="flex items-center bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500 mr-2" />
          <span className="text-slate-500 font-medium mr-2">Risk:</span>
          <select
            value={selectedRiskFilter}
            onChange={(e) => setSelectedRiskFilter(e.target.value)}
            className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
          >
            <option value="ALL">All Categories ({predictions.length})</option>
            <option value="Severe">Severe Risk</option>
            <option value="High">High Risk</option>
            <option value="Moderate">Moderate</option>
            <option value="Low">Low Risk</option>
          </select>
        </div>

        {/* Zone Filter */}
        <div className="flex items-center bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-xs">
          <MapPin className="w-3.5 h-3.5 text-teal-600 mr-2" />
          <span className="text-slate-500 font-medium mr-2">Zone:</span>
          <select
            value={selectedZoneFilter}
            onChange={(e) => setSelectedZoneFilter(e.target.value)}
            className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
          >
            <option value="ALL">All Zones ({zones.length})</option>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>

        {/* Toggle Citizen Reports */}
        <button
          onClick={() => setShowReportsLayer(!showReportsLayer)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl shadow-md border text-xs font-bold transition-colors ${
            showReportsLayer
              ? 'bg-teal-50 text-teal-800 border-teal-300'
              : 'bg-white/95 text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {showReportsLayer ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>Citizen Reports ({reports.length})</span>
        </button>

        {/* Reset View Button */}
        <button
          onClick={handleResetView}
          className="p-2 bg-white/95 hover:bg-slate-100 text-slate-700 rounded-xl shadow-md border border-slate-200 transition-colors"
          title="Reset Map to Pune Center"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Bottom Left Legend */}
      <div className="absolute bottom-4 left-4 z-20">
        <MapLegend />
      </div>

      {/* Bottom Right Forecast Horizon Badge */}
      <div className="absolute bottom-4 right-4 z-20 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl shadow-lg border border-slate-800 text-[11px] flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
        <span>Forecast Window: <strong>{horizon.toUpperCase()}</strong></span>
        <span className="text-slate-400">|</span>
        <span className="text-slate-300">Click any marker to inspect</span>
      </div>
    </div>
  );
};
