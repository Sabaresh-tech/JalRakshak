import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.seed_data import seed_database

@pytest.fixture(scope="module")
def client():
    # Ensure database initialized and seeded
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    db.close()
    
    with TestClient(app) as c:
        yield c

def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database_connected"] is True
    assert data["model_initialized"] is True
    assert data["is_demo_mode"] is True

def test_get_locations(client):
    response = client.get("/api/locations")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 15
    loc = data[0]
    assert "id" in loc
    assert "name" in loc
    assert "latitude" in loc
    assert "longitude" in loc
    assert "elevation_m" in loc

def test_get_single_location(client):
    response = client.get("/api/locations/PUNE-LOC-01")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "PUNE-LOC-01"
    assert "Alka Talkies" in data["name"]

def test_get_single_location_not_found(client):
    response = client.get("/api/locations/NON-EXISTENT-ID")
    assert response.status_code == 404

def test_risk_predictions(client):
    response = client.get("/api/risk-predictions?horizon=1h")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    first = data[0]
    assert first["risk_category"] in ["Low", "Moderate", "High", "Severe"]
    assert 0.0 <= first["estimated_risk_score"] <= 1.0
    assert first["forecast_horizon"] == "1h"
    assert len(first["contributing_factors"]) > 0
    assert "disclaimer" in first
    assert first["is_demo_estimate"] is True

def test_risk_predictions_filter(client):
    response = client.get("/api/risk-predictions?horizon=3h&risk_level=Severe")
    assert response.status_code == 200
    data = response.json()
    for item in data:
        assert item["risk_category"] == "Severe"

def test_citizen_report_submission_and_unverified_status(client):
    payload = {
        "location_id": "PUNE-LOC-02",
        "location_name": "Shivajinagar Railway Underpass",
        "latitude": 18.5314,
        "longitude": 73.8446,
        "water_depth_level": "Waist deep (> 45cm)",
        "traffic_impact": "Completely stranded",
        "description": "Water reached front hood of small hatchback near subway.",
        "reporter_name": "Test Commuter"
    }
    response = client.post("/api/reports", json=payload)
    assert response.status_code == 201
    data = response.json()
    # CRITICAL MASTER PROMPT REQUIREMENT: new reports must remain Unverified
    assert data["status"] == "Unverified"
    assert data["is_corroborated"] is False
    assert data["id"] is not None
    
    # Store report_id for review test
    report_id = data["id"]

    # Verify review status workflow
    patch_payload = {
        "status": "Under review",
        "reviewed_by": "PMC Demo Supervisor",
        "reviewer_notes": "Assigned to Ward Patrol 4"
    }
    patch_resp = client.patch(f"/api/reports/{report_id}/status", json=patch_payload)
    assert patch_resp.status_code == 200
    patch_data = patch_resp.json()
    assert patch_data["status"] == "Under review"
    assert patch_data["reviewed_by"] == "PMC Demo Supervisor"

    # Corroborate report
    corrob_payload = {
        "status": "Corroborated",
        "reviewed_by": "PMC Field Unit",
        "reviewer_notes": "Water depth verified at 48cm"
    }
    corrob_resp = client.patch(f"/api/reports/{report_id}/status", json=corrob_payload)
    assert corrob_resp.status_code == 200
    assert corrob_resp.json()["status"] == "Corroborated"
    assert corrob_resp.json()["is_corroborated"] is True

def test_inspection_priorities(client):
    response = client.get("/api/inspection-priorities")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    # Check that rank is 1-indexed and in ascending order
    assert data[0]["rank"] == 1
    assert data[0]["priority_score"] >= data[-1]["priority_score"]
    assert len(data[0]["reasons"]) > 0
    assert data[0]["suggested_action"] != ""

def test_data_status(client):
    response = client.get("/api/data-status")
    assert response.status_code == 200
    data = response.json()
    assert data["is_demo_environment"] is True
    assert len(data["active_sources"]) >= 4
    assert len(data["quality_checks"]) >= 3

def test_model_info(client):
    response = client.get("/api/model-info")
    assert response.status_code == 200
    data = response.json()
    assert data["is_demo_model"] is True
    assert len(data["features"]) >= 7
    assert len(data["known_limitations"]) >= 4
    assert len(data["pipeline_stages"]) == 6

def test_route_assessment(client):
    payload = {
        "origin": "Swargate",
        "destination": "Pune Station",
        "forecast_horizon": "1h"
    }
    response = client.post("/api/routes/assess", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["routes"]) >= 2
    assert "EXPERIMENTAL" in data["disclaimer"]
    for r in data["routes"]:
        assert len(r["waypoints"]) >= 2
        assert r["overall_risk_category"] in ["Low", "Moderate", "High", "Severe"]
