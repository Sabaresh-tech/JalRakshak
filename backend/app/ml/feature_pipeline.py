from typing import Dict, Any, List

def compute_hydrological_risk(
    rainfall_obs_mm: float,
    rainfall_forecast_mm: float,
    elevation_m: float,
    slope_pct: float,
    drainage_score: float, # 1 (poor) to 10 (good)
    impervious_surface_pct: float, # 0 to 100
    is_underpass: bool,
    soil_saturation_pct: float = 60.0,
    corroborated_reports_count: int = 0
) -> Dict[str, Any]:
    """
    Transparent hydrological risk estimator combining physical catchment dynamics:
    1. Rainfall Hazard (observed accumulation + short-term forecast)
    2. Topographic Depression & Runoff Susceptibility (elevation, slope, impervious surface)
    3. Stormwater Drainage Capacity Deficit (PMC municipal drainage rating)
    4. Infrastructure Geometry Chokepoints (railway subways / underpass depressions)
    5. Real-time Corroborated Ground Truth Evidence (citizen feedback loop)
    """
    # 1. Effective rainfall burden (mm)
    total_rain_burden = rainfall_obs_mm * 0.6 + rainfall_forecast_mm * 0.4
    
    # 2. Runoff coefficient based on impervious surface
    runoff_coef = 0.3 + (impervious_surface_pct / 100.0) * 0.6
    
    # 3. Terrain depression factor (flatter slopes or underpasses pool water)
    slope_factor = max(0.2, 1.0 - (slope_pct / 8.0))
    if is_underpass:
        slope_factor = 1.35 # severe artificial depression
        
    # 4. Drainage deficit factor (10 is perfect 0 deficit, 1 is 90% deficit)
    drainage_deficit = (10.0 - drainage_score) / 9.0 # range 0.0 to 1.0
    
    # 5. Soil antecedent moisture factor
    saturation_factor = soil_saturation_pct / 100.0
    
    # Composite Hazard Score Calculation (0.0 to 1.0)
    # Weights: Rain (0.35), Drainage deficit (0.25), Terrain/underpass (0.20), Runoff/impervious (0.10), Saturation (0.10)
    rain_score = min(1.0, total_rain_burden / 65.0) # 65mm+ is extreme cloudburst/waterlogging
    
    raw_score = (
        (rain_score * 0.35) +
        (drainage_deficit * 0.25) +
        (slope_factor * 0.20) +
        (runoff_coef * 0.10) +
        (saturation_factor * 0.10)
    )
    
    # Ground truth corroborated incident bonus (evidence reinforcement)
    if corroborated_reports_count > 0:
        raw_score = min(1.0, raw_score + min(0.20, corroborated_reports_count * 0.10))
        
    risk_score = round(min(0.99, max(0.05, raw_score)), 3)
    
    # Category thresholds
    if risk_score >= 0.75:
        category = "Severe"
    elif risk_score >= 0.52:
        category = "High"
    elif risk_score >= 0.32:
        category = "Moderate"
    else:
        category = "Low"
        
    # Top contributing factors calculation
    factors: List[Dict[str, Any]] = []
    
    if rain_score > 0.4:
        factors.append({
            "feature": "Rainfall Intensity",
            "impact_pct": round(rain_score * 35.0, 1),
            "direction": "increase",
            "value": f"{round(total_rain_burden, 1)} mm combined",
            "explanation": f"Observed ({round(rainfall_obs_mm, 1)}mm) and forecast ({round(rainfall_forecast_mm, 1)}mm) rainfall exceed local storm absorption."
        })
        
    if drainage_deficit > 0.45:
        factors.append({
            "feature": "Drainage Deficit",
            "impact_pct": round(drainage_deficit * 25.0, 1),
            "direction": "increase",
            "value": f"{drainage_score:.1f}/10 rating",
            "explanation": f"Stormwater drain discharge capacity is limited or prone to silt blockage."
        })
        
    if is_underpass:
        factors.append({
            "feature": "Underpass Geometry",
            "impact_pct": 24.0,
            "direction": "increase",
            "value": "Depressed roadway / subway",
            "explanation": "Natural gravity sump causes runoff pooling faster than pumping extraction."
        })
    elif slope_pct < 1.5:
        factors.append({
            "feature": "Flat Topography",
            "impact_pct": round(slope_factor * 18.0, 1),
            "direction": "increase",
            "value": f"{slope_pct:.1f}% slope",
            "explanation": "Low hydraulic gradient slows down natural surface water discharge."
        })
        
    if impervious_surface_pct > 75:
        factors.append({
            "feature": "High Impervious Cover",
            "impact_pct": round(runoff_coef * 10.0, 1),
            "direction": "increase",
            "value": f"{impervious_surface_pct:.0f}% paved",
            "explanation": "Concrete and asphalt surfaces prevent groundwater infiltration."
        })
        
    if corroborated_reports_count > 0:
        factors.append({
            "feature": "Corroborated Field Reports",
            "impact_pct": round(min(20.0, corroborated_reports_count * 10.0), 1),
            "direction": "increase",
            "value": f"{corroborated_reports_count} verified citizen report(s)",
            "explanation": "Direct ground evidence confirms active water accumulation on site."
        })

    # If factors are empty, provide baseline factor
    if not factors:
        factors.append({
            "feature": "Low Hydrological Burden",
            "impact_pct": 12.0,
            "direction": "decrease",
            "value": "Favorable gradient & low rain",
            "explanation": "Current rainfall and terrain allow standard stormwater runoff."
        })
        
    return {
        "risk_category": category,
        "estimated_risk_score": risk_score,
        "contributing_factors": factors
    }
