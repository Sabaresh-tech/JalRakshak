from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .models import LocationModel, WeatherObservationModel, CitizenReportModel

PUNE_LOCATIONS = [
    {
        "id": "PUNE-LOC-01",
        "name": "Alka Talkies Chowk (Sambhaji Bridge)",
        "zone": "Deccan Gymkhana",
        "latitude": 18.5158,
        "longitude": 73.8443,
        "elevation_m": 548.5,
        "slope_pct": 0.8,
        "drainage_capacity_score": 3.2,
        "impervious_surface_pct": 88.0,
        "historical_incident_count": 14,
        "critical_infrastructure_nearby": "Major Transit Junction, Riverbank Access",
        "population_density_index": 0.92,
        "road_type": "Major Junction Basin",
        "description": "Low-lying basin right beside the Mutha river channel. High vulnerability to river backflow and stormwater runoff pooling during heavy monsoon spells."
    },
    {
        "id": "PUNE-LOC-02",
        "name": "Shivajinagar Railway Underpass",
        "zone": "Shivajinagar",
        "latitude": 18.5314,
        "longitude": 73.8446,
        "elevation_m": 542.0,
        "slope_pct": 0.5,
        "drainage_capacity_score": 2.1,
        "impervious_surface_pct": 95.0,
        "historical_incident_count": 22,
        "critical_infrastructure_nearby": "Railway Station, Metro Interchange, Bus Depot",
        "population_density_index": 0.95,
        "road_type": "Depressed Railway Underpass",
        "description": "Severe subterranean railway underpass depression. Chronic waterlogging hotspot that frequently paralyzes central Pune vehicular and bus traffic."
    },
    {
        "id": "PUNE-LOC-03",
        "name": "Swargate Chowk (Jedhe Flyover Underpass)",
        "zone": "Swargate",
        "latitude": 18.5018,
        "longitude": 73.8586,
        "elevation_m": 553.2,
        "slope_pct": 1.1,
        "drainage_capacity_score": 3.8,
        "impervious_surface_pct": 91.0,
        "historical_incident_count": 16,
        "critical_infrastructure_nearby": "MSRTC Central Bus Stand, Metro Terminal",
        "population_density_index": 0.94,
        "road_type": "Major Junction Underpass",
        "description": "Massive suburban commuter hub with complex flyover piers. Silt build-up in roadside catch basins slows water evacuation onto Shivaji Road."
    },
    {
        "id": "PUNE-LOC-04",
        "name": "Yerawada Gunjan Chowk / Nagar Road",
        "zone": "Yerawada",
        "latitude": 18.5529,
        "longitude": 73.8828,
        "elevation_m": 546.0,
        "slope_pct": 0.9,
        "drainage_capacity_score": 4.1,
        "impervious_surface_pct": 84.0,
        "historical_incident_count": 11,
        "critical_infrastructure_nearby": "Yerawada Bridge, Mental Hospital, Ahmednagar Highway",
        "population_density_index": 0.86,
        "road_type": "Arterial Highway Junction",
        "description": "Convergence corridor near Mula-Mutha river. Rain runoff from Golf Course and Yerawada hills accumulates on Ahmednagar arterial route."
    },
    {
        "id": "PUNE-LOC-05",
        "name": "Katraj Chowk & Lake Overflow Channel",
        "zone": "Katraj",
        "latitude": 18.4575,
        "longitude": 73.8677,
        "elevation_m": 585.0,
        "slope_pct": 3.4,
        "drainage_capacity_score": 2.8,
        "impervious_surface_pct": 82.0,
        "historical_incident_count": 19,
        "critical_infrastructure_nearby": "Rajiv Gandhi Zoo, Katraj Ghat Entry, Old Highway",
        "population_density_index": 0.83,
        "road_type": "Ghat Runoff Choke Point",
        "description": "Receives sudden velocity mountain runoff cascading down from Katraj Ghat hills. Narrowed stormwater channels frequently breach capacity."
    },
    {
        "id": "PUNE-LOC-06",
        "name": "Kothrud Chandani Chowk Corridor",
        "zone": "Kothrud",
        "latitude": 18.5074,
        "longitude": 73.8077,
        "elevation_m": 612.0,
        "slope_pct": 4.2,
        "drainage_capacity_score": 6.8,
        "impervious_surface_pct": 74.0,
        "historical_incident_count": 5,
        "critical_infrastructure_nearby": "Mumbai-Bengaluru Highway, Paud Road Connector",
        "population_density_index": 0.78,
        "road_type": "Elevated Grade Arterial",
        "description": "High elevation ridge. Exhibits rapid surface drainage but localized pooling occurs at newly excavated service road transitions."
    },
    {
        "id": "PUNE-LOC-07",
        "name": "Hadapsar Gadital / Solapur Road",
        "zone": "Hadapsar",
        "latitude": 18.5089,
        "longitude": 73.9260,
        "elevation_m": 558.0,
        "slope_pct": 1.2,
        "drainage_capacity_score": 4.5,
        "impervious_surface_pct": 86.0,
        "historical_incident_count": 13,
        "critical_infrastructure_nearby": "Gadital PMPML Bus Depot, Industrial Zone Entry",
        "population_density_index": 0.89,
        "road_type": "Major Industrial Arterial",
        "description": "High vehicle traffic corridor connecting East Pune. Flat terrain causes slow runoff dispersion towards the Bhiroba nala."
    },
    {
        "id": "PUNE-LOC-08",
        "name": "Baner High Street / Balewadi Phata",
        "zone": "Baner-Balewadi",
        "latitude": 18.5590,
        "longitude": 73.7868,
        "elevation_m": 564.0,
        "slope_pct": 1.6,
        "drainage_capacity_score": 3.9,
        "impervious_surface_pct": 89.0,
        "historical_incident_count": 12,
        "critical_infrastructure_nearby": "IT Commercial Hub, Balewadi Sports Complex",
        "population_density_index": 0.84,
        "road_type": "Commercial Corridor",
        "description": "Rapid commercial paving has enclosed historical stormwater streams. Heavy cloudbursts cause ankle-to-knee waterlogging across retail lanes."
    },
    {
        "id": "PUNE-LOC-09",
        "name": "Pune Railway Station (Malkam Chowk)",
        "zone": "Central Pune",
        "latitude": 18.5284,
        "longitude": 73.8744,
        "elevation_m": 555.0,
        "slope_pct": 0.7,
        "drainage_capacity_score": 3.4,
        "impervious_surface_pct": 96.0,
        "historical_incident_count": 18,
        "critical_infrastructure_nearby": "Main Railway Junction, Divisional Railway Office",
        "population_density_index": 0.98,
        "road_type": "Dense Transit Terminal",
        "description": "Dense passenger and auto-rickshaw zone. Subway underpass and peripheral pickup bays trap surface water during sustained rainfall."
    },
    {
        "id": "PUNE-LOC-10",
        "name": "Koregaon Park North Main Road (Lane 1-4)",
        "zone": "Koregaon Park",
        "latitude": 18.5362,
        "longitude": 73.8940,
        "elevation_m": 549.0,
        "slope_pct": 1.0,
        "drainage_capacity_score": 5.2,
        "impervious_surface_pct": 72.0,
        "historical_incident_count": 7,
        "critical_infrastructure_nearby": "Mula-Mutha Bund Garden, Osho Ashram",
        "population_density_index": 0.71,
        "road_type": "Tree-lined Avenue",
        "description": "Gentle gradient with canopy cover, but low-elevation sections bordering Bund Garden riverbed suffer backup when dam gates are discharged."
    },
    {
        "id": "PUNE-LOC-11",
        "name": "Viman Nagar Symbiosis Chowk",
        "zone": "Viman Nagar",
        "latitude": 18.5679,
        "longitude": 73.9143,
        "elevation_m": 570.0,
        "slope_pct": 1.4,
        "drainage_capacity_score": 4.8,
        "impervious_surface_pct": 85.0,
        "historical_incident_count": 8,
        "critical_infrastructure_nearby": "Pune Airport Approach, Symbiosis Campus",
        "population_density_index": 0.85,
        "road_type": "Institutional Corridor",
        "description": "Localized water logging caused by choked culverts along the airport perimeter boundary wall during intense rain bursts."
    },
    {
        "id": "PUNE-LOC-12",
        "name": "Dhanori Bhairav Nagar (Porwal Road)",
        "zone": "Dhanori",
        "latitude": 18.5910,
        "longitude": 73.8872,
        "elevation_m": 574.0,
        "slope_pct": 1.8,
        "drainage_capacity_score": 2.9,
        "impervious_surface_pct": 79.0,
        "historical_incident_count": 15,
        "critical_infrastructure_nearby": "Residential Outskirts, Tingre Nagar Culvert",
        "population_density_index": 0.80,
        "road_type": "Suburban Arterial Road",
        "description": "Under-dimensioned roadside open drains choked with construction debris. Frequently overflows onto vehicular lanes."
    },
    {
        "id": "PUNE-LOC-13",
        "name": "Sinhagad Road Manikbaug / Anand Nagar",
        "zone": "Sinhagad Road",
        "latitude": 18.4837,
        "longitude": 73.8242,
        "elevation_m": 552.0,
        "slope_pct": 0.9,
        "drainage_capacity_score": 3.1,
        "impervious_surface_pct": 87.0,
        "historical_incident_count": 20,
        "critical_infrastructure_nearby": "Mutha River Floodplain, Khadakwasla Canal Channel",
        "population_density_index": 0.91,
        "road_type": "Dense Riverfront Corridor",
        "description": "Extremely vulnerable when Khadakwasla dam releases water into Mutha river. River water backflows into society access roads."
    },
    {
        "id": "PUNE-LOC-14",
        "name": "Bavdhan NDA Road & Highway Underpass",
        "zone": "Bavdhan",
        "latitude": 18.5126,
        "longitude": 73.7742,
        "elevation_m": 598.0,
        "slope_pct": 2.8,
        "drainage_capacity_score": 5.5,
        "impervious_surface_pct": 68.0,
        "historical_incident_count": 6,
        "critical_infrastructure_nearby": "NDA Main Gate Highway Access",
        "population_density_index": 0.65,
        "road_type": "Semi-Urban Highway Ramp",
        "description": "Runoff from surrounding hills drains toward the highway culvert. Generally manageable except during sustained rain over 40mm/h."
    },
    {
        "id": "PUNE-LOC-15",
        "name": "Aundh Parihar Chowk / DP Road",
        "zone": "Aundh",
        "latitude": 18.5583,
        "longitude": 73.8075,
        "elevation_m": 557.0,
        "slope_pct": 1.5,
        "drainage_capacity_score": 6.2,
        "impervious_surface_pct": 80.0,
        "historical_incident_count": 7,
        "critical_infrastructure_nearby": "Chest Hospital, Bremen Circle",
        "population_density_index": 0.82,
        "road_type": "Commercial Plaza Junction",
        "description": "Recent smart city stormwater upgrades have mitigated chronic deep flooding, though minor curb pooling persists during heavy downpours."
    },
    {
        "id": "PUNE-LOC-16",
        "name": "Camp MG Road / Babajan Chowk",
        "zone": "Pune Cantonment",
        "latitude": 18.5132,
        "longitude": 73.8770,
        "elevation_m": 562.0,
        "slope_pct": 1.3,
        "drainage_capacity_score": 4.6,
        "impervious_surface_pct": 92.0,
        "historical_incident_count": 9,
        "critical_infrastructure_nearby": "Sassoon Hospital Vicinity, Cantonment Board",
        "population_density_index": 0.88,
        "road_type": "Heritage Commercial Street",
        "description": "Historic British cantonment drainage layout. Low gradient and high pedestrian density lead to surface water pooling along shopping curbs."
    },
    {
        "id": "PUNE-LOC-17",
        "name": "Warje Flyover Chowk (Mai Mangeshkar)",
        "zone": "Warje",
        "latitude": 18.4844,
        "longitude": 73.7995,
        "elevation_m": 560.0,
        "slope_pct": 2.2,
        "drainage_capacity_score": 4.2,
        "impervious_surface_pct": 84.0,
        "historical_incident_count": 10,
        "critical_infrastructure_nearby": "Mai Mangeshkar Hospital, Pune-Bengaluru Bypass",
        "population_density_index": 0.85,
        "road_type": "Highway Flyover Node",
        "description": "Service roads beneath the bypass flyover channel water directly towards the hospital approach intersection."
    },
    {
        "id": "PUNE-LOC-18",
        "name": "PCMC Nashik Phata Multimodal Hub",
        "zone": "Pimpri-Chinchwad",
        "latitude": 18.6019,
        "longitude": 73.8223,
        "elevation_m": 550.0,
        "slope_pct": 0.8,
        "drainage_capacity_score": 3.7,
        "impervious_surface_pct": 90.0,
        "historical_incident_count": 14,
        "critical_infrastructure_nearby": "Bhosari Metro Terminal, Kasarwadi Rail Bridge",
        "population_density_index": 0.90,
        "road_type": "Multimodal Transit Flyover",
        "description": "Sprawling junction over Pavana river basin. Pavement runoff converges at ground-level ramps creating vehicle stalling risks."
    }
]

