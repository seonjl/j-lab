"""
Voter Reach API Endpoints
Subway station ridership + voter turnout analysis for campaign optimization
"""
import json
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

router = APIRouter()

# Data files path
# __file__ = .../npfs/apps/ml-api/routers/voter_reach.py
# For deployment, data is in apps/ml-api/data/
DATA_DIR = Path(__file__).parent.parent / "data"


# =============================================================================
# Pydantic Models
# =============================================================================

class Station(BaseModel):
    """Subway station model"""
    id: str
    name: str
    line: str
    lat: float
    lng: float
    gu: Optional[str] = None


class RidershipData(BaseModel):
    """Hourly ridership data model"""
    station_id: str
    station_name: str
    hour: int
    avg_boarding: float
    avg_alighting: float
    total: Optional[float] = None


class ElectionData(BaseModel):
    """Election/voter data by district"""
    district: str
    total_voters: int
    total_votes: int
    turnout_rate: float


class OptimizeRequest(BaseModel):
    """Request body for optimization endpoint"""
    target_hour: int = Field(..., ge=0, le=23, description="Target hour (0-23)")
    top_n: int = Field(default=10, ge=1, le=100, description="Number of top stations to return")
    gu: Optional[str] = Field(default=None, description="Filter by administrative district (gu)")
    electoral_district: Optional[str] = Field(default=None, description="Filter by electoral district")


class DistrictInfo(BaseModel):
    """District information model"""
    gu: str
    electoral_districts: list[str]
    center: dict
    bounds: dict


class StationRecommendation(BaseModel):
    """Optimized station recommendation"""
    station_id: str
    station_name: str
    lat: float
    lng: float
    hour: int
    score: float
    ridership: float
    reason: str
    gu: Optional[str] = None
    turnout_rate: Optional[float] = None


class OptimizeResponse(BaseModel):
    """Response for optimization endpoint"""
    recommendations: list[StationRecommendation]


class HeatmapPoint(BaseModel):
    """Heatmap data point"""
    lat: float
    lng: float
    weight: float


# =============================================================================
# Helper Functions
# =============================================================================

def load_json_file(filename: str) -> list | dict | None:
    """Load JSON file, return None if not found"""
    filepath = DATA_DIR / filename
    if not filepath.exists():
        return None
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def get_mock_stations() -> list[dict]:
    """Return mock station data"""
    return [
        {"id": "1001", "name": "Gangnam", "line": "Line 2", "lat": 37.4979, "lng": 127.0276},
        {"id": "1002", "name": "Jamsil", "line": "Line 2", "lat": 37.5133, "lng": 127.1001},
        {"id": "1003", "name": "Hongdae", "line": "Line 2", "lat": 37.5571, "lng": 126.9244},
        {"id": "1004", "name": "Seoul Station", "line": "Line 1", "lat": 37.5547, "lng": 126.9706},
        {"id": "1005", "name": "Yeouido", "line": "Line 5", "lat": 37.5219, "lng": 126.9243},
    ]


def get_mock_ridership() -> list[dict]:
    """Return mock ridership data"""
    mock_data = []
    stations = [
        ("1001", "Gangnam"),
        ("1002", "Jamsil"),
        ("1003", "Hongdae"),
        ("1004", "Seoul Station"),
        ("1005", "Yeouido"),
    ]
    for station_id, station_name in stations:
        for hour in range(24):
            # Simulate rush hour peaks
            if 7 <= hour <= 9 or 18 <= hour <= 20:
                base_boarding = 5000 + (hour % 3) * 500
                base_alighting = 4500 + (hour % 3) * 400
            else:
                base_boarding = 1500 + (hour % 5) * 100
                base_alighting = 1400 + (hour % 5) * 80

            mock_data.append({
                "station_id": station_id,
                "station_name": station_name,
                "hour": hour,
                "avg_boarding": base_boarding,
                "avg_alighting": base_alighting,
                "total": base_boarding + base_alighting,
            })
    return mock_data


