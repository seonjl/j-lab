#!/usr/bin/env python3
"""
Data Parser for Voter-Reach Project
Converts raw CSV files to processed JSON format.

Input files (in data/raw/):
- Station coordinates (EUC-KR encoding)
- Ridership data by hour (EUC-KR encoding)
- Election results (EUC-KR encoding)
- Population by dong (UTF-8)

Output files (in data/processed/):
- stations.json
- ridership_hourly.json
- election_by_district.json
"""

import json
import os
import pandas as pd
from pathlib import Path


# Base paths
BASE_DIR = Path(__file__).parent.parent
RAW_DIR = BASE_DIR / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "data" / "processed"

# Input file names
STATION_FILE = "서울교통공사_1_8호선 역사 좌표(위경도) 정보_20250814.csv"
RIDERSHIP_FILE = "서울교통공사_역별 시간대별 승하차인원(24.1~24.12).csv"
ELECTION_FILE = "중앙선거관리위원회_국회의원선거 개표결과_20240410.csv"
POPULATION_FILE = "등록인구(연령별_동별)_20260105164119.csv"


def ensure_output_directory():
    """Create the processed directory if it doesn't exist."""
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Output directory ready: {PROCESSED_DIR}")


def parse_stations():
    """
    Parse station coordinates CSV and convert to JSON.
    Uses station names from ridership file where available for better consistency.

    Output format:
    [
        { "id": "150", "name": "서울역", "line": "1호선", "lat": 37.55315, "lng": 126.972533 },
        ...
    ]
    """
    print("\n[1/3] Parsing station coordinates...")

    # Load coordinates file
    filepath = RAW_DIR / STATION_FILE
    df = pd.read_csv(filepath, encoding='cp949')

    # Load ridership file to get better station names
    ridership_filepath = RAW_DIR / RIDERSHIP_FILE
    ridership_df = pd.read_csv(ridership_filepath, encoding='cp949', usecols=['역번호', '역명'])
    # Create a mapping from station ID to name (use first occurrence)
    name_mapping = ridership_df.drop_duplicates(subset=['역번호']).set_index('역번호')['역명'].to_dict()

    # Rename columns for clarity
    df = df.rename(columns={
        '고유역번호(외부역코드)': 'station_id',
        '역명': 'name',
        '호선': 'line_num',
        '위도': 'lat',
        '경도': 'lng'
    })

    # Convert line number to line name (e.g., 1 -> "1호선")
    df['line'] = df['line_num'].astype(str) + '호선'

    # Create the output data structure
    stations = []
    for _, row in df.iterrows():
        station_id = row['station_id']
        # Use name from ridership file if available, otherwise use coordinates file name
        station_name = name_mapping.get(station_id, row['name'])

        station = {
            "id": str(station_id),
            "name": station_name,
            "line": row['line'],
            "lat": round(row['lat'], 6),
            "lng": round(row['lng'], 6)
        }
        stations.append(station)

    # Write to JSON
    output_path = PROCESSED_DIR / "stations.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(stations, f, ensure_ascii=False, indent=2)

    print(f"   - Parsed {len(stations)} stations")
    print(f"   - Output: {output_path}")

    return df  # Return for use in ridership parsing


