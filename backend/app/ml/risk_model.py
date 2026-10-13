import json
import os
from pathlib import Path
from typing import Dict, Any, List
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from .feature_pipeline import compute_hydrological_risk
from ..config import settings

FEATURE_NAMES = [
    "rainfall_obs_mm",
    "rainfall_forecast_mm",
    "elevation_m",
    "slope_pct",
    "drainage_score",
    "impervious_surface_pct",
    "is_underpass",
    "soil_saturation_pct"
]

class PuneRiskModelService:
    def __init__(self):
        self.model: RandomForestClassifier = None
        self.metadata_path = settings.MODELS_DIR / "baseline_metadata.json"
        self._initialize_or_train_baseline()

    def _initialize_or_train_baseline(self):
        """
        Trains a reproducible baseline Random Forest Classifier on illustrative demonstration scenarios.
        Documented clearly as an illustrative prototype model with fixed random seed.
        """
        np.random.seed(settings.RANDOM_SEED)
        
        # Create illustrative training samples (600 rows representing varied Pune monsoon conditions)
        n_samples = 600
        rainfall_obs = np.random.exponential(scale=18.0, size=n_samples)
        rainfall_fc = np.random.exponential(scale=15.0, size=n_samples)
        elevation = np.random.uniform(530.0, 620.0, size=n_samples) # Pune elevation range ~540-600m
        slope = np.random.uniform(0.5, 6.0, size=n_samples)
        drainage = np.random.uniform(1.5, 9.5, size=n_samples)
        impervious = np.random.uniform(40.0, 95.0, size=n_samples)
        is_underpass = np.random.choice([0, 1], p=[0.85, 0.15], size=n_samples)
        soil_sat = np.random.uniform(30.0, 90.0, size=n_samples)
        
        X = pd.DataFrame({
            "rainfall_obs_mm": rainfall_obs,
            "rainfall_forecast_mm": rainfall_fc,
            "elevation_m": elevation,
            "slope_pct": slope,
            "drainage_score": drainage,
            "impervious_surface_pct": impervious,
            "is_underpass": is_underpass,
            "soil_saturation_pct": soil_sat
        })
        
        # Illustrative labels derived from physical threshold rules (0: Low, 1: Moderate, 2: High, 3: Severe)
        labels = []
        for _, row in X.iterrows():
            res = compute_hydrological_risk(
                rainfall_obs_mm=row["rainfall_obs_mm"],
                rainfall_forecast_mm=row["rainfall_forecast_mm"],
                elevation_m=row["elevation_m"],
                slope_pct=row["slope_pct"],
                drainage_score=row["drainage_score"],
                impervious_surface_pct=row["impervious_surface_pct"],
                is_underpass=bool(row["is_underpass"]),
                soil_saturation_pct=row["soil_saturation_pct"]
            )
            cat_map = {"Low": 0, "Moderate": 1, "High": 2, "Severe": 3}
            labels.append(cat_map[res["risk_category"]])
            
        y = np.array(labels)
        
        # Fit Random Forest baseline
        rf = RandomForestClassifier(
            n_estimators=50,
            max_depth=6,
            random_state=settings.RANDOM_SEED
        )
        rf.fit(X, y)
        self.model = rf
        
        # Save model metadata
        metadata = {
            "model_name": "Pune Waterlogging Risk Baseline Estimator",
            "model_version": "v1.0.0-demo",
            "model_type": "Hybrid Hydrological Heuristic + Scikit-Learn RandomForestClassifier",
            "random_seed": settings.RANDOM_SEED,
            "is_demo_data": True,
            "status": "Demonstration baseline ready for verified observational datasets",
            "feature_names": FEATURE_NAMES,
            "feature_importances": {
                name: round(float(imp), 4)
                for name, imp in zip(FEATURE_NAMES, rf.feature_importances_)
            },
            "classes": ["Low", "Moderate", "High", "Severe"],
            "known_limitations": [
                "Trained on illustrative catchment scenarios; requires empirical calibration with PMC ground-sensor telemetry.",
                "Predictions over 1-6 hour horizons assume linear rainfall dispersion without hydrodynamic pipe flow simulation.",
                "Micro-topographical depressions smaller than 10m grid are not resolved in standard digital elevation models.",
                "Does not replace official municipal or disaster management emergency directives."
            ]
        }
        
        with open(self.metadata_path, "w") as f:
            json.dump(metadata, f, indent=2)

    def predict_location_risk(
        self,
        rainfall_obs_mm: float,
        rainfall_forecast_mm: float,
        elevation_m: float,
        slope_pct: float,
        drainage_score: float,
        impervious_surface_pct: float,
        road_type: str,
        soil_saturation_pct: float = 65.0,
        corroborated_reports_count: int = 0
    ) -> Dict[str, Any]:
        """
        Produces the composite risk assessment, risk category, and feature-level explanations.
        """
        is_underpass = "underpass" in road_type.lower() or "subway" in road_type.lower()
        
        # Hydrological physical rule inference
        rule_result = compute_hydrological_risk(
            rainfall_obs_mm=rainfall_obs_mm,
            rainfall_forecast_mm=rainfall_forecast_mm,
            elevation_m=elevation_m,
            slope_pct=slope_pct,
            drainage_score=drainage_score,
            impervious_surface_pct=impervious_surface_pct,
            is_underpass=is_underpass,
            soil_saturation_pct=soil_saturation_pct,
            corroborated_reports_count=corroborated_reports_count
        )
        
        # Inspection recommendation mapping
        score = rule_result["estimated_risk_score"]
        if score >= 0.75:
            rec = "Immediate PMC Quick-Response Deployment (Deploy suction dewatering pumps)"
        elif score >= 0.52:
            rec = "High-Priority Inspection (Check drainage grates and traffic diversion alerts)"
        elif score >= 0.32:
            rec = "Routine Monitoring (Watch rainfall radar & patrol stormwater drains)"
        else:
            rec = "Standard Monitoring (Normal municipal clearance status)"
            
        return {
            "risk_category": rule_result["risk_category"],
            "estimated_risk_score": rule_result["estimated_risk_score"],
            "contributing_factors": rule_result["contributing_factors"],
            "recommended_inspection_priority": rec,
            "disclaimer": "Illustrative demo estimate. Not an official municipal advisory. Not a guarantee of road safety.",
            "is_demo_estimate": True
        }

risk_service = PuneRiskModelService()
