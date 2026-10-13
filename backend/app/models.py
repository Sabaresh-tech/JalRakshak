from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class LocationModel(Base):
    __tablename__ = "locations"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    zone = Column(String(50), nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation_m = Column(Float, nullable=False)
    slope_pct = Column(Float, nullable=False)
    drainage_capacity_score = Column(Float, nullable=False) # 1.0 (poor) to 10.0 (excellent)
    impervious_surface_pct = Column(Float, nullable=False)  # 0 to 100%
    historical_incident_count = Column(Integer, default=0)
    critical_infrastructure_nearby = Column(String(200), default="")
    population_density_index = Column(Float, default=0.5)   # 0.0 to 1.0
    road_type = Column(String(50), default="Arterial Road")
    description = Column(Text, default="")
    
    # Relationships
    weather_observations = relationship("WeatherObservationModel", back_populates="location", cascade="all, delete-orphan")
    reports = relationship("CitizenReportModel", back_populates="location")


class WeatherObservationModel(Base):
    __tablename__ = "weather_observations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    location_id = Column(String(50), ForeignKey("locations.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Actual/observed rainfall (mm)
    rainfall_last_1h_mm = Column(Float, default=0.0)
    rainfall_last_3h_mm = Column(Float, default=0.0)
    rainfall_last_6h_mm = Column(Float, default=0.0)
    
    # Short-term forecast rainfall (mm)
    rainfall_forecast_1h_mm = Column(Float, default=0.0)
    rainfall_forecast_3h_mm = Column(Float, default=0.0)
    rainfall_forecast_6h_mm = Column(Float, default=0.0)
    
    soil_saturation_pct = Column(Float, default=50.0)
    data_source = Column(String(100), default="IMD AWS Demo Feed")
    is_synthetic = Column(Boolean, default=True)

    location = relationship("LocationModel", back_populates="weather_observations")


class CitizenReportModel(Base):
    __tablename__ = "citizen_reports"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    location_id = Column(String(50), ForeignKey("locations.id"), nullable=True)
    location_name = Column(String(150), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    water_depth_level = Column(String(50), nullable=False) # Ankle deep, Knee deep, Waist deep, Submerged road
    traffic_impact = Column(String(50), nullable=False)    # Normal, Slow moving, Single lane blocked, Completely stranded
    description = Column(Text, nullable=False)
    reporter_name = Column(String(100), default="Citizen Reporter")
    image_path = Column(String(255), nullable=True)
    status = Column(String(30), default="Unverified", nullable=False, index=True) # Unverified, Under review, Corroborated, Verified, Rejected
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    reviewed_by = Column(String(100), nullable=True)
    reviewer_notes = Column(Text, nullable=True)
    is_corroborated = Column(Boolean, default=False)

    location = relationship("LocationModel", back_populates="reports")
