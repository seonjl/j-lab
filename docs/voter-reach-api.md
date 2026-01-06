# Voter Reach ML API 기술 문서

## 1. API 개요

### 1.1 목적 및 기능 설명

Voter Reach API는 선거 캠페인 최적화를 위한 지하철역 승하차 데이터와 투표율 분석 서비스입니다. 이 API는 다음과 같은 핵심 기능을 제공합니다:

- **지하철역 정보 조회**: 서울 지하철역의 위치 정보(위도/경도) 및 노선 정보 제공
- **시간대별 승하차 데이터 조회**: 각 역의 시간대별 평균 승차/하차 인원 데이터 제공
- **선거구별 투표 데이터 조회**: 선거구별 유권자 수, 투표자 수, 투표율 정보 제공
- **캠페인 최적화**: 특정 시간대에 유권자 접촉 효과가 높은 최적의 지하철역 추천
- **히트맵 시각화 데이터**: 지도 히트맵 시각화를 위한 가중치 데이터 제공

### 1.2 사용된 데이터 소스

| 데이터 파일 | 설명 | 경로 |
|------------|------|------|
| `stations.json` | 서울 지하철역 정보 (1~8호선) | `/data/processed/stations.json` |
| `ridership_hourly.json` | 시간대별 역별 승하차 데이터 | `/data/processed/ridership_hourly.json` |
| `election_by_district.json` | 선거구별 투표 데이터 | `/data/processed/election_by_district.json` |

> **참고**: 데이터 파일이 없는 경우 API는 Mock 데이터를 반환합니다.

### 1.3 Base URL

```
http://localhost:8000/api/voter-reach
```

---

## 2. 엔드포인트 상세

### 2.1 GET /stations - 지하철역 목록 조회

지하철역의 기본 정보와 좌표를 조회합니다.

#### Request

| 항목 | 값 |
|------|-----|
| URL | `/api/voter-reach/stations` |
| Method | `GET` |
| Parameters | 없음 |

#### Response Schema

```json
[
  {
    "id": "string",
    "name": "string",
    "line": "string",
    "lat": "number",
    "lng": "number"
  }
]
```

#### Response Fields

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | string | 역 고유 ID |
| `name` | string | 역명 |
| `line` | string | 노선명 (예: "2호선") |
| `lat` | float | 위도 |
| `lng` | float | 경도 |

#### 예시 요청/응답

**Request:**
```bash
curl -X GET "http://localhost:8000/api/voter-reach/stations"
```

**Response:**
```json
[
  {
    "id": "150",
    "name": "서울역",
    "line": "1호선",
    "lat": 37.55315,
    "lng": 126.972533
  },
  {
    "id": "222",
    "name": "강남",
    "line": "2호선",
    "lat": 37.497958,
    "lng": 127.027539
  }
]
```

---

### 2.2 GET /ridership - 승하차 데이터 조회

역별, 시간대별 승하차 데이터를 조회합니다.

#### Request

| 항목 | 값 |
|------|-----|
| URL | `/api/voter-reach/ridership` |
| Method | `GET` |
| Query Parameters | `hour`, `station_id` (모두 선택) |

#### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 | 제약조건 |
|----------|------|------|------|----------|
| `hour` | integer | 선택 | 시간대 필터 | 0-23 |
| `station_id` | string | 선택 | 역 ID 필터 | - |

#### Response Schema

```json
[
  {
    "station_id": "string",
    "station_name": "string",
    "hour": "integer",
    "avg_boarding": "number",
    "avg_alighting": "number",
    "total": "number"
  }
]
```

#### Response Fields

| 필드 | 타입 | 설명 |
|------|------|------|
| `station_id` | string | 역 고유 ID |
| `station_name` | string | 역명 |
| `hour` | integer | 시간대 (0-23) |
| `avg_boarding` | float | 평균 승차 인원 |
| `avg_alighting` | float | 평균 하차 인원 |
| `total` | float | 총 승하차 인원 (avg_boarding + avg_alighting) |

