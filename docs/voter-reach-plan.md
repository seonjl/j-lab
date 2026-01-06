# Voter Reach Optimization Project - Implementation Plan

## 1. 프로젝트 개요

**목표**: 지하철 유동인구 + 유권자 데이터를 결합하여 최적의 선거 캠페인 위치/시간 추천

### 데이터 현황 (data/raw/)

| 파일명 | 내용 | 인코딩 | 크기 |
|--------|------|--------|------|
| 서울교통공사_1_8호선 역사 좌표(위경도) 정보_20250814.csv | 276개 역 좌표 | EUC-KR | 16KB |
| 서울교통공사_역별 시간대별 승하차인원(24.1~24.12).csv | 2024년 시간대별 승하차 | EUC-KR | 25MB |
| 서울교통공사_역별 일별 시간대별 승하차인원 정보_20241231.csv | 일별 상세 승하차 | EUC-KR | 25MB |
| 중앙선거관리위원회_국회의원선거 개표결과_20240410.csv | 22대 국회의원 선거 결과 | EUC-KR | 7.5MB |
| 등록인구(연령별_동별)_20260105164119.csv | 동별 연령별 인구 | UTF-8 | 20KB |
| 202512_202512_연령별인구현황_월간.csv | 월별 연령 인구 | UTF-8 | 8KB |

### 추가 필요 데이터
- [ ] 서울시 행정동 경계 GeoJSON (GitHub: vuski/admdongkor)
- [ ] 지하철역-행정동 매핑 테이블

---

## 2. 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│  /projects/voter-reach                                       │
│  ├── Map Component (Google Maps / Kakao Maps)               │
│  ├── Time Selector (시간대 선택)                             │
│  ├── Station List (역별 점수 랭킹)                           │
│  └── Analysis Dashboard (분석 결과)                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (FastAPI)                     │
│  /api/voter-reach                                            │
│  ├── GET /stations - 역 목록 + 좌표                          │
│  ├── GET /ridership?hour=8 - 시간대별 승하차                 │
│  ├── GET /voters?district=강남 - 지역별 유권자               │
│  ├── POST /optimize - 최적 위치/시간 계산                    │
│  └── GET /heatmap - 히트맵 데이터                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer (JSON Files)                    │
│  /data/processed                                             │
│  ├── stations.json - 역 정보 + 좌표                          │
│  ├── ridership_hourly.json - 시간대별 평균 승하차            │
│  ├── voters_by_district.json - 지역별 유권자/투표율          │
│  └── station_district_mapping.json - 역-행정동 매핑          │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 구현 단계

### Phase 1: 데이터 파싱 (Sub-agent: Data Parser)

**목표**: Raw CSV → Processed JSON 변환

```python
# scripts/parse_voter_data.py

1. 지하철역 좌표 파싱
   Input: 서울교통공사_1_8호선 역사 좌표(위경도) 정보_20250814.csv
   Output: data/processed/stations.json
   Schema: { station_id, name, line, lat, lng }

2. 승하차 데이터 집계
   Input: 서울교통공사_역별 시간대별 승하차인원(24.1~24.12).csv
   Output: data/processed/ridership_hourly.json
   Schema: { station_id, hour, avg_boarding, avg_alighting, total }

3. 선거 데이터 파싱
   Input: 중앙선거관리위원회_국회의원선거 개표결과_20240410.csv
   Output: data/processed/voters_by_district.json
   Schema: { district, voters, turnout_rate, results }

4. 인구 데이터 파싱
   Input: 등록인구(연령별_동별)_20260105164119.csv
   Output: data/processed/population_by_dong.json
   Schema: { dong, total, by_age: { 0-19, 20-39, 40-59, 60+ } }
```

### Phase 2: Backend API (Sub-agent: Backend Developer)

**목표**: FastAPI 엔드포인트 구현

```python
# apps/ml-api/routers/voter_reach.py

@router.get("/stations")
# 전체 역 목록 + 좌표 반환

@router.get("/ridership")
# 시간대별 승하차 데이터
# Query: hour (0-23), day_type (weekday/weekend)

@router.get("/voters/{district}")
# 지역별 유권자 수, 투표율

@router.post("/optimize")
# 최적 위치/시간 계산
# Input: { target_districts, time_range, strategy }
# Output: { recommendations: [{ station, hour, score, reason }] }

@router.get("/heatmap")
# 지도 히트맵용 데이터
# Query: hour, metric (ridership/voters/score)
```

