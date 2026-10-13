from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import LocationModel, WeatherObservationModel, CitizenReportModel
from ..schemas import InspectionPriorityResponse
from ..ml.risk_model import risk_service

router = APIRouter(prefix="/inspection-priorities", tags=["Inspection Priorities"])

@router.get("", response_model=List[InspectionPriorityResponse])
def get_inspection_priorities(db: Session = Depends(get_db)):
    """
    Transparently ranks municipal inspection targets combining:
    1. Base Model Hazard Score (0.0 - 1.0)
    2. Active Corroborated Citizen Reports (+0.25 bonus per confirmed report)
    3. Unverified Alert Backlog (+0.05 bonus to trigger rapid ground check)
    4. Proximity to Vital Infrastructure (rail stations, hospitals, bridges)
    5. Population Density Vulnerability
    """
    locations = db.query(LocationModel).all()
    prioritized = []

    for loc in locations:
        weather = db.query(WeatherObservationModel).filter(
            WeatherObservationModel.location_id == loc.id
        ).order_by(WeatherObservationModel.timestamp.desc()).first()

        obs_rain = weather.rainfall_last_1h_mm if weather else 12.0
        fc_rain = weather.rainfall_forecast_1h_mm if weather else 10.0
        soil_sat = weather.soil_saturation_pct if weather else 60.0

        # Citizen reports count
        corroborated_count = db.query(CitizenReportModel).filter(
            CitizenReportModel.location_id == loc.id,
            CitizenReportModel.status.in_(["Corroborated", "Verified"])
        ).count()

        unverified_count = db.query(CitizenReportModel).filter(
            CitizenReportModel.location_id == loc.id,
            CitizenReportModel.status == "Unverified"
        ).count()

        # Base risk calculation
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

        base_score = est["estimated_risk_score"]
        
        # Priority Multipliers
        priority_score = base_score
        reasons = []

        if est["risk_category"] in ["Severe", "High"]:
            reasons.append(f"Model identified {est['risk_category']} hydrological flood susceptibility (score: {base_score:.2f})")
            
        if corroborated_count > 0:
            priority_score += min(0.35, corroborated_count * 0.15)
            reasons.append(f"{corroborated_count} field-corroborated citizen report(s) confirming active waterlogging")
            
        if unverified_count > 0:
            priority_score += min(0.15, unverified_count * 0.05)
            reasons.append(f"{unverified_count} recent unverified crowdsourced alert(s) requiring spot inspection")
            
        if loc.population_density_index > 0.85:
            priority_score += 0.08
            reasons.append(f"High commuter density corridor (density index: {loc.population_density_index})")
            
        if "underpass" in loc.road_type.lower() or "railway" in loc.road_type.lower():
            priority_score += 0.10
            reasons.append("Confined subway/underpass geometry prone to sudden vehicular stalling")

        if loc.critical_infrastructure_nearby:
            reasons.append(f"Proximate to vital assets: {loc.critical_infrastructure_nearby}")

        freshness_mins = int((datetime.utcnow() - weather.timestamp).total_seconds() / 60) if weather else 15
        freshness_str = f"Telemetry updated {freshness_mins} mins ago"

        # Action suggestions
        if priority_score >= 0.80:
            action = "Dispatch Rapid PMC Dewatering Unit; Coordinate Traffic Police for arterial diversion"
        elif priority_score >= 0.60:
            action = "Deploy Junior Engineer patrol to verify culvert intake grates and subway sump pumps"
        elif priority_score >= 0.40:
            action = "Monitor automated telemetry stream; alert ward sanitary staff for periodic drain sweep"
        else:
            action = "Standard monitoring cycle; no emergency intervention indicated"

        prioritized.append({
            "location_id": loc.id,
            "location_name": loc.name,
            "zone": loc.zone,
            "latitude": loc.latitude,
            "longitude": loc.longitude,
            "risk_category": est["risk_category"],
            "priority_score": round(priority_score, 3),
            "reasons": reasons,
            "evidence_freshness": freshness_str,
            "unverified_reports_count": unverified_count,
            "corroborated_reports_count": corroborated_count,
            "suggested_action": action,
            "critical_infrastructure": loc.critical_infrastructure_nearby or "Standard arterial route"
        })

    # Sort descending by priority score
    prioritized.sort(key=lambda x: x["priority_score"], reverse=True)

    # Assign 1-indexed rank
    result = []
    for idx, item in enumerate(prioritized, start=1):
        item["rank"] = idx
        result.append(InspectionPriorityResponse(**item))

    return result