#### 예시 요청/응답

**Request (전체 조회):**
```bash
curl -X GET "http://localhost:8000/api/voter-reach/ridership"
```

**Request (시간대 필터링):**
```bash
curl -X GET "http://localhost:8000/api/voter-reach/ridership?hour=8"
```

**Request (역 및 시간대 필터링):**
```bash
curl -X GET "http://localhost:8000/api/voter-reach/ridership?hour=8&station_id=150"
```

**Response:**
```json
[
  {
    "station_id": "150",
    "station_name": "서울역",
    "hour": 8,
    "avg_boarding": 2392,
    "avg_alighting": 7750,
    "total": 10142
  }
]
```

---

### 2.3 GET /election - 선거 데이터 조회

선거구별 유권자 수, 투표자 수, 투표율 데이터를 조회합니다.

#### Request

| 항목 | 값 |
|------|-----|
| URL | `/api/voter-reach/election` |
| Method | `GET` |
| Query Parameters | `district` (선택) |

#### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `district` | string | 선택 | 선거구명 필터 (부분 일치, 대소문자 무시) |

#### Response Schema

```json
[
  {
    "district": "string",
    "total_voters": "integer",
    "total_votes": "integer",
    "turnout_rate": "number"
  }
]
```

#### Response Fields

| 필드 | 타입 | 설명 |
|------|------|------|
| `district` | string | 선거구명 |
| `total_voters` | integer | 총 유권자 수 |
| `total_votes` | integer | 총 투표자 수 |
| `turnout_rate` | float | 투표율 (0.0 ~ 1.0) |

#### 예시 요청/응답

**Request (전체 조회):**
```bash
curl -X GET "http://localhost:8000/api/voter-reach/election"
```

**Request (선거구 필터링):**
```bash
curl -X GET "http://localhost:8000/api/voter-reach/election?district=강남"
```

**Response:**
```json
[
  {
    "district": "강남구갑",
    "total_voters": 156085,
    "total_votes": 95785,
    "turnout_rate": 0.6137
  },
  {
    "district": "강남구병",
    "total_voters": 143901,
    "total_votes": 101634,
    "turnout_rate": 0.7063
  },
  {
    "district": "강남구을",
    "total_voters": 168269,
    "total_votes": 123961,
    "turnout_rate": 0.7367
  }
]
```

---

### 2.4 POST /optimize - 캠페인 최적 역 추천

특정 시간대에 유권자 접촉 효과가 가장 높은 지하철역을 추천합니다.

#### Request

| 항목 | 값 |
|------|-----|
| URL | `/api/voter-reach/optimize` |
| Method | `POST` |
| Content-Type | `application/json` |

#### Request Body Schema

```json
{
  "target_hour": "integer",
  "top_n": "integer"
}
```

#### Request Body Fields

| 필드 | 타입 | 필수 | 설명 | 기본값 | 제약조건 |
|------|------|------|------|--------|----------|
| `target_hour` | integer | 필수 | 목표 시간대 | - | 0-23 |
| `top_n` | integer | 선택 | 반환할 최대 역 수 | 10 | 1-100 |

#### Response Schema

```json
{
  "recommendations": [
    {
      "station_id": "string",
      "station_name": "string",
      "lat": "number",
      "lng": "number",
      "hour": "integer",
      "score": "number",
      "ridership": "number",
      "reason": "string"
    }
  ]
}
```

#### Response Fields

| 필드 | 타입 | 설명 |
|------|------|------|
| `recommendations` | array | 추천 역 목록 (점수 내림차순 정렬) |
| `station_id` | string | 역 고유 ID |
| `station_name` | string | 역명 |
| `lat` | float | 위도 |
| `lng` | float | 경도 |
| `hour` | integer | 시간대 |
| `score` | float | 유권자 접촉 점수 |
| `ridership` | float | 총 승하차 인원 |
| `reason` | string | 추천 이유 |