# Realistic simulated weather data variations (reflecting Pune monsoon conditions)
WEATHER_PROFILES = {
    "PUNE-LOC-01": {"r1": 24.5, "r3": 54.0, "r6": 78.5, "fc1": 18.0, "fc3": 38.0, "fc6": 65.0, "sat": 82.0},
    "PUNE-LOC-02": {"r1": 28.0, "r3": 62.0, "r6": 89.0, "fc1": 22.0, "fc3": 44.0, "fc6": 72.0, "sat": 88.0},
    "PUNE-LOC-03": {"r1": 22.0, "r3": 48.5, "r6": 66.0, "fc1": 16.5, "fc3": 32.0, "fc6": 55.0, "sat": 78.0},
    "PUNE-LOC-04": {"r1": 18.5, "r3": 39.0, "r6": 58.0, "fc1": 14.0, "fc3": 28.0, "fc6": 48.0, "sat": 74.0},
    "PUNE-LOC-05": {"r1": 32.0, "r3": 68.0, "r6": 94.0, "fc1": 25.0, "fc3": 50.0, "fc6": 80.0, "sat": 91.0},
    "PUNE-LOC-06": {"r1": 12.0, "r3": 24.0, "r6": 36.0, "fc1": 8.0, "fc3": 16.0, "fc6": 28.0, "sat": 58.0},
    "PUNE-LOC-07": {"r1": 16.0, "r3": 34.0, "r6": 49.0, "fc1": 12.0, "fc3": 24.0, "fc6": 40.0, "sat": 69.0},
    "PUNE-LOC-08": {"r1": 21.0, "r3": 46.0, "r6": 65.0, "fc1": 17.0, "fc3": 34.0, "fc6": 58.0, "sat": 77.0},
    "PUNE-LOC-09": {"r1": 23.5, "r3": 51.0, "r6": 72.0, "fc1": 19.0, "fc3": 36.0, "fc6": 60.0, "sat": 80.0},
    "PUNE-LOC-10": {"r1": 11.0, "r3": 22.0, "r6": 34.0, "fc1": 9.0, "fc3": 18.0, "fc6": 30.0, "sat": 62.0},
    "PUNE-LOC-11": {"r1": 14.5, "r3": 29.0, "r6": 42.0, "fc1": 10.5, "fc3": 21.0, "fc6": 35.0, "sat": 64.0},
    "PUNE-LOC-12": {"r1": 20.0, "r3": 43.0, "r6": 61.0, "fc1": 15.0, "fc3": 31.0, "fc6": 52.0, "sat": 75.0},
    "PUNE-LOC-13": {"r1": 29.0, "r3": 64.0, "r6": 88.0, "fc1": 24.0, "fc3": 48.0, "fc6": 76.0, "sat": 89.0},
    "PUNE-LOC-14": {"r1": 9.0, "r3": 18.0, "r6": 27.0, "fc1": 6.0, "fc3": 13.0, "fc6": 22.0, "sat": 52.0},
    "PUNE-LOC-15": {"r1": 13.0, "r3": 27.0, "r6": 39.0, "fc1": 10.0, "fc3": 20.0, "fc6": 33.0, "sat": 60.0},
    "PUNE-LOC-16": {"r1": 17.0, "r3": 35.0, "r6": 50.0, "fc1": 13.0, "fc3": 25.0, "fc6": 42.0, "sat": 71.0},
    "PUNE-LOC-17": {"r1": 19.5, "r3": 41.0, "r6": 59.0, "fc1": 14.5, "fc3": 29.0, "fc6": 47.0, "sat": 73.0},
    "PUNE-LOC-18": {"r1": 22.0, "r3": 47.0, "r6": 67.0, "fc1": 18.0, "fc3": 35.0, "fc6": 57.0, "sat": 79.0},
}

