# KOSIS 필요 데이터 목록

국민연금 재정 시뮬레이션에 필요한 KOSIS(국가통계포털) 데이터 목록입니다.

## 1. 인구 추계 데이터 (필수)

### 1.1 장래인구추계 (통계청)
- **통계표 ID**: `101_DT_1BPA001`
- **경로**: 인구 > 장래인구추계 > 전국 장래인구추계(성 및 연령별)
- **필요 항목**:
  - 연도별 성별/연령별(1세 단위) 인구
  - 추계 기간: 2024~2093년
- **다운로드 형식**: CSV

### 1.2 생명표 (사망률)
- **통계표 ID**: `101_DT_1B41`
- **경로**: 인구 > 생명표 > 생명표(전국)
- **필요 항목**:
  - 연령별 사망확률
  - 기대여명

## 2. 경제 지표 데이터

### 2.1 평균 임금 및 소득
- **통계표 ID**: `118_DT_111001_N061`
- **경로**: 고용 > 임금 > 사업체노동력조사 > 상용근로자 월평균 임금
- **필요 항목**:
  - 연도별 평균 임금
  - 산업별/규모별 평균 임금 (선택)

### 2.2 소비자물가지수
- **통계표 ID**: `101_DT_1J11001`
- **경로**: 물가 > 소비자물가조사 > 소비자물가지수
- **필요 항목**:
  - 연도별 물가상승률

### 2.3 GDP 및 경제성장률
- **통계표 ID**: `101_DT_1YL15001`
- **경로**: 국민계정 > 국내총생산(GDP)
- **필요 항목**:
  - 연도별 실질 GDP
  - 경제성장률

## 3. 국민연금 현황 데이터

### 3.1 국민연금 가입자 현황
- **출처**: 국민연금공단 통계연보
- **URL**: https://www.nps.or.kr/jsppage/info/statistics/statistics_02.jsp
- **필요 항목**:
  - 가입자 수 (사업장/지역/임의가입)
  - 가입률

### 3.2 국민연금 수급자 현황
- **출처**: 국민연금공단 통계연보
- **필요 항목**:
  - 연금 종류별 수급자 수
  - 평균 연금액

### 3.3 국민연금 기금 운용 현황
- **출처**: 국민연금기금운용본부
- **URL**: https://fund.nps.or.kr
- **필요 항목**:
  - 기금 규모
  - 수익률 (자산별)

## 4. 데이터 다운로드 방법

### KOSIS 웹사이트
1. https://kosis.kr 접속
2. 통계표 검색 또는 통계표 ID로 직접 접근
3. 조회 조건 설정 (연도, 항목 등)
4. 다운로드 (CSV 권장)

### KOSIS Open API
```bash
# API 키 발급: https://kosis.kr/openapi/
# 예시 요청
curl "https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey={API_KEY}&orgId=101&tblId=DT_1BPA001&..."
```

## 5. 데이터 저장 구조

```
data/
├── raw/                    # 원본 데이터
│   ├── population/         # 인구 추계
│   │   ├── population_projection_2024_2093.csv
│   │   └── life_table_2024.csv
│   ├── economic/           # 경제 지표
│   │   ├── wage_statistics.csv
│   │   ├── cpi_index.csv
│   │   └── gdp_growth.csv
│   └── pension/            # 연금 현황
│       ├── subscribers.csv
│       ├── beneficiaries.csv
│       └── fund_status.csv
└── processed/              # 가공 데이터
    ├── simulation_input.json
    └── yearly_projections.json
```

## 6. 주요 참고 자료

1. **국회예산정책처 장기재정전망**
   - 국민연금 재정전망 방법론 상세 기술
   - URL: https://www.nabo.go.kr

2. **보건사회연구원 연금 연구**
   - 연금 수리 모델 학술 자료

3. **국민연금재정계산위원회 보고서**
   - 5년 주기 재정계산 결과
