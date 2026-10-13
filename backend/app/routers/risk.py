from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import LocationModel, WeatherObservationModel, CitizenReportModel
from ..schemas import RiskPredictionResponse
from ..ml.risk_model import risk_service

router = APIRouter(prefix="/risk-predictions", tags=["Risk Predictions"])

def _build_prediction(
    loc: LocationModel,
    weather: Optional[WeatherObservationModel],
    corroborated_count: int,
    horizon: str
) -> RiskPredictionResponse:
    # Select rainfall based on horizon
    if horizon == "3h":
        obs_rain = weather.rainfall_last_3h_mm if weather else 20.0
        fc_rain = weather.rainfall_forecast_3h_mm if weather else 15.0
    elif horizon == "6h":
        obs_rain = weather.rainfall_last_6h_mm if weather else 35.0
        fc_rain = weather.rainfall_forecast_6h_mm if weather else 25.0
    else: # default 1h
        obs_rain = weather.rainfall_last_1h_mm if weather else 10.0
        fc_rain = weather.rainfall_forecast_1h_mm if weather else 8.0

    soil_sat = weather.soil_saturation_pct if weather else 65.0
    freshness_minutes = int((datetime.utcnow() - weather.timestamp).total_seconds() / 60) if weather else 15

    # Run ML & Hydrological estimation
    est = risk_service.predict_location_risk(
        rainfall_obs_mm=obs_rain,
        rainfall_forecast_mm=fc_rain,
        elevation_m=loc.elevation_m,
        slope_pct=loc.slope_pct,
        drainage_score=loc.drainage_capacity_score,
        impervious_surface_pct=loc.impervious_surface_pct,
        road_type=loc.road_type,
        soil_saturation_pct=soil_sat,
        corroborated_reports_count=corroborated_count
    )

    warnings = []
    if not weather:
        warnings.append("Real-time weather station feed unlinked; used baseline demonstration profile.")
    elif weather.is_synthetic:
        warnings.append("Rainfall values generated from calibrated Pune monsoon simulation profile.")

    return RiskPredictionResponse(
        location_id=loc.id,
        location_name=loc.name,
        zone=loc.zone,
        latitude=loc.latitude,
        longitude=loc.longitude,
        risk_category=est["risk_category"],
        estimated_risk_score=est["estimated_risk_score"],
        forecast_horizon=horizon,
        timestamp=datetime.utcnow(),
        data_freshness_minutes=freshness_minutes,
        rainfall_observed_mm=round(obs_rain, 1),
        rainfall_forecast_mm=round(fc_rain, 1),
        elevation_m=loc.elevation_m,
        drainage_capacity_score=loc.drainage_capacity_score,
        impervious_surface_pct=loc.impervious_surface_pct,
        road_type=loc.road_type,
        contributing_factors=est["contributing_factors"],
        missing_data_warnings=warnings,
        recommended_inspection_priority=est["recommended_inspection_priority"],
        disclaimer=est["disclaimer"],
        is_demo_estimate=True
    )

@router.get("", response_model=List[RiskPredictionResponse])
def get_all_risk_predictions(
    horizon: str = Query("1h", pattern="^(1h|3h|6h)$", description="Forecast horizon window"),
    zone: Optional[str] = Query(None, description="Filter by municipal zone"),
    risk_level: Optional[str] = Query(None, description="Filter by risk category (Low, Moderate, High, Severe)"),
    db: Session = Depends(get_db)
):
    query = db.query(LocationModel)
    if zone:
        query = query.filter(LocationModel.zone.ilike(f"%{zone}%"))
    locations = query.all()

    predictions = []
    for loc in locations:
        weather = db.query(WeatherObservationModel).filter(
            WeatherObservationModel.location_id == loc.id
        ).order_by(WeatherObservationModel.timestamp.desc()).first()

        corroborated_count = db.query(CitizenReportModel).filter(
            CitizenReportModel.location_id == loc.id,
            CitizenReportModel.status.in_(["Corroborated", "Verified"])
        ).count()

        pred = _build_prediction(loc, weather, corroborated_count, horizon)
        if risk_level and pred.risk_category.lower() != risk_level.lower():
            continue
        predictions.append(pred)

    # Sort by risk score descending
    predictions.sort(key=lambda x: x.estimated_risk_score, reverse=True)
    return predictions

@router.get("/{location_id}", response_model=RiskPredictionResponse)
def get_risk_prediction_for_location(
    location_id: str,
    horizon: str = Query("1h", pattern="^(1h|3h|6h)$"),
    db: Session = Depends(get_db)
):
    loc = db.query(LocationModel).filter(LocationModel.id == location_id).first()
    if not loc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location with ID '{location_id}' not found."
        )

    weather = db.query(WeatherObservationModel).filter(
        WeatherObservationModel.location_id == loc.id
    ).order_by(WeatherObservationModel.timestamp.desc()).first()

    corroborated_count = db.query(CitizenReportModel).filter(
        CitizenReportModel.location_id == loc.id,
        CitizenReportModel.status.in_(["Corroborated", "Verified"])
    ).count()

    return _build_prediction(loc, weather, corroborated_count, horizon)
