import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { TABLE_NAMES } from './db-config.js';

const isLocal = !process.env.DYNAMODB_ENDPOINT || process.env.DYNAMODB_ENDPOINT.includes('localhost');

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

async function tableExists(tableName: string): Promise<boolean> {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (error) {
    if (error instanceof ResourceNotFoundException) {
      return false;
    }
    throw error;
  }
}

async function createPopulationTable() {
  const tableName = TABLE_NAMES.POPULATION;

  if (await tableExists(tableName)) {
    console.log(`✓ Table ${tableName} already exists`);
    return;
  }

  await client.send(
    new CreateTableCommand({
      TableName: tableName,
      KeySchema: [
        { AttributeName: 'year', KeyType: 'HASH' },
        { AttributeName: 'category', KeyType: 'RANGE' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'year', AttributeType: 'N' },
        { AttributeName: 'category', AttributeType: 'S' },
      ],
      BillingMode: 'PAY_PER_REQUEST',
    })
  );

  console.log(`✓ Created table ${tableName}`);
}

async function createLifeTableTable() {
  const tableName = TABLE_NAMES.LIFE_TABLE;

  if (await tableExists(tableName)) {
    console.log(`✓ Table ${tableName} already exists`);
    return;
  }

  await client.send(
    new CreateTableCommand({
      TableName: tableName,
      KeySchema: [
        { AttributeName: 'year', KeyType: 'HASH' },
        { AttributeName: 'gender', KeyType: 'RANGE' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'year', AttributeType: 'N' },
        { AttributeName: 'gender', AttributeType: 'S' },
      ],
      BillingMode: 'PAY_PER_REQUEST',
    })
  );

  console.log(`✓ Created table ${tableName}`);
}

async function main() {
  console.log('Creating DynamoDB tables...');
  console.log(`Endpoint: ${process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000'}`);

  try {
    await createPopulationTable();
    await createLifeTableTable();
    console.log('\n✓ All tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
}

main();
