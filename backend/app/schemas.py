from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

# Location Schemas
class LocationBase(BaseModel):
    id: str
    name: str
    zone: str
    latitude: float
    longitude: float
    elevation_m: float
    slope_pct: float
    drainage_capacity_score: float
    impervious_surface_pct: float
    historical_incident_count: int = 0
    critical_infrastructure_nearby: str = ""
    population_density_index: float = 0.5
    road_type: str = "Arterial Road"
    description: str = ""

class LocationResponse(LocationBase):
    model_config = ConfigDict(from_attributes=True)

# Weather Observation Schemas
class WeatherObservationResponse(BaseModel):
    id: int
    location_id: str
    timestamp: datetime
    rainfall_last_1h_mm: float
    rainfall_last_3h_mm: float
    rainfall_last_6h_mm: float
    rainfall_forecast_1h_mm: float
    rainfall_forecast_3h_mm: float
    rainfall_forecast_6h_mm: float
    soil_saturation_pct: float
    data_source: str
    is_synthetic: bool

    model_config = ConfigDict(from_attributes=True)

# Contributing Factor Schema
class ContributingFactor(BaseModel):
    feature: str
    impact_pct: float
    direction: str  # "increase" or "decrease"
    value: str
    explanation: str

# Risk Prediction Schema
class RiskPredictionResponse(BaseModel):
    location_id: str
    location_name: str
    zone: str
    latitude: float
    longitude: float
    risk_category: str  # "Low", "Moderate", "High", "Severe"
    estimated_risk_score: float # 0.0 to 1.0 (uncalibrated demo score)
    forecast_horizon: str  # "1h", "3h", "6h"
    timestamp: datetime
    data_freshness_minutes: int
    rainfall_observed_mm: float
    rainfall_forecast_mm: float
    elevation_m: float
    drainage_capacity_score: float
    impervious_surface_pct: float
    road_type: str
    contributing_factors: List[ContributingFactor]
    missing_data_warnings: List[str] = []
    recommended_inspection_priority: str
    disclaimer: str = "Illustrative demo estimate. Not an official municipal advisory. Not a guarantee of road safety."
    is_demo_estimate: bool = True

# Citizen Report Schemas
class CitizenReportCreate(BaseModel):
    location_id: Optional[str] = None
    location_name: str = Field(..., min_length=2, max_length=150)
    latitude: float
    longitude: float
    water_depth_level: str # Ankle deep, Knee deep, Waist deep, Submerged road
    traffic_impact: str    # Normal, Slow moving, Single lane blocked, Completely stranded
    description: str = Field(..., min_length=5, max_length=1000)
    reporter_name: Optional[str] = "Citizen Reporter"

class CitizenReportStatusUpdate(BaseModel):
    status: str # Unverified, Under review, Corroborated, Verified, Rejected
    reviewed_by: Optional[str] = "Demo Reviewer"
    reviewer_notes: Optional[str] = None

class CitizenReportResponse(BaseModel):
    id: int
    location_id: Optional[str] = None
    location_name: str
    latitude: float
    longitude: float
    water_depth_level: str
    traffic_impact: str
    description: str
    reporter_name: str
    image_path: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    reviewed_by: Optional[str] = None
    reviewer_notes: Optional[str] = None
    is_corroborated: bool = False
    proximity_warning: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# Inspection Priority Schema
class InspectionPriorityResponse(BaseModel):
    rank: int
    location_id: str
    location_name: str
    zone: str
    latitude: float
    longitude: float
    risk_category: str
    priority_score: float
    reasons: List[str]
    evidence_freshness: str
    unverified_reports_count: int
    corroborated_reports_count: int
    suggested_action: str
    critical_infrastructure: str

# Data Status Schemas
class DataSourceInfo(BaseModel):
    name: str
    category: str # "Weather", "Terrain", "Infrastructure", "Crowdsourced"
    source_agency: str
    status: str # "Connected (Demo)", "Configured", "Synthetic", "Unavailable"
    last_sync: str
    update_frequency: str
    is_synthetic: bool
    notes: str

class DataQualityCheck(BaseModel):
    check_name: str
    passed: bool
    details: str

class DataStatusResponse(BaseModel):
    pipeline_status: str
    is_demo_environment: bool
    last_updated: datetime
    active_sources: List[DataSourceInfo]
    quality_checks: List[DataQualityCheck]
    data_coverage_summary: Dict[str, Any]

# Model Info Schema
class ModelInfoResponse(BaseModel):
    model_name: str
    model_version: str
    model_type: str
    training_status: str
    features: List[Dict[str, str]]
    known_limitations: List[str]
    explanation_method: str
    evaluation_notes: str
    pipeline_stages: List[Dict[str, str]]
    is_demo_model: bool

# Route Assessment Schemas
class RouteOption(BaseModel):
    route_id: str
    name: str
    summary: str
    distance_km: float
    estimated_time_mins: int
    overall_risk_category: str
    max_risk_score: float
    affected_hotspots: List[str]
    cautious_advice: str
    waypoints: List[List[float]]

class RouteAssessmentRequest(BaseModel):
    origin: str
    destination: str
    forecast_horizon: str = "1h"

class RouteAssessmentResponse(BaseModel):
    origin: str
    destination: str
    forecast_horizon: str
    disclaimer: str
    routes: List[RouteOption]
    timestamp: datetime
