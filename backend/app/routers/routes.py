from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter
from ..schemas import RouteAssessmentRequest, RouteAssessmentResponse, RouteOption

router = APIRouter(prefix="/routes", tags=["Route Assessment"])

PRESET_CORRIDORS = {
    ("Swargate", "Pune Station"): [
        {
            "route_id": "route-swg-ps-1",
            "name": "Direct Route via Shivaji Road & Alka Talkies Basin",
            "summary": "Fastest straight corridor along Shivaji Road through Alka Talkies junction.",
            "distance_km": 5.4,
            "estimated_time_mins": 26,
            "overall_risk_category": "High",
            "max_risk_score": 0.81,
            "affected_hotspots": ["Alka Talkies Chowk (Sambhaji Bridge)", "Swargate Chowk"],
            "cautious_advice": "CAUTION: Traverses Mutha riverbank basin near Alka Talkies. Roadway prone to sudden surface flooding.",
            "waypoints": [
                [18.5018, 73.8586], # Swargate
                [18.5100, 73.8500],
                [18.5158, 73.8443], # Alka Talkies Chowk
                [18.5200, 73.8600],
                [18.5284, 73.8744]  # Pune Station
            ]
        },
        {
            "route_id": "route-swg-ps-2",
            "name": "Alternative via Nehru Road & Timber Market Corridor",
            "summary": "Cautious alternative bypassing riverside low-lying underpasses.",
            "distance_km": 6.2,
            "estimated_time_mins": 29,
            "overall_risk_category": "Moderate",
            "max_risk_score": 0.44,
            "affected_hotspots": ["Swargate Peripheral Ramp"],
            "cautious_advice": "SAFER CONTINGENCY: Slightly longer distance but maintains higher topographic elevation and avoids depressed subway submersions.",
            "waypoints": [
                [18.5018, 73.8586], # Swargate
                [18.5060, 73.8660],
                [18.5130, 73.8720],
                [18.5210, 73.8730],
                [18.5284, 73.8744]  # Pune Station
            ]
        }
    ],
    ("Baner", "Shivajinagar"): [
        {
            "route_id": "route-bnr-shv-1",
            "name": "Via University Road & Shivajinagar Subway",
            "summary": "Standard arterial route through SPPU Ganeshkhind Road into Shivajinagar.",
            "distance_km": 7.8,
            "estimated_time_mins": 32,
            "overall_risk_category": "Severe",
            "max_risk_score": 0.89,
            "affected_hotspots": ["Shivajinagar Railway Underpass", "Baner High Street"],
            "cautious_advice": "WARNING: Route terminates directly at Shivajinagar Underpass which has severe reported waterlogging (> 45cm) and stranded vehicles.",
            "waypoints": [
                [18.5590, 73.7868], # Baner
                [18.5530, 73.8050], # Aundh
                [18.5400, 73.8280], # University
                [18.5314, 73.8446]  # Shivajinagar Underpass
            ]
        },
        {
            "route_id": "route-bnr-shv-2",
            "name": "Via Pashan - Senapati Bapat Road Flyover Loop",
            "summary": "Higher elevation bypass avoiding the railway underpass depression.",
            "distance_km": 9.1,
            "estimated_time_mins": 36,
            "overall_risk_category": "Moderate",
            "max_risk_score": 0.42,
            "affected_hotspots": ["Baner High Street (Curb pooling)"],
            "cautious_advice": "ADVISED CAUTIOUS ROUTE: Bypasses the rail underpass basin entirely by staying on elevated flyover ramps towards FC Road.",
            "waypoints": [
                [18.5590, 73.7868], # Baner
                [18.5380, 73.7920], # Pashan
                [18.5300, 73.8290], # SB Road
                [18.5240, 73.8420]  # FC Road / Shivajinagar Upper
            ]
        }
    ],
    ("Kothrud", "Pune Camp"): [
        {
            "route_id": "route-kth-cmp-1",
            "name": "Via Karve Road & Sambhaji Bridge",
            "summary": "Direct path across river channel into central Pune camp.",
            "distance_km": 8.3,
            "estimated_time_mins": 35,
            "overall_risk_category": "High",
            "max_risk_score": 0.78,
            "affected_hotspots": ["Alka Talkies Chowk", "Camp MG Road"],
            "cautious_advice": "CAUTION: Sambhaji bridge approach is flagged with high waterlogging risk. Slow traffic anticipated.",
            "waypoints": [
                [18.5074, 73.8077], # Kothrud
                [18.5090, 73.8280], # Karve Road
                [18.5158, 73.8443], # Alka Talkies
                [18.5132, 73.8770]  # Pune Camp
            ]
        },
        {
            "route_id": "route-kth-cmp-2",
            "name": "Via Law College Road - Senapati Bapat - Bund Garden",
            "summary": "Perimeter loop maintaining hillside elevation.",
            "distance_km": 10.2,
            "estimated_time_mins": 39,
            "overall_risk_category": "Moderate",
            "max_risk_score": 0.38,
            "affected_hotspots": ["Camp MG Road (Minor curb runoff)"],
            "cautious_advice": "PREFERRED CONTINGENCY: Avoids low-lying river subways; exhibits clear gradient drainage along hill base.",
            "waypoints": [
                [18.5074, 73.8077], # Kothrud
                [18.5180, 73.8290], # Law College Road
                [18.5320, 73.8510], # Sancheti
                [18.5132, 73.8770]  # Pune Camp
            ]
        }
    ]
}

@router.post("/assess", response_model=RouteAssessmentResponse)
def assess_candidate_routes(payload: RouteAssessmentRequest):
    """
    Experimental route risk comparison evaluating candidate corridors against waterlogging risk.
    Explicitly labeled as experimental decision support; does not guarantee safety.
    """
    key = (payload.origin, payload.destination)
    routes = PRESET_CORRIDORS.get(key)
    
    # Fallback to Swargate -> Pune Station if custom or unknown
    if not routes:
        routes = PRESET_CORRIDORS[("Swargate", "Pune Station")]
        actual_origin = "Swargate (Default Corridor)"
        actual_dest = "Pune Station (Default Corridor)"
    else:
        actual_origin = payload.origin
        actual_dest = payload.destination

    return RouteAssessmentResponse(
        origin=actual_origin,
        destination=actual_dest,
        forecast_horizon=payload.forecast_horizon,
        disclaimer="EXPERIMENTAL ROUTE ASSESSMENT: Model recommendations are based on illustrative catchment heuristics. Road safety is NOT guaranteed. Drivers must obey local police cordons and never attempt to cross submerged streets.",
        routes=routes,
        timestamp=datetime.utcnow()
    )
