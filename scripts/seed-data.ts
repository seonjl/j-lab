import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAMES } from './db-config.js';

const DATA_DIR = '../data/raw';

interface PopulationRecord {
  year: number;
  category: string; // 'total' | 'male' | 'female'
  ageGroups: Record<string, number>;
  totalPopulation: number;
  workingAge: number; // 15-64세
  elderly: number; // 65세 이상
}

interface LifeTableRecord {
  year: number;
  gender: string;
  ages: Record<string, {
    deathProbability: number;
    survivors: number;
    stationaryPopulation: number;
    lifeExpectancy: number;
  }>;
}

// 연령 그룹 매핑
const AGE_GROUPS = [
  '0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39',
  '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80+'
];

function parsePopulationCSV(): PopulationRecord[] {
  const filePath = `${DATA_DIR}/성_및_연령별_추계인구_1세별__5세별____전국_20260105141415.csv`;
  const content = readFileSync(filePath, 'utf-8');

  // CSV 파싱 (첫 번째 행이 헤더)
  const records = parse(content, {
    columns: false,
    skip_empty_lines: true,
    relax_quotes: true,
  });

  // 헤더에서 연도 추출 (4번째 컬럼부터)
  const headerRow = records[0] as string[];
  const years = headerRow.slice(3).map((y: string) => parseInt(y));

  const results: PopulationRecord[] = [];
  const dataByYearCategory: Map<string, PopulationRecord> = new Map();

  // 데이터 행 처리 (2번째 행부터)
  for (let i = 1; i < records.length; i++) {
    const row = records[i] as string[];
    const assumption = row[0]; // 가정별
    const gender = row[1]; // 성별
    const ageGroup = row[2]; // 연령별

    // 중위 추계만 사용
    if (!assumption?.includes('중위')) continue;

    // 성별 매핑
    let category: string;
    if (gender === '전체') category = 'total';
    else if (gender === '남자') category = 'male';
    else if (gender === '여자') category = 'female';
    else continue;

    // 연령별 인구 처리
    for (let j = 0; j < years.length; j++) {
      const year = years[j];
      const population = parseInt(row[3 + j]?.replace(/,/g, '') || '0');
      const key = `${year}-${category}`;

      if (!dataByYearCategory.has(key)) {
        dataByYearCategory.set(key, {
          year,
          category,
          ageGroups: {},
          totalPopulation: 0,
          workingAge: 0,
          elderly: 0,
        });
      }

      const record = dataByYearCategory.get(key)!;

      // 연령 그룹 분류
      if (ageGroup === '계') {
        record.totalPopulation = population;
      } else if (ageGroup?.includes('80') || ageGroup?.includes('85') || ageGroup?.includes('90') || ageGroup?.includes('95') || ageGroup?.includes('100')) {
        // 80세 이상은 합산
        record.ageGroups['80+'] = (record.ageGroups['80+'] || 0) + population;
        record.elderly += population;
      } else {
        // 정규 연령 그룹
        const normalizedAge = normalizeAgeGroup(ageGroup);
        if (normalizedAge) {
          record.ageGroups[normalizedAge] = population;

          // 생산가능인구 (15-64세)
          const ageStart = parseInt(normalizedAge.split('-')[0]);
          if (ageStart >= 15 && ageStart < 65) {
            record.workingAge += population;
          }
          // 고령인구 (65세 이상)
          if (ageStart >= 65) {
            record.elderly += population;
          }
        }
      }
    }
  }

  return Array.from(dataByYearCategory.values());
}

function normalizeAgeGroup(ageGroup: string): string | null {
  // "0 - 4세" -> "0-4"
  const match = ageGroup?.match(/(\d+)\s*-\s*(\d+)/);
  if (match) {
    return `${match[1]}-${match[2]}`;
  }
  return null;
}

function parseLifeTableCSV(): LifeTableRecord[] {
  const filePath = `${DATA_DIR}/장래_생명표___전국_20260105141623.csv`;
  const content = readFileSync(filePath, 'utf-8');

  const records = parse(content, {
    columns: false,
    skip_empty_lines: true,
    relax_quotes: true,
  });

  // 헤더 분석 (복잡한 구조)
  // 첫 번째 행: 가정별, 성별, 연령별, 2022, 2022, 2022, 2022, 2025, ...
  // 두 번째 행: 가정별, 성별, 연령별, 사망확률, 생존수, 정지인구, 기대여명, ...
  const headerRow1 = records[0] as string[];
  const headerRow2 = records[1] as string[];

  // 연도별 컬럼 인덱스 매핑
  const yearColumns: { year: number; colStart: number }[] = [];
  let currentYear = 0;
  for (let i = 3; i < headerRow1.length; i += 4) {
    const year = parseInt(headerRow1[i]);
    if (!isNaN(year) && year !== currentYear) {
      yearColumns.push({ year, colStart: i });
      currentYear = year;
    }
  }

  const results: Map<string, LifeTableRecord> = new Map();

  // 데이터 행 처리 (3번째 행부터)
  for (let i = 2; i < records.length; i++) {
    const row = records[i] as string[];
    const assumption = row[0];
    const gender = row[1];
    const age = row[2];

    if (!assumption?.includes('중위')) continue;
    if (!gender || !age) continue;

    const genderKey = gender === '남자' ? 'male' : gender === '여자' ? 'female' : null;
    if (!genderKey) continue;

    // 각 연도별 데이터 추출
    for (const { year, colStart } of yearColumns) {
      const key = `${year}-${genderKey}`;

      if (!results.has(key)) {
        results.set(key, {
          year,
          gender: genderKey,
          ages: {},
        });
      }

      const record = results.get(key)!;
      const deathProbability = parseFloat(row[colStart] || '0');
      const survivors = parseInt(row[colStart + 1]?.replace(/,/g, '') || '0');
      const stationaryPopulation = parseInt(row[colStart + 2]?.replace(/,/g, '') || '0');
      const lifeExpectancy = parseFloat(row[colStart + 3] || '0');

      record.ages[age] = {
        deathProbability,
        survivors,
        stationaryPopulation,
        lifeExpectancy,
      };
    }
  }

  return Array.from(results.values());
}

async function batchWrite(tableName: string, items: Record<string, unknown>[]) {
  // DynamoDB BatchWrite는 최대 25개씩
  const batches = [];
  for (let i = 0; i < items.length; i += 25) {
    batches.push(items.slice(i, i + 25));
  }

  for (const batch of batches) {
    const request = {
      RequestItems: {
        [tableName]: batch.map((item) => ({
          PutRequest: { Item: item },
        })),
      },
    };

    await docClient.send(new BatchWriteCommand(request));
  }
}

async function seedPopulation() {
  console.log('Parsing population data...');
  const records = parsePopulationCSV();
  console.log(`Found ${records.length} population records`);

  console.log('Seeding population table...');
  await batchWrite(TABLE_NAMES.POPULATION, records);
  console.log(`✓ Seeded ${records.length} population records`);
}

async function seedLifeTable() {
  console.log('Parsing life table data...');
  const records = parseLifeTableCSV();
  console.log(`Found ${records.length} life table records`);

  console.log('Seeding life table...');
  await batchWrite(TABLE_NAMES.LIFE_TABLE, records);
  console.log(`✓ Seeded ${records.length} life table records`);
}

async function main() {
  console.log('Starting data seeding...');
  console.log(`Endpoint: ${process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000'}\n`);

  try {
    await seedPopulation();
    await seedLifeTable();
    console.log('\n✓ All data seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

main();