INITIAL_CITIZEN_REPORTS = [
    {
        "location_id": "PUNE-LOC-01",
        "location_name": "Alka Talkies Chowk (Sambhaji Bridge)",
        "latitude": 18.5158,
        "longitude": 73.8443,
        "water_depth_level": "Knee deep (15-45cm)",
        "traffic_impact": "Single lane blocked",
        "description": "Stormwater regurgitating through curb catchments near riverside turn. Two-wheelers dragging feet and slipping.",
        "reporter_name": "Siddharth K.",
        "status": "Corroborated",
        "created_at": datetime.utcnow() - timedelta(minutes=45),
        "is_corroborated": True,
        "reviewed_by": "PMC Ward Inspector (Demo)",
        "reviewer_notes": "Corroborated by CCTV feed and field squad dispatch."
    },
    {
        "location_id": "PUNE-LOC-02",
        "name": "Shivajinagar Railway Underpass",
        "latitude": 18.5314,
        "longitude": 73.8446,
        "water_depth_level": "Waist deep (> 45cm)",
        "traffic_impact": "Completely stranded",
        "description": "Subway water depth over 2.5 feet. A PMPML bus and private car stalled under the tracks. Complete road blockade.",
        "reporter_name": "Pooja Deshmukh",
        "status": "Under review",
        "created_at": datetime.utcnow() - timedelta(minutes=25),
        "is_corroborated": False,
        "reviewed_by": "PMC Central Control Room (Demo)",
        "reviewer_notes": "Dewatering suction team alerted. Verification in progress."
    },
    {
        "location_id": "PUNE-LOC-03",
        "name": "Swargate Chowk (Jedhe Flyover Underpass)",
        "latitude": 18.5018,
        "longitude": 73.8586,
        "water_depth_level": "Ankle deep (< 15cm)",
        "traffic_impact": "Slow moving",
        "description": "Water logging along Shivaji road corner. Pedestrians unable to reach PMPML bus bays safely.",
        "reporter_name": "Amit Shinde",
        "status": "Unverified",
        "created_at": datetime.utcnow() - timedelta(minutes=15),
        "is_corroborated": False,
        "reviewed_by": None,
        "reviewer_notes": None
    },
    {
        "location_id": "PUNE-LOC-05",
        "name": "Katraj Chowk & Lake Overflow Channel",
        "latitude": 18.4575,
        "longitude": 73.8677,
        "water_depth_level": "Knee deep (15-45cm)",
        "traffic_impact": "Single lane blocked",
        "description": "Heavy runoff stream descending from ghats. Drain grill blocked with plastic silt.",
        "reporter_name": "Rohan Gaikwad",
        "status": "Corroborated",
        "created_at": datetime.utcnow() - timedelta(hours=1, minutes=10),
        "is_corroborated": True,
        "reviewed_by": "PMC Disaster Cell (Demo)",
        "reviewer_notes": "Municipal sanitary team cleared 40% grill silt."
    },
    {
        "location_id": "PUNE-LOC-08",
        "name": "Baner High Street / Balewadi Phata",
        "latitude": 18.5590,
        "longitude": 73.7868,
        "water_depth_level": "Ankle deep (< 15cm)",
        "traffic_impact": "Slow moving",
        "description": "Water accumulation in front of retail plazas. Pedestrian crosswalk submerged.",
        "reporter_name": "Sneha Joshi",
        "status": "Unverified",
        "created_at": datetime.utcnow() - timedelta(minutes=35),
        "is_corroborated": False,
        "reviewed_by": None,
        "reviewer_notes": None
    },
    {
        "location_id": "PUNE-LOC-04",
        "name": "Yerawada Gunjan Chowk / Nagar Road",
        "latitude": 18.5529,
        "longitude": 73.8828,
        "water_depth_level": "Knee deep (15-45cm)",
        "traffic_impact": "Slow moving",
        "description": "Severe sheet flow across highway turn heading towards airport. Verified by traffic police warden.",
        "reporter_name": "Warden Patil (Traffic Branch)",
        "status": "Verified",
        "created_at": datetime.utcnow() - timedelta(hours=2),
        "is_corroborated": True,
        "reviewed_by": "Traffic Police Control (Demo)",
        "reviewer_notes": "Official traffic branch field report."
    },
    {
        "location_id": "PUNE-LOC-06",
        "name": "Kothrud Chandani Chowk Corridor",
        "latitude": 18.5074,
        "longitude": 73.8077,
        "water_depth_level": "Ankle deep (< 15cm)",
        "traffic_impact": "Normal",
        "description": "Claims flyover is drowning in 4 feet water. CCTV confirms road is completely clear and dry.",
        "reporter_name": "Anonymous",
        "status": "Rejected",
        "created_at": datetime.utcnow() - timedelta(hours=3),
        "is_corroborated": False,
        "reviewed_by": "Demo Reviewer",
        "reviewer_notes": "Rejected: Inconsistent with CCTV telemetry. No standing water."
    }
]