#### 예시 요청/응답

**Request:**
```bash
curl -X POST "http://localhost:8000/api/voter-reach/optimize" \
  -H "Content-Type: application/json" \
  -d '{
    "target_hour": 8,
    "top_n": 5
  }'
```

**Response:**
```json
{
  "recommendations": [
    {
      "station_id": "222",
      "station_name": "강남",
      "lat": 37.497958,
      "lng": 127.027539,
      "hour": 8,
      "score": 7254.32,
      "ridership": 10362,
      "reason": "High traffic station during target hour"
    },
    {
      "station_id": "150",
      "station_name": "서울역",
      "lat": 37.55315,
      "lng": 126.972533,
      "hour": 8,
      "score": 7099.42,
      "ridership": 10142,
      "reason": "High traffic station during target hour"
    }
  ]
}
```

---

### 2.5 GET /heatmap - 히트맵 데이터 조회

지도 히트맵 시각화를 위한 데이터를 조회합니다.

#### Request

| 항목 | 값 |
|------|-----|
| URL | `/api/voter-reach/heatmap` |
| Method | `GET` |
| Query Parameters | `hour` (필수) |

#### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 | 제약조건 |
|----------|------|------|------|----------|
| `hour` | integer | 필수 | 히트맵 시간대 | 0-23 |

#### Response Schema

```json
[
  {
    "lat": "number",
    "lng": "number",
    "weight": "number"
  }
]
```

#### Response Fields

| 필드 | 타입 | 설명 |
|------|------|------|
| `lat` | float | 위도 |
| `lng` | float | 경도 |
| `weight` | float | 가중치 (0.0 ~ 1.0, 정규화된 값) |

#### 예시 요청/응답

**Request:**
```bash
curl -X GET "http://localhost:8000/api/voter-reach/heatmap?hour=8"
```

**Response:**
```json
[
  {
    "lat": 37.497958,
    "lng": 127.027539,
    "weight": 1.0
  },
  {
    "lat": 37.55315,
    "lng": 126.972533,
    "weight": 0.8542
  },
  {
    "lat": 37.513305,
    "lng": 127.100129,
    "weight": 0.7231
  }
]
```

---

## 3. 데이터 모델

### 3.1 Pydantic 모델 정의

#### Station
```python
class Station(BaseModel):
    """지하철역 모델"""
    id: str              # 역 고유 ID
    name: str            # 역명
    line: str            # 노선명
    lat: float           # 위도 (latitude)
    lng: float           # 경도 (longitude)
```

#### RidershipData
```python
class RidershipData(BaseModel):
    """시간대별 승하차 데이터 모델"""
    station_id: str       # 역 고유 ID
    station_name: str     # 역명
    hour: int             # 시간대 (0-23)
    avg_boarding: float   # 평균 승차 인원
    avg_alighting: float  # 평균 하차 인원
    total: float          # 총 승하차 인원
```

#### ElectionData
```python
class ElectionData(BaseModel):
    """선거구별 투표 데이터 모델"""
    district: str         # 선거구명
    total_voters: int     # 총 유권자 수
    total_votes: int      # 총 투표자 수
    turnout_rate: float   # 투표율 (0.0 ~ 1.0)
```

#### OptimizeRequest
```python
class OptimizeRequest(BaseModel):
    """최적화 엔드포인트 요청 모델"""
    target_hour: int = Field(..., ge=0, le=23, description="목표 시간대 (0-23)")
    top_n: int = Field(default=10, ge=1, le=100, description="반환할 최상위 역 수")
```

#### StationRecommendation
```python
class StationRecommendation(BaseModel):
    """최적화된 역 추천 모델"""
    station_id: str       # 역 고유 ID
    station_name: str     # 역명
    lat: float            # 위도
    lng: float            # 경도
    hour: int             # 시간대
    score: float          # 유권자 접촉 점수
    ridership: float      # 총 승하차 인원
    reason: str           # 추천 이유
```