def parse_ridership(stations_df=None):
    """
    Parse ridership CSV and aggregate by station and hour.

    Output format:
    [
        { "station_id": "150", "station_name": "서울역", "hour": 8, "avg_boarding": 12345, "avg_alighting": 11234 },
        ...
    ]
    """
    print("\n[2/3] Parsing ridership data...")

    filepath = RAW_DIR / RIDERSHIP_FILE
    df = pd.read_csv(filepath, encoding='cp949')

    # Hour columns mapping (column name -> hour)
    hour_columns = {
        '06시 이전': 5,  # Before 6am, represented as 5
        '06시-07시': 6,
        '07시-08시': 7,
        '08시-09시': 8,
        '09시-10시': 9,
        '10시-11시': 10,
        '11시-12시': 11,
        '12시-13시': 12,
        '13시-14시': 13,
        '14시-15시': 14,
        '15시-16시': 15,
        '16시-17시': 16,
        '17시-18시': 17,
        '18시-19시': 18,
        '19시-20시': 19,
        '20시-21시': 20,
        '21시-22시': 21,
        '22시-23시': 22,
        '23시-24시': 23,
        '24시 이후': 24  # After midnight, represented as 24
    }

    # Separate boarding (승차) and alighting (하차) data
    boarding_df = df[df['구분'] == '승차'].copy()
    alighting_df = df[df['구분'] == '하차'].copy()

    ridership_data = []

    # Get unique station IDs
    station_ids = df['역번호'].unique()

    for station_id in station_ids:
        station_boarding = boarding_df[boarding_df['역번호'] == station_id]
        station_alighting = alighting_df[alighting_df['역번호'] == station_id]

        if len(station_boarding) == 0:
            continue

        station_name = station_boarding['역명'].iloc[0]

        for col_name, hour in hour_columns.items():
            # Calculate average across all days
            avg_boarding = station_boarding[col_name].mean()
            avg_alighting = station_alighting[col_name].mean() if len(station_alighting) > 0 else 0

            ridership_entry = {
                "station_id": str(station_id),
                "station_name": station_name,
                "hour": hour,
                "avg_boarding": round(avg_boarding),
                "avg_alighting": round(avg_alighting)
            }
            ridership_data.append(ridership_entry)

    # Sort by station_id and hour
    ridership_data.sort(key=lambda x: (x['station_id'], x['hour']))

    # Write to JSON
    output_path = PROCESSED_DIR / "ridership_hourly.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(ridership_data, f, ensure_ascii=False, indent=2)

    unique_stations = len(station_ids)
    print(f"   - Parsed data for {unique_stations} stations across {len(hour_columns)} hours")
    print(f"   - Total records: {len(ridership_data)}")
    print(f"   - Output: {output_path}")


def parse_election():
    """
    Parse election results CSV and aggregate by district (선거구).
    Extract Seoul data only.

    Output format:
    [
        { "district": "종로구", "total_voters": 123456, "total_votes": 98765, "turnout_rate": 0.80 },
        ...
    ]
    """
    print("\n[3/3] Parsing election results...")

    filepath = RAW_DIR / ELECTION_FILE
    df = pd.read_csv(filepath, encoding='cp949')

    # Filter for Seoul only
    seoul_df = df[df['시도명'] == '서울특별시'].copy()

    # Get unique districts
    districts = seoul_df['선거구명'].unique()

    election_data = []

    for district in districts:
        district_df = seoul_df[seoul_df['선거구명'] == district]

        # Get total voters (선거인수) and total votes (투표수)
        # These appear as 후보자 values in the data
        voters_rows = district_df[district_df['후보자'] == '선거인수']
        votes_rows = district_df[district_df['후보자'] == '투표수']

        total_voters = voters_rows['득표수'].sum() if len(voters_rows) > 0 else 0
        total_votes = votes_rows['득표수'].sum() if len(votes_rows) > 0 else 0

        # Calculate turnout rate
        turnout_rate = round(total_votes / total_voters, 4) if total_voters > 0 else 0

        election_entry = {
            "district": district,
            "total_voters": int(total_voters),
            "total_votes": int(total_votes),
            "turnout_rate": turnout_rate
        }
        election_data.append(election_entry)

    # Sort by district name
    election_data.sort(key=lambda x: x['district'])

    # Write to JSON
    output_path = PROCESSED_DIR / "election_by_district.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(election_data, f, ensure_ascii=False, indent=2)

    print(f"   - Parsed {len(election_data)} Seoul districts")
    print(f"   - Output: {output_path}")


def main():
    """Main entry point for the data parser."""
    print("=" * 60)
    print("Voter-Reach Data Parser")
    print("=" * 60)

    # Ensure output directory exists
    ensure_output_directory()

    # Parse each data source
    stations_df = parse_stations()
    parse_ridership(stations_df)
    parse_election()

    print("\n" + "=" * 60)
    print("Data parsing complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