def seed_database(db: Session):
    """Seed initial Pune locations, weather observations, and citizen reports if empty."""
    # Check if already seeded
    existing_locations_count = db.query(LocationModel).count()
    if existing_locations_count > 0:
        return

    # 1. Insert Locations
    for loc_data in PUNE_LOCATIONS:
        loc = LocationModel(**loc_data)
        db.add(loc)
    db.commit()

    # 2. Insert Weather Observations
    now = datetime.utcnow()
    for loc_id, weather in WEATHER_PROFILES.items():
        obs = WeatherObservationModel(
            location_id=loc_id,
            timestamp=now - timedelta(minutes=10),
            rainfall_last_1h_mm=weather["r1"],
            rainfall_last_3h_mm=weather["r3"],
            rainfall_last_6h_mm=weather["r6"],
            rainfall_forecast_1h_mm=weather["fc1"],
            rainfall_forecast_3h_mm=weather["fc3"],
            rainfall_forecast_6h_mm=weather["fc6"],
            soil_saturation_pct=weather["sat"],
            data_source="IMD AWS Demo Feed (Pune IMD Station)",
            is_synthetic=True
        )
        db.add(obs)
    db.commit()

    # 3. Insert Initial Citizen Reports
    for r in INITIAL_CITIZEN_REPORTS:
        loc_name = r.get("location_name") or r.get("name", "Pune Location")
        report = CitizenReportModel(
            location_id=r["location_id"],
            location_name=loc_name,
            latitude=r["latitude"],
            longitude=r["longitude"],
            water_depth_level=r["water_depth_level"],
            traffic_impact=r["traffic_impact"],
            description=r["description"],
            reporter_name=r["reporter_name"],
            status=r["status"],
            created_at=r["created_at"],
            updated_at=r["created_at"],
            reviewed_by=r.get("reviewed_by"),
            reviewer_notes=r.get("reviewer_notes"),
            is_corroborated=r.get("is_corroborated", False)
        )
        db.add(report)
    db.commit()