#### OptimizeResponse
```python
class OptimizeResponse(BaseModel):
    """최적화 엔드포인트 응답 모델"""
    recommendations: list[StationRecommendation]  # 추천 역 목록
```

#### HeatmapPoint
```python
class HeatmapPoint(BaseModel):
    """히트맵 데이터 포인트 모델"""
    lat: float            # 위도
    lng: float            # 경도
    weight: float         # 가중치 (0.0 ~ 1.0)
```

---

## 4. 알고리즘 설명

### 4.1 점수 계산 공식

**Voter Reach Score (유권자 접촉 점수)**는 다음 공식으로 계산됩니다:

```
Score = (avg_boarding + avg_alighting) × turnout_weight
```

여기서:
- `avg_boarding`: 해당 시간대 평균 승차 인원
- `avg_alighting`: 해당 시간대 평균 하차 인원
- `turnout_weight`: 전체 선거구 평균 투표율

#### 계산 과정

1. **투표율 가중치 계산**
   ```python
   avg_turnout = sum(e["turnout_rate"] for e in election_data) / len(election_data)
   turnout_weight = avg_turnout  # 약 0.68 ~ 0.70
   ```

2. **역별 점수 계산**
   ```python
   total_ridership = avg_boarding + avg_alighting
   score = total_ridership * turnout_weight
   ```

3. **추천 이유 분류**
   | 조건 | 추천 이유 |
   |------|----------|
   | total_ridership > 8000 | "High traffic station during target hour" |
   | total_ridership > 5000 | "Moderate-high traffic with good voter engagement potential" |
   | 기타 | "Strategic location for targeted outreach" |

### 4.2 데이터 처리 흐름

```
┌─────────────────────────────────────────────────────────────────┐
│                    /optimize 엔드포인트                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. 데이터 로드                                                  │
│     - stations.json → station_map 생성                          │
│     - ridership_hourly.json → 전체 승하차 데이터                 │
│     - election_by_district.json → 선거 데이터                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. 평균 투표율 계산                                             │
│     avg_turnout = Σ(turnout_rate) / N                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. 시간대 필터링                                                │
│     hourly_ridership = filter(ridership, hour == target_hour)   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. 역별 점수 계산                                               │
│     for each station:                                            │
│       total = avg_boarding + avg_alighting                       │
│       score = total × turnout_weight                             │
│       reason = classify(total)                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. 정렬 및 상위 N개 선택                                        │
│     sorted_stations = sort(stations, by=score, desc=True)       │
│     return sorted_stations[:top_n]                               │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 히트맵 가중치 정규화

히트맵 데이터의 `weight`는 0.0 ~ 1.0 범위로 정규화됩니다:

```python
max_ridership = max(avg_boarding + avg_alighting for all stations at hour)
weight = (station_boarding + station_alighting) / max_ridership
```

---

## 5. 사용 예시

### 5.1 curl 명령어 예시

#### 전체 역 목록 조회
```bash
curl -X GET "http://localhost:8000/api/voter-reach/stations" | jq
```

#### 오전 8시 승하차 데이터 조회
```bash
curl -X GET "http://localhost:8000/api/voter-reach/ridership?hour=8" | jq
```

#### 특정 역의 전체 시간대 데이터 조회
```bash
curl -X GET "http://localhost:8000/api/voter-reach/ridership?station_id=222" | jq
```

#### 강남 지역 선거구 데이터 조회
```bash
curl -X GET "http://localhost:8000/api/voter-reach/election?district=강남" | jq
```

#### 오전 8시 최적 캠페인 역 5곳 추천
```bash
curl -X POST "http://localhost:8000/api/voter-reach/optimize" \
  -H "Content-Type: application/json" \
  -d '{"target_hour": 8, "top_n": 5}' | jq