### Phase 3: Frontend UI (Sub-agent: Frontend Developer)

**목표**: 지도 기반 시각화 UI

```
/projects/voter-reach/page.tsx

Components:
├── VoterReachMap.tsx      # Google Maps 지도 + 마커/히트맵
├── TimeSlider.tsx         # 시간대 선택 슬라이더
├── StationRanking.tsx     # 역별 점수 랭킹 리스트
├── AnalysisDashboard.tsx  # 분석 결과 대시보드
└── FilterPanel.tsx        # 필터 옵션 (요일, 지역 등)

Features:
1. 지도에 역별 마커 표시 (색상 = 점수)
2. 시간대 슬라이더로 실시간 업데이트
3. 역 클릭 시 상세 정보 팝업
4. 최적 경로 추천 기능
```

---

## 4. 분석 알고리즘

### 유권자 접촉 점수 (Voter Reach Score)

```python
def calculate_score(station, hour, params):
    # 1. 유동인구 점수 (0-100)
    ridership = get_ridership(station, hour)
    ridership_score = normalize(ridership, max_ridership) * 100

    # 2. 유권자 밀도 점수 (0-100)
    district = get_district(station)
    voter_density = voters[district] / population[district]
    voter_score = voter_density * 100

    # 3. 투표율 가중치 (0.5-1.5)
    turnout = get_turnout_rate(district)
    turnout_weight = 0.5 + turnout

    # 4. 연령 가중치 (타겟 연령대 비율)
    age_weight = get_target_age_ratio(district, params.target_age)

    # 최종 점수
    score = (ridership_score * 0.4 + voter_score * 0.6) * turnout_weight * age_weight
    return score
```

---

## 5. 파일 구조

```
npfs/
├── data/
│   ├── raw/                          # 원본 데이터 (현재)
│   └── processed/                    # 가공된 JSON (생성 예정)
│       ├── stations.json
│       ├── ridership_hourly.json
│       ├── voters_by_district.json
│       └── seoul_districts.geojson
├── apps/
│   ├── ml-api/
│   │   └── routers/
│   │       └── voter_reach.py        # 새 API 라우터
│   └── web/
│       └── src/
│           └── app/
│               └── projects/
│                   └── voter-reach/  # 새 페이지
│                       └── page.tsx
└── scripts/
    └── parse_voter_data.py           # 데이터 파싱 스크립트
```

---

## 6. Sub-agent 작업 분배

### Agent 1: Data Parser
- 역할: CSV → JSON 변환 스크립트 작성
- 파일: scripts/parse_voter_data.py
- 출력: data/processed/*.json

### Agent 2: Backend API
- 역할: FastAPI 엔드포인트 구현
- 파일: apps/ml-api/routers/voter_reach.py
- 의존: Agent 1 완료 후

### Agent 3: Frontend UI
- 역할: Next.js 페이지 + 지도 컴포넌트
- 파일: apps/web/src/app/projects/voter-reach/
- 의존: Agent 2 완료 후 (API 연동)

---

## 7. 예상 결과물

### 화면 구성

```
┌────────────────────────────────────────────────────────────────┐
│ Policy Research Lab          Home  About  Projects  Research   │
├────────────────────────────────────────────────────────────────┤
│ Voter Reach Optimizer                                          │
│ 유권자 접촉 최적화 분석                                          │
├──────────────────────────────┬─────────────────────────────────┤
│                              │ Top Stations (08:00-09:00)      │
│      [Google Maps]           │ ┌─────────────────────────────┐ │
│                              │ │ 1. 강남역      Score: 95    │ │
│    ● 강남 (95)               │ │ 2. 홍대입구    Score: 92    │ │
│    ● 홍대 (92)               │ │ 3. 신림역      Score: 88    │ │
│    ○ 여의도 (78)             │ │ 4. 건대입구    Score: 85    │ │
│                              │ │ 5. 신촌역      Score: 82    │ │
│                              │ └─────────────────────────────┘ │
├──────────────────────────────┴─────────────────────────────────┤
│ Time: [====●===================] 08:00                         │
│       06:00                                              24:00 │
├────────────────────────────────────────────────────────────────┤
│ Daily Optimal Route                                            │
│ 08:00 강남역 → 09:30 역삼역 → 12:00 여의도역 → 18:00 홍대입구   │
└────────────────────────────────────────────────────────────────┘
```