def get_mock_election() -> list[dict]:
    """Return mock election data"""
    return [
        {"district": "Gangnam-gu", "total_voters": 450000, "total_votes": 315000, "turnout_rate": 0.70},
        {"district": "Songpa-gu", "total_voters": 520000, "total_votes": 374400, "turnout_rate": 0.72},
        {"district": "Mapo-gu", "total_voters": 320000, "total_votes": 236800, "turnout_rate": 0.74},
        {"district": "Jung-gu", "total_voters": 110000, "total_votes": 74800, "turnout_rate": 0.68},
        {"district": "Yeongdeungpo-gu", "total_voters": 350000, "total_votes": 245000, "turnout_rate": 0.70},
    ]


# =============================================================================
# Endpoints
# =============================================================================

@router.get("/districts", response_model=list[DistrictInfo])
async def get_districts():
    """
    Return all Seoul administrative districts (gu) with their electoral districts.

    Returns:
        List of districts with gu name, electoral districts, center, and bounds
    """
    data = load_json_file("seoul_districts.json")
    if data is None:
        # Mock data fallback
        return [
            {
                "gu": "강남구",
                "electoral_districts": ["강남구갑", "강남구을", "강남구병"],
                "center": {"lat": 37.5172, "lng": 127.0473},
                "bounds": {"north": 37.5350, "south": 37.4640, "east": 127.0900, "west": 127.0100}
            },
        ]
    return data


@router.get("/stations", response_model=list[Station])
async def get_stations():
    """
    Return all subway stations with coordinates.

    Returns:
        List of stations with id, name, line, lat, lng
    """
    data = load_json_file("stations.json")
    if data is None:
        return get_mock_stations()
    return data


@router.get("/ridership", response_model=list[RidershipData])
async def get_ridership(
    hour: Optional[int] = Query(None, ge=0, le=23, description="Filter by hour (0-23)"),
    station_id: Optional[str] = Query(None, description="Filter by station ID"),
):
    """
    Return ridership data, optionally filtered by hour and station.

    Args:
        hour: Optional hour filter (0-23)
        station_id: Optional station ID filter

    Returns:
        List of ridership data with station_id, station_name, hour, avg_boarding, avg_alighting, total
    """
    data = load_json_file("ridership_hourly.json")
    if data is None:
        data = get_mock_ridership()

    # Apply filters
    if hour is not None:
        data = [d for d in data if d.get("hour") == hour]
    if station_id is not None:
        data = [d for d in data if d.get("station_id") == station_id]

    # Compute total if not present
    for d in data:
        if d.get("total") is None:
            d["total"] = d.get("avg_boarding", 0) + d.get("avg_alighting", 0)

    return data


@router.get("/election", response_model=list[ElectionData])
async def get_election(
    district: Optional[str] = Query(None, description="Filter by district name"),
):
    """
    Return election/voter data by district.

    Args:
        district: Optional district name filter

    Returns:
        List of election data with district, total_voters, total_votes, turnout_rate
    """
    data = load_json_file("election_by_district.json")
    if data is None:
        data = get_mock_election()

    # Apply filter
    if district is not None:
        data = [d for d in data if district.lower() in d.get("district", "").lower()]

    return data