```

#### 저녁 6시 히트맵 데이터 조회
```bash
curl -X GET "http://localhost:8000/api/voter-reach/heatmap?hour=18" | jq
```

### 5.2 프론트엔드 연동 방법

#### JavaScript/TypeScript (fetch API)

```typescript
// API 클라이언트 설정
const API_BASE_URL = 'http://localhost:8000/api/voter-reach';

// 타입 정의
interface Station {
  id: string;
  name: string;
  line: string;
  lat: number;
  lng: number;
}

interface RidershipData {
  station_id: string;
  station_name: string;
  hour: number;
  avg_boarding: number;
  avg_alighting: number;
  total: number;
}

interface OptimizeRequest {
  target_hour: number;
  top_n?: number;
}

interface StationRecommendation {
  station_id: string;
  station_name: string;
  lat: number;
  lng: number;
  hour: number;
  score: number;
  ridership: number;
  reason: string;
}

interface OptimizeResponse {
  recommendations: StationRecommendation[];
}

interface HeatmapPoint {
  lat: number;
  lng: number;
  weight: number;
}

// API 호출 함수
async function getStations(): Promise<Station[]> {
  const response = await fetch(`${API_BASE_URL}/stations`);
  return response.json();
}

async function getRidership(hour?: number, stationId?: string): Promise<RidershipData[]> {
  const params = new URLSearchParams();
  if (hour !== undefined) params.append('hour', hour.toString());
  if (stationId) params.append('station_id', stationId);

  const url = `${API_BASE_URL}/ridership${params.toString() ? '?' + params : ''}`;
  const response = await fetch(url);
  return response.json();
}

