export type RiskCategory = 'Low' | 'Moderate' | 'High' | 'Severe';

export type ReportStatus = 'Unverified' | 'Under review' | 'Corroborated' | 'Verified' | 'Rejected';

export interface Location {
  id: string;
  name: string;
  zone: string;
  latitude: float;
  longitude: float;
  elevation_m: number;
  slope_pct: number;
  drainage_capacity_score: number;
  impervious_surface_pct: number;
  historical_incident_count: number;
  critical_infrastructure_nearby: string;
  population_density_index: number;
  road_type: string;
  description: string;
}

export type float = number;

export interface ContributingFactor {
  feature: string;
  impact_pct: number;
  direction: 'increase' | 'decrease';
  value: string;
  explanation: string;
}

export interface RiskPrediction {
  location_id: string;
  location_name: string;
  zone: string;
  latitude: number;
  longitude: number;
  risk_category: RiskCategory;
  estimated_risk_score: number;
  forecast_horizon: '1h' | '3h' | '6h';
  timestamp: string;
  data_freshness_minutes: number;
  rainfall_observed_mm: number;
  rainfall_forecast_mm: number;
  elevation_m: number;
  drainage_capacity_score: number;
  impervious_surface_pct: number;
  road_type: string;
  contributing_factors: ContributingFactor[];
  missing_data_warnings: string[];
  recommended_inspection_priority: string;
  disclaimer: string;
  is_demo_estimate: boolean;
}

export interface CitizenReport {
  id: number;
  location_id?: string;
  location_name: string;
  latitude: number;
  longitude: number;
  water_depth_level: string;
  traffic_impact: string;
  description: string;
  reporter_name: string;
  image_path?: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
  reviewed_by?: string;
  reviewer_notes?: string;
  is_corroborated: boolean;
  proximity_warning?: string;
}

export interface InspectionPriority {
  rank: number;
  location_id: string;
  location_name: string;
  zone: string;
  latitude: number;
  longitude: number;
  risk_category: RiskCategory;
  priority_score: number;
  reasons: string[];
  evidence_freshness: string;
  unverified_reports_count: number;
  corroborated_reports_count: number;
  suggested_action: string;
  critical_infrastructure: string;
}

export interface DataSourceInfo {
  name: string;
  category: string;
  source_agency: string;
  status: string;
  last_sync: string;
  update_frequency: string;
  is_synthetic: boolean;
  notes: string;
}

export interface DataQualityCheck {
  check_name: string;
  passed: boolean;
  details: string;
}

export interface DataStatus {
  pipeline_status: string;
  is_demo_environment: boolean;
  last_updated: string;
  active_sources: DataSourceInfo[];
  quality_checks: DataQualityCheck[];
  data_coverage_summary: {
    total_monitored_locations: number;
    monitored_zones: string[];
    active_weather_profiles: number;
    total_citizen_reports: number;
    unverified_reports: number;
    corroborated_reports: number;
    environment_type: string;
  };
}

export interface ModelInfo {
  model_name: string;
  model_version: string;
  model_type: string;
  training_status: string;
  features: Array<{ name: string; role: string; description: string }>;
  known_limitations: string[];
  explanation_method: string;
  evaluation_notes: string;
  pipeline_stages: Array<{ stage: string; detail: string }>;
  is_demo_model: boolean;
}

export interface RouteOption {
  route_id: string;
  name: string;
  summary: string;
  distance_km: number;
  estimated_time_mins: number;
  overall_risk_category: RiskCategory;
  max_risk_score: number;
  affected_hotspots: string[];
  cautious_advice: string;
  waypoints: [number, number][];
}

export interface RouteAssessment {
  origin: string;
  destination: string;
  forecast_horizon: string;
  disclaimer: string;
  routes: RouteOption[];
  timestamp: string;
}