@router.post("/optimize", response_model=OptimizeResponse)
async def optimize_stations(request: OptimizeRequest):
    """
    Calculate and return top N stations with highest voter-reach score.

    Score formula: (avg_boarding + avg_alighting) * turnout_rate

    Args:
        request: OptimizeRequest with target_hour, top_n, and optional gu/electoral_district filters

    Returns:
        OptimizeResponse with recommendations list
    """
    # Load data
    stations_data = load_json_file("stations.json")
    if stations_data is None:
        stations_data = get_mock_stations()

    ridership_data = load_json_file("ridership_hourly.json")
    if ridership_data is None:
        ridership_data = get_mock_ridership()

    election_data = load_json_file("election_by_district.json")
    if election_data is None:
        election_data = get_mock_election()

    districts_data = load_json_file("seoul_districts.json")

    # Create lookup maps
    station_map = {s["id"]: s for s in stations_data}

    # Create election data lookup by district name (includes both gu names and electoral district names)
    election_map = {}
    for e in election_data:
        district_name = e.get("district", "")
        election_map[district_name] = e.get("turnout_rate", 0.7)

    # Create gu to electoral districts mapping
    gu_to_electoral = {}
    if districts_data:
        for d in districts_data:
            gu_to_electoral[d["gu"]] = d.get("electoral_districts", [])

    # Calculate average turnout rate for fallback
    avg_turnout = sum(e["turnout_rate"] for e in election_data) / len(election_data) if election_data else 0.7

    # Filter stations by gu if specified
    if request.gu:
        stations_data = [s for s in stations_data if s.get("gu") == request.gu]
        station_map = {s["id"]: s for s in stations_data}

    # Filter ridership by target hour
    hourly_ridership = [r for r in ridership_data if r.get("hour") == request.target_hour]

    # Calculate scores
    scored_stations = []
    for ridership in hourly_ridership:
        station_id = ridership.get("station_id")
        station = station_map.get(station_id)

        if station is None:
            continue

        station_gu = station.get("gu")

        # Get turnout rate for the station's district
        turnout_rate = avg_turnout
        if request.electoral_district:
            # Use specific electoral district's turnout rate when selected
            turnout_rate = election_map.get(request.electoral_district, avg_turnout)
        elif station_gu:
            # Try to find turnout rate from electoral districts of this gu
            electoral_districts = gu_to_electoral.get(station_gu, [])
            if electoral_districts:
                # Use average of all electoral districts in this gu
                district_rates = [election_map.get(ed, avg_turnout) for ed in electoral_districts]
                turnout_rate = sum(district_rates) / len(district_rates) if district_rates else avg_turnout

        avg_boarding = ridership.get("avg_boarding", 0)
        avg_alighting = ridership.get("avg_alighting", 0)
        total_ridership = avg_boarding + avg_alighting

        # Score formula: ridership * turnout_rate
        score = total_ridership * turnout_rate

        # Determine reason based on characteristics
        if total_ridership > 8000:
            reason = "High traffic station during target hour"
        elif total_ridership > 5000:
            reason = "Moderate-high traffic with good voter engagement potential"
        else:
            reason = "Strategic location for targeted outreach"

        scored_stations.append({
            "station_id": station_id,
            "station_name": ridership.get("station_name", station.get("name", "Unknown")),
            "lat": station.get("lat", 0),
            "lng": station.get("lng", 0),
            "hour": request.target_hour,
            "score": round(score, 2),
            "ridership": total_ridership,
            "reason": reason,
            "gu": station_gu,
            "turnout_rate": round(turnout_rate, 4),
        })

    # Sort by score descending and take top N
    scored_stations.sort(key=lambda x: x["score"], reverse=True)
    top_stations = scored_stations[:request.top_n]

    return OptimizeResponse(recommendations=top_stations)


@router.get("/heatmap", response_model=list[HeatmapPoint])
async def get_heatmap(
    hour: int = Query(..., ge=0, le=23, description="Hour for heatmap data (0-23)"),
):
    """
    Return data formatted for map heatmap visualization.

    Args:
        hour: Hour to generate heatmap for (0-23)

    Returns:
        List of heatmap points with lat, lng, weight
    """
    # Load data
    stations_data = load_json_file("stations.json")
    if stations_data is None:
        stations_data = get_mock_stations()

    ridership_data = load_json_file("ridership_hourly.json")
    if ridership_data is None:
        ridership_data = get_mock_ridership()

    # Create station lookup
    station_map = {s["id"]: s for s in stations_data}

    # Filter ridership by hour
    hourly_ridership = [r for r in ridership_data if r.get("hour") == hour]

    # Find max ridership for normalization
    max_ridership = max(
        (r.get("avg_boarding", 0) + r.get("avg_alighting", 0) for r in hourly_ridership),
        default=1
    )

    # Generate heatmap points
    heatmap_points = []
    for ridership in hourly_ridership:
        station_id = ridership.get("station_id")
        station = station_map.get(station_id)

        if station is None:
            continue

        total_ridership = ridership.get("avg_boarding", 0) + ridership.get("avg_alighting", 0)
        # Normalize weight to 0-1 range
        weight = total_ridership / max_ridership if max_ridership > 0 else 0

        heatmap_points.append({
            "lat": station.get("lat", 0),
            "lng": station.get("lng", 0),
            "weight": round(weight, 4),
        })

    return heatmap_points