async function getOptimizedStations(request: OptimizeRequest): Promise<OptimizeResponse> {
  const response = await fetch(`${API_BASE_URL}/optimize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  return response.json();
}

async function getHeatmapData(hour: number): Promise<HeatmapPoint[]> {
  const response = await fetch(`${API_BASE_URL}/heatmap?hour=${hour}`);
  return response.json();
}

// 사용 예시
async function example() {
  // 1. 전체 역 목록 가져오기
  const stations = await getStations();
  console.log('Total stations:', stations.length);

  // 2. 오전 8시 최적 역 5곳 추천 받기
  const optimized = await getOptimizedStations({
    target_hour: 8,
    top_n: 5
  });
  console.log('Top 5 stations:', optimized.recommendations);

  // 3. 히트맵 데이터 가져오기
  const heatmapData = await getHeatmapData(8);
  console.log('Heatmap points:', heatmapData.length);
}
```

#### React 컴포넌트 예시

```tsx
import { useState, useEffect } from 'react';

interface StationRecommendation {
  station_id: string;
  station_name: string;
  lat: number;
  lng: number;
  hour: number;
  score: number;
  ridership: number;
  reason: string;
}

function VoterReachOptimizer() {
  const [hour, setHour] = useState<number>(8);
  const [topN, setTopN] = useState<number>(10);
  const [recommendations, setRecommendations] = useState<StationRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchOptimizedStations = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/voter-reach/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_hour: hour, top_n: topN }),
      });
      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error('Error fetching optimized stations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptimizedStations();
  }, [hour, topN]);

  return (
    <div>
      <h2>Voter Reach Optimizer</h2>

      <div>
        <label>
          Target Hour:
          <select value={hour} onChange={(e) => setHour(Number(e.target.value))}>
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>{i}:00</option>
            ))}
          </select>
        </label>

        <label>
          Top N:
          <input
            type="number"
            value={topN}
            onChange={(e) => setTopN(Number(e.target.value))}
            min={1}
            max={100}
          />
        </label>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Station</th>
              <th>Score</th>
              <th>Ridership</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {recommendations.map((rec, index) => (
              <tr key={rec.station_id}>
                <td>{index + 1}</td>
                <td>{rec.station_name}</td>
                <td>{rec.score.toFixed(2)}</td>
                <td>{rec.ridership.toLocaleString()}</td>
                <td>{rec.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default VoterReachOptimizer;
```

### 5.3 Python 클라이언트 예시

```python
import requests
from typing import Optional
from dataclasses import dataclass

BASE_URL = "http://localhost:8000/api/voter-reach"

@dataclass
class VoterReachClient:
    base_url: str = BASE_URL

    def get_stations(self) -> list[dict]:
        """전체 역 목록 조회"""
        response = requests.get(f"{self.base_url}/stations")
        response.raise_for_status()
        return response.json()

    def get_ridership(
        self,
        hour: Optional[int] = None,
        station_id: Optional[str] = None
    ) -> list[dict]:
        """승하차 데이터 조회"""
        params = {}
        if hour is not None:
            params["hour"] = hour
        if station_id is not None:
            params["station_id"] = station_id

        response = requests.get(f"{self.base_url}/ridership", params=params)
        response.raise_for_status()
        return response.json()

    def get_election(self, district: Optional[str] = None) -> list[dict]:
        """선거 데이터 조회"""
        params = {}
        if district is not None:
            params["district"] = district

        response = requests.get(f"{self.base_url}/election", params=params)
        response.raise_for_status()
        return response.json()

    def optimize(self, target_hour: int, top_n: int = 10) -> dict:
        """최적 역 추천"""
        payload = {"target_hour": target_hour, "top_n": top_n}
        response = requests.post(f"{self.base_url}/optimize", json=payload)
        response.raise_for_status()
        return response.json()

    def get_heatmap(self, hour: int) -> list[dict]:
        """히트맵 데이터 조회"""
        response = requests.get(f"{self.base_url}/heatmap", params={"hour": hour})
        response.raise_for_status()
        return response.json()


# 사용 예시
if __name__ == "__main__":
    client = VoterReachClient()

    # 오전 8시 최적 역 5곳 추천
    result = client.optimize(target_hour=8, top_n=5)

    print("Top 5 Recommended Stations for 8 AM Campaign:")
    print("-" * 60)
    for i, rec in enumerate(result["recommendations"], 1):
        print(f"{i}. {rec['station_name']}")
        print(f"   Score: {rec['score']:.2f}")
        print(f"   Ridership: {rec['ridership']:,}")
        print(f"   Reason: {rec['reason']}")
        print()
```

---

## 6. 에러 처리

### HTTP 상태 코드

| 상태 코드 | 설명 |
|----------|------|
| 200 | 성공 |
| 422 | 유효성 검사 실패 (잘못된 파라미터) |
| 500 | 서버 내부 오류 |

### 유효성 검사 에러 예시

**잘못된 hour 값 (범위 초과):**
```bash
curl -X GET "http://localhost:8000/api/voter-reach/ridership?hour=25"
```

**Response (422):**
```json
{
  "detail": [
    {
      "type": "less_than_equal",
      "loc": ["query", "hour"],
      "msg": "Input should be less than or equal to 23",
      "input": "25"
    }
  ]
}
```

---

## 7. CORS 설정

API는 다음 CORS 설정이 적용되어 있습니다:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

프론트엔드 개발 시 `http://localhost:3000`에서 API 호출이 가능합니다.

---

## 8. 참고 사항

### 데이터 갱신

- 실제 데이터 파일이 없는 경우 Mock 데이터가 반환됩니다.
- Mock 데이터는 5개 역에 대한 24시간 승하차 패턴을 시뮬레이션합니다.
- 출퇴근 시간대(7-9시, 18-20시)에 더 높은 승하차 인원이 설정되어 있습니다.

### 성능 고려사항

- 현재 구현은 매 요청마다 JSON 파일을 로드합니다.
- 대규모 트래픽 환경에서는 캐싱 또는 데이터베이스 연동을 권장합니다.

### 버전 정보

- API Version: 0.1.0
- FastAPI 기반 REST API
- Python 3.10+ 지원
