import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const isLocal = process.env.DYNAMODB_ENDPOINT?.includes('localhost')
  || process.env.DYNAMODB_ENDPOINT?.includes('dynamodb:8000')
  || !process.env.DYNAMODB_ENDPOINT;

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-northeast-2',
  ...(isLocal && {
    endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
    credentials: {
      accessKeyId: 'local',
      secretAccessKey: 'local',
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

/**
 * DynamoDB 테이블 스키마 설계
 *
 * 1. npfs-population (인구 추계)
 *    - PK: year (N) - 2022, 2023, ...
 *    - SK: category (S) - "total", "male", "female"
 *    - ageGroups: Map - { "0-4": 1494041, "5-9": 2142084, ... }
 *    - totalPopulation: N
 *    - workingAge: N (15-64세)
 *    - elderly: N (65세 이상)
 *
 * 2. npfs-life-table (생명표)
 *    - PK: year (N) - 2022, 2025, 2030, ...
 *    - SK: gender (S) - "male", "female"
 *    - ages: Map - { "0": {...}, "1-4": {...}, ... }
 *      - deathProbability, survivors, lifeExpectancy
 */
