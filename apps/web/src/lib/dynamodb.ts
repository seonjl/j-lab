import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const isLocal = process.env.DYNAMODB_ENDPOINT?.includes('localhost')
  || process.env.DYNAMODB_ENDPOINT?.includes('dynamodb:8000')
  || process.env.NODE_ENV === 'development';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-northeast-2',
  ...(isLocal && {
    endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local',
    },
  }),
});

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

export const TABLE_NAMES = {
  POPULATION: 'npfs-population',
  LIFE_TABLE: 'npfs-life-table',
} as const;

export interface PopulationData {
  year: number;
  category: string;
  ageGroups: Record<string, number>;
  totalPopulation: number;
  workingAge: number;
  elderly: number;
}

export interface LifeTableData {
  year: number;
  gender: string;
  ages: Record<string, {
    deathProbability: number;
    survivors: number;
    stationaryPopulation: number;
    lifeExpectancy: number;
  }>;
}

/**
 * 특정 연도의 인구 데이터 조회
 */
export async function getPopulationByYear(year: number): Promise<PopulationData[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAMES.POPULATION,
      KeyConditionExpression: '#year = :year',
      ExpressionAttributeNames: { '#year': 'year' },
      ExpressionAttributeValues: { ':year': year },
    })
  );

  return (result.Items || []) as PopulationData[];
}

/**
 * 연도 범위의 인구 데이터 조회
 */
export async function getPopulationRange(
  startYear: number,
  endYear: number,
  category: string = 'total'
): Promise<PopulationData[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAMES.POPULATION,
      FilterExpression: '#year BETWEEN :start AND :end AND category = :category',
      ExpressionAttributeNames: { '#year': 'year' },
      ExpressionAttributeValues: {
        ':start': startYear,
        ':end': endYear,
        ':category': category,
      },
    })
  );

  return ((result.Items || []) as PopulationData[]).sort((a, b) => a.year - b.year);
}

/**
 * 특정 연도의 생명표 데이터 조회
 */
export async function getLifeTableByYear(year: number): Promise<LifeTableData[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAMES.LIFE_TABLE,
      KeyConditionExpression: '#year = :year',
      ExpressionAttributeNames: { '#year': 'year' },
      ExpressionAttributeValues: { ':year': year },
    })
  );

  return (result.Items || []) as LifeTableData[];
}

/**
 * 시뮬레이션용 요약 인구 데이터 조회
 */
export async function getSimulationData(
  startYear: number,
  endYear: number
): Promise<{
  year: number;
  totalPopulation: number;
  workingAge: number;
  elderly: number;
}[]> {
  const data = await getPopulationRange(startYear, endYear, 'total');

  return data.map((d) => ({
    year: d.year,
    totalPopulation: d.totalPopulation,
    workingAge: d.workingAge,
    elderly: d.elderly,
  }));
}
