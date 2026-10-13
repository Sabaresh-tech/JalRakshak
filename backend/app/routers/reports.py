import os
import uuid
import math
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import CitizenReportModel, LocationModel
from ..schemas import CitizenReportResponse, CitizenReportCreate, CitizenReportStatusUpdate
from ..config import settings

router = APIRouter(prefix="/reports", tags=["Citizen Reports"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 # 5 MB

VALID_STATUSES = {"Unverified", "Under review", "Corroborated", "Verified", "Rejected"}

def _haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000 # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def _check_proximity_warning(report: CitizenReportModel, all_recent_reports: List[CitizenReportModel]) -> Optional[str]:
    for other in all_recent_reports:
        if other.id != report.id:
            dist = _haversine_distance_m(report.latitude, report.longitude, other.latitude, other.longitude)
            if dist < 350.0:
                time_diff_mins = abs(int((report.created_at - other.created_at).total_seconds() / 60))
                if time_diff_mins < 180:
                    return f"Cluster Alert: Another incident reported {int(dist)}m away ({time_diff_mins} mins apart)."
    return None

@router.get("", response_model=List[CitizenReportResponse])
def get_reports(
    status_filter: Optional[str] = Query(None, alias="status"),
    location_id: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db)
):
    """Retrieve citizen waterlogging reports with proximity warnings."""
    query = db.query(CitizenReportModel)
    if status_filter:
        query = query.filter(CitizenReportModel.status == status_filter)
    if location_id:
        query = query.filter(CitizenReportModel.location_id == location_id)
        
    reports = query.order_by(CitizenReportModel.created_at.desc()).limit(limit).all()

    # Collect recent reports to compute clustering proximity alerts
    recent_cutoff = datetime.utcnow() - timedelta(hours=6)
    recent_reports = db.query(CitizenReportModel).filter(CitizenReportModel.created_at >= recent_cutoff).all()

    response = []
    for r in reports:
        prox = _check_proximity_warning(r, recent_reports)
        res = CitizenReportResponse.model_validate(r)
        res.proximity_warning = prox
        response.append(res)

    return response

@router.post("", response_model=CitizenReportResponse, status_code=status.HTTP_201_CREATED)
def submit_citizen_report(
    report_in: CitizenReportCreate,
    db: Session = Depends(get_db)
):
    """
    Submit a citizen waterlogging report.
    Guaranteed: Always starts with status 'Unverified'.
    """
    # If location_id provided, verify or grab name
    loc_name = report_in.location_name
    if report_in.location_id:
        loc = db.query(LocationModel).filter(LocationModel.id == report_in.location_id).first()
        if loc and not loc_name:
            loc_name = loc.name

    new_report = CitizenReportModel(
        location_id=report_in.location_id,
        location_name=loc_name,
        latitude=report_in.latitude,
        longitude=report_in.longitude,
        water_depth_level=report_in.water_depth_level,
        traffic_impact=report_in.traffic_impact,
        description=report_in.description.strip(),
        reporter_name=report_in.reporter_name or "Citizen Reporter",
        status="Unverified", # MANDATORY REQUIREMENT: starts as Unverified
        is_corroborated=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    # Check for proximity alert against existing reports
    recent_cutoff = datetime.utcnow() - timedelta(hours=4)
    recent_reports = db.query(CitizenReportModel).filter(CitizenReportModel.created_at >= recent_cutoff).all()
    prox = _check_proximity_warning(new_report, recent_reports)

    res = CitizenReportResponse.model_validate(new_report)
    res.proximity_warning = prox
    return res

@router.post("/upload-image")
async def upload_report_image(file: UploadFile = File(...)):
    """
    Secure file upload endpoint.
    Restricts allowed extensions (jpg, png, webp) and file sizes (< 5MB).
    Never exposes internal system file paths.
    """
    # Check extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{ext}'. Allowed image formats: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Read contents with size check
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of 5 MB (received {len(contents) / (1024*1024):.1f} MB)."
        )

    # Generate safe random filename
    safe_filename = f"{uuid.uuid4().hex}{ext}"
    dest_path = settings.UPLOAD_DIR / safe_filename

    with open(dest_path, "wb") as f:
        f.write(contents)

    # Return safe public URL path
    return {"image_url": f"/uploads/{safe_filename}", "filename": safe_filename}

@router.patch("/{report_id}/status", response_model=CitizenReportResponse)
def update_report_status(
    report_id: int,
    status_update: CitizenReportStatusUpdate,
    db: Session = Depends(get_db)
):
    """
    Demo Reviewer status update endpoint.
    Allowed transitions: Unverified, Under review, Corroborated, Verified, Rejected.
    """
    if status_update.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{status_update.status}'. Allowed statuses: {', '.join(VALID_STATUSES)}"
        )

    report = db.query(CitizenReportModel).filter(CitizenReportModel.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID {report_id} not found."
        )

    report.status = status_update.status
    report.reviewed_by = status_update.reviewed_by or "Demo Reviewer"
    report.reviewer_notes = status_update.reviewer_notes
    report.updated_at = datetime.utcnow()
    report.is_corroborated = status_update.status in ["Corroborated", "Verified"]

    db.commit()
    db.refresh(report)

    return CitizenReportResponse.model_validate(report)
