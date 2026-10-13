import {
  Location,
  RiskPrediction,
  CitizenReport,
  InspectionPriority,
  DataStatus,
  ModelInfo,
  RouteAssessment
} from '../types';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = 'API request failed';
    try {
      const err = await res.json();
      errorDetail = err.detail || err.message || errorDetail;
    } catch {
      // fallback
    }
    throw new Error(`[${res.status}] ${errorDetail}`);
  }
  return res.json();
}

export const apiClient = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse<{ status: string; service: string; is_demo_mode: boolean }>(res);
  },

  async getLocations(): Promise<Location[]> {
    const res = await fetch(`${API_BASE}/locations`);
    return handleResponse<Location[]>(res);
  },

  async getLocation(id: string): Promise<Location> {
    const res = await fetch(`${API_BASE}/locations/${id}`);
    return handleResponse<Location>(res);
  },

  async getRiskPredictions(horizon: string = '1h', zone?: string, riskLevel?: string): Promise<RiskPrediction[]> {
    const params = new URLSearchParams({ horizon });
    if (zone && zone !== 'ALL') params.append('zone', zone);
    if (riskLevel && riskLevel !== 'ALL') params.append('risk_level', riskLevel);
    const res = await fetch(`${API_BASE}/risk-predictions?${params.toString()}`);
    return handleResponse<RiskPrediction[]>(res);
  },

  async getRiskPrediction(locationId: string, horizon: string = '1h'): Promise<RiskPrediction> {
    const res = await fetch(`${API_BASE}/risk-predictions/${locationId}?horizon=${horizon}`);
    return handleResponse<RiskPrediction>(res);
  },

  async getReports(status?: string, locationId?: string): Promise<CitizenReport[]> {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    if (locationId) params.append('location_id', locationId);
    const res = await fetch(`${API_BASE}/reports?${params.toString()}`);
    return handleResponse<CitizenReport[]>(res);
  },

  async submitReport(payload: {
    location_id?: string;
    location_name: string;
    latitude: number;
    longitude: number;
    water_depth_level: string;
    traffic_impact: string;
    description: string;
    reporter_name?: string;
  }): Promise<CitizenReport> {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<CitizenReport>(res);
  },

  async updateReportStatus(reportId: number, status: string, reviewerNotes?: string): Promise<CitizenReport> {
    const res = await fetch(`${API_BASE}/reports/${reportId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        reviewed_by: 'Authorized Demo Reviewer',
        reviewer_notes: reviewerNotes,
      }),
    });
    return handleResponse<CitizenReport>(res);
  },

  async uploadReportImage(file: File): Promise<{ image_url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/reports/upload-image`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<{ image_url: string; filename: string }>(res);
  },

  async getInspectionPriorities(): Promise<InspectionPriority[]> {
    const res = await fetch(`${API_BASE}/inspection-priorities`);
    return handleResponse<InspectionPriority[]>(res);
  },

  async getDataStatus(): Promise<DataStatus> {
    const res = await fetch(`${API_BASE}/data-status`);
    return handleResponse<DataStatus>(res);
  },

  async getModelInfo(): Promise<ModelInfo> {
    const res = await fetch(`${API_BASE}/model-info`);
    return handleResponse<ModelInfo>(res);
  },

  async assessRoutes(origin: string, destination: string, forecastHorizon: string = '1h'): Promise<RouteAssessment> {
    const res = await fetch(`${API_BASE}/routes/assess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin,
        destination,
        forecast_horizon: forecastHorizon,
      }),
    });
    return handleResponse<RouteAssessment>(res);
  },
};
