from fastapi import APIRouter
from ..schemas import ModelInfoResponse
from ..ml.risk_model import risk_service, FEATURE_NAMES

router = APIRouter(prefix="/model-info", tags=["Model Transparency"])

@router.get("", response_model=ModelInfoResponse)
def get_model_information():
    """Returns transparent model specifications, training origin, limitations, and pipeline architecture."""
    features_desc = [
        {"name": "rainfall_obs_mm", "role": "Meteorological Hazard", "description": "Accumulated observed rainfall across 1h, 3h, or 6h time window (mm)."},
        {"name": "rainfall_forecast_mm", "role": "Meteorological Forecast", "description": "High-resolution forecast precipitation for next 1h to 6h (mm)."},
        {"name": "elevation_m", "role": "Topographic Vulnerability", "description": "Terrain height in meters above Mean Sea Level (MSL) from SRTM DEM."},
        {"name": "slope_pct", "role": "Hydraulic Gradient", "description": "Surface slope percentage affecting gravitational runoff clearance rate."},
        {"name": "drainage_score", "role": "Municipal Infrastructure", "description": "PMC stormwater drain conduit capacity rating (1=severely choked, 10=optimum)."},
        {"name": "impervious_surface_pct", "role": "Land Use / Runoff", "description": "Proportion of concrete/asphalt pavement preventing soil infiltration (%)."},
        {"name": "is_underpass", "role": "Geometric Chokepoint", "description": "Binary flag indicating subterranean road depression, railway subway, or flyover ramp."},
        {"name": "soil_saturation_pct", "role": "Catchment Hydrology", "description": "Antecedent moisture condition reducing ground absorption threshold (%)."}
    ]

    pipeline_stages = [
        {"stage": "1. Ingestion & Validation", "detail": "Parse IMD rainfall, DEM terrain, and OSM road features with coordinate & outlier range checks."},
        {"stage": "2. Preprocessing & Feature Engineering", "detail": "Derive effective runoff coefficients, slope depression factors, and drainage deficit metrics."},
        {"stage": "3. Spatial Mapping", "detail": "Map coordinates to Pune municipal wards, road segments, and topographic catchment basins."},
        {"stage": "4. Risk Estimation", "detail": "Run hybrid physical hydrological rules with Random Forest classifier baseline to produce risk categories."},
        {"stage": "5. Transparent Attribution Explanations", "detail": "Feature contribution decomposition with rule-based impact percentages and explicit physical explanations."},
        {"stage": "6. Human Decision Support", "detail": "Produce interactive geospatial dashboard, prioritized inspection queues, and cautious route advisories."}
    ]

    limitations = [
        "Illustrative baseline model calibrated on physical Pune catchment dynamics, not an official flood warning system.",
        "Monsoon rainfall observations are currently simulated via calibrated IMD AWS profiles pending live API authorization.",
        "Model estimates surface waterlogging risk and does not simulate subsurface piped stormwater hydraulics or sewer pressure backflow.",
        "Predictions for 1-6h horizons assume localized precipitation without convective cloudburst trajectory tracking.",
        "Citizen reports provide ground-truth corroboration for inspection ranking but are quarantined from automated retraining to avoid adversarial bias."
    ]

    return ModelInfoResponse(
        model_name="Pune JalRakshak Hybrid Hydrological-ML Classifier",
        model_version="v1.0.0-demo",
        model_type="Hybrid Catchment Rule Heuristic + Scikit-Learn RandomForestClassifier",
        training_status="Calibrated Baseline on Pune Catchment Topography (Fixed Seed 42)",
        features=features_desc,
        known_limitations=limitations,
        explanation_method="Feature Contribution Decomposition & Physical Factor Attribution (SHAP-compatible fallback)",
        evaluation_notes="Real-world accuracy/F1 not fabricated. Prototype relies on transparent physical hydrological thresholds and awaits PMC empirical validation.",
        pipeline_stages=pipeline_stages,
        is_demo_model=True
    )
