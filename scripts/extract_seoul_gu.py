#!/usr/bin/env python3
"""
Extract Seoul gu-level boundaries from admdongkor GeoJSON
and update station mapping with accurate Point-in-Polygon
"""
import json
from pathlib import Path
from collections import defaultdict

# Paths
INPUT_FILE = Path("/tmp/hangjeongdong.geojson")
OUTPUT_GU_FILE = Path(__file__).parent.parent / "data" / "processed" / "seoul_gu_boundaries.geojson"
STATIONS_FILE = Path(__file__).parent.parent / "data" / "processed" / "stations.json"
DISTRICTS_FILE = Path(__file__).parent.parent / "data" / "processed" / "seoul_districts.json"

# Seoul administrative code prefix
SEOUL_CODE_PREFIX = "11"

# Gu code to name mapping (from adm_cd first 5 digits)
GU_CODES = {
    "11110": "종로구",
    "11140": "중구",
    "11170": "용산구",
    "11200": "성동구",
    "11215": "광진구",
    "11230": "동대문구",
    "11260": "중랑구",
    "11290": "성북구",
    "11305": "강북구",
    "11320": "도봉구",
    "11350": "노원구",
    "11380": "은평구",
    "11410": "서대문구",
    "11440": "마포구",
    "11470": "양천구",
    "11500": "강서구",
    "11530": "구로구",
    "11545": "금천구",
    "11560": "영등포구",
    "11590": "동작구",
    "11620": "관악구",
    "11650": "서초구",
    "11680": "강남구",
    "11710": "송파구",
    "11740": "강동구",
}


def point_in_polygon(point: tuple[float, float], polygon: list) -> bool:
    """
    Ray casting algorithm to check if point is inside polygon.
    point: (lng, lat)
    polygon: list of [lng, lat] coordinates
    """
    x, y = point
    n = len(polygon)
    inside = False

    j = n - 1
    for i in range(n):
        xi, yi = polygon[i]
        xj, yj = polygon[j]

        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi) + xi):
            inside = not inside
        j = i

    return inside


def point_in_multipolygon(point: tuple[float, float], geometry: dict) -> bool:
    """Check if point is in a Polygon or MultiPolygon geometry."""
    geom_type = geometry["type"]
    coords = geometry["coordinates"]

    if geom_type == "Polygon":
        # First ring is exterior, rest are holes
        exterior = coords[0]
        if not point_in_polygon(point, exterior):
            return False
        # Check if point is in any hole
        for hole in coords[1:]:
            if point_in_polygon(point, hole):
                return False
        return True

    elif geom_type == "MultiPolygon":
        for polygon in coords:
            exterior = polygon[0]
            if point_in_polygon(point, exterior):
                # Check holes
                in_hole = False
                for hole in polygon[1:]:
                    if point_in_polygon(point, hole):
                        in_hole = True
                        break
                if not in_hole:
                    return True
        return False

    return False


def merge_polygons(features: list) -> dict:
    """
    Merge multiple polygon features into a MultiPolygon.
    Simple approach: collect all polygons into a MultiPolygon.
    """
    all_coords = []

    for feature in features:
        geom = feature["geometry"]
        if geom["type"] == "Polygon":
            all_coords.append(geom["coordinates"])
        elif geom["type"] == "MultiPolygon":
            all_coords.extend(geom["coordinates"])

    if len(all_coords) == 1:
        return {"type": "Polygon", "coordinates": all_coords[0]}
    return {"type": "MultiPolygon", "coordinates": all_coords}


def main():
    print("Loading GeoJSON data...")
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"Total features: {len(data['features'])}")

    # Group Seoul features by sgg code (sigungu code)
    gu_features = defaultdict(list)

    for feature in data["features"]:
        props = feature["properties"]
        sido = props.get("sido", "")
        if sido == SEOUL_CODE_PREFIX:
            sgg_code = props.get("sgg", "")
            gu_features[sgg_code].append(feature)

    print(f"Seoul gu count: {len(gu_features)}")

    # Create merged gu boundaries
    gu_boundaries = []
    for gu_code, features in sorted(gu_features.items()):
        # Get gu name from first feature's sggnm property
        gu_name = features[0]["properties"].get("sggnm", GU_CODES.get(gu_code, f"Unknown ({gu_code})"))
        merged_geometry = merge_polygons(features)

        gu_boundaries.append({
            "type": "Feature",
            "properties": {
                "gu_code": gu_code,
                "gu_name": gu_name,
                "dong_count": len(features)
            },
            "geometry": merged_geometry
        })
        print(f"  {gu_name}: {len(features)} dongs merged")

    # Save gu boundaries GeoJSON
    output_geojson = {
        "type": "FeatureCollection",
        "features": gu_boundaries
    }

    OUTPUT_GU_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_GU_FILE, "w", encoding="utf-8") as f:
        json.dump(output_geojson, f, ensure_ascii=False, indent=2)
    print(f"\nSaved gu boundaries to: {OUTPUT_GU_FILE}")

    # Update stations with accurate gu mapping
    print("\nUpdating station mappings...")
    with open(STATIONS_FILE, "r", encoding="utf-8") as f:
        stations = json.load(f)

    updated_count = 0
    for station in stations:
        lat = station.get("lat")
        lng = station.get("lng")
        if lat is None or lng is None:
            continue

        point = (lng, lat)  # GeoJSON uses (lng, lat)
        old_gu = station.get("gu")
        new_gu = None

        for gu_feature in gu_boundaries:
            if point_in_multipolygon(point, gu_feature["geometry"]):
                new_gu = gu_feature["properties"]["gu_name"]
                break

        if new_gu and new_gu != old_gu:
            print(f"  {station['name']}: {old_gu} → {new_gu}")
            updated_count += 1

        station["gu"] = new_gu

    # Save updated stations
    with open(STATIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(stations, f, ensure_ascii=False, indent=2)
    print(f"\nUpdated {updated_count} station mappings")

    # Update seoul_districts.json with accurate bounds from GeoJSON
    print("\nUpdating district bounds...")
    with open(DISTRICTS_FILE, "r", encoding="utf-8") as f:
        districts = json.load(f)

    for district in districts:
        gu_name = district["gu"]
        for gu_feature in gu_boundaries:
            if gu_feature["properties"]["gu_name"] == gu_name:
                # Calculate bounds from geometry
                geom = gu_feature["geometry"]
                all_coords = []

                if geom["type"] == "Polygon":
                    all_coords = geom["coordinates"][0]
                elif geom["type"] == "MultiPolygon":
                    for polygon in geom["coordinates"]:
                        all_coords.extend(polygon[0])

                if all_coords:
                    lngs = [c[0] for c in all_coords]
                    lats = [c[1] for c in all_coords]
                    district["bounds"] = {
                        "north": round(max(lats), 6),
                        "south": round(min(lats), 6),
                        "east": round(max(lngs), 6),
                        "west": round(min(lngs), 6)
                    }
                    district["center"] = {
                        "lat": round(sum(lats) / len(lats), 6),
                        "lng": round(sum(lngs) / len(lngs), 6)
                    }
                break

    with open(DISTRICTS_FILE, "w", encoding="utf-8") as f:
        json.dump(districts, f, ensure_ascii=False, indent=2)
    print("Updated district bounds from GeoJSON")

    print("\nDone!")


if __name__ == "__main__":
    main()
