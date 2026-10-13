from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import LocationModel
from ..schemas import LocationResponse

router = APIRouter(prefix="/locations", tags=["Locations"])

@router.get("", response_model=List[LocationResponse])
def get_all_locations(db: Session = Depends(get_db)):
    """Retrieve all monitored road locations and stormwater basins in Pune."""
    locations = db.query(LocationModel).order_by(LocationModel.name.asc()).all()
    return locations

@router.get("/{location_id}", response_model=LocationResponse)
def get_location_by_id(location_id: str, db: Session = Depends(get_db)):
    """Retrieve details for a specific location."""
    loc = db.query(LocationModel).filter(LocationModel.id == location_id).first()
    if not loc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location with ID '{location_id}' not found."
        )
    return loc
