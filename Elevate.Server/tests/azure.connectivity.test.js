require('dotenv').config({ quiet: true });

const test = require('node:test');
const assert = require('node:assert/strict');
const { DefaultAzureCredential } = require('@azure/identity');
const { CosmosClient } = require('@azure/cosmos');
const { BlobServiceClient } = require('@azure/storage-blob');

const runAzureTests = process.env.RUN_AZURE_TESTS === 'true';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
}

function toHintedError(prefix, error) {
  const message = String(error.message || '');
  const nextSteps = [
    `${prefix}: ${message}`
  ];

  if (message.includes('blocked by your Cosmos DB account firewall settings') || message.includes('publicNetworkAccess') || message.includes('AuthorizationFailure')) {
    nextSteps.push('확인 항목: 현재 로컬 실행 위치가 허용된 네트워크 경로인지 확인하세요. publicNetworkAccess=Disabled이면 Azure 내부 또는 허용된 사설망에서만 데이터 평면 테스트가 가능합니다.');
  } else {
    nextSteps.push('확인 항목: az login 계정 또는 Function Managed Identity에 필요한 RBAC가 부여되었는지 점검하세요.');
  }

  if (prefix.includes('Cosmos')) {
    nextSteps.push('필요 권한: Cosmos DB Data Contributor (데이터 평면)');
  }

  if (prefix.includes('Storage')) {
    nextSteps.push('필요 권한: Storage Blob Data Contributor + Storage Blob Delegator');
  }

  return new Error(nextSteps.join(' '), { cause: error });
}

test('Azure 연결(Cosmos DB) 확인', { skip: !runAzureTests }, async () => {
  const endpoint = requireEnv('COSMOS_ENDPOINT');
  const databaseName = process.env.COSMOS_DATABASE_NAME || process.env.COSMOS_DB_NAME || 'elevate';
  const credential = new DefaultAzureCredential();

  let cosmosClient;
  if (process.env.COSMOS_KEY) {
    cosmosClient = new CosmosClient({ endpoint, key: process.env.COSMOS_KEY });
  } else {
    cosmosClient = new CosmosClient({ endpoint, aadCredentials: credential });
  }

  try {
    const { resource: db } = await cosmosClient.database(databaseName).read();
    assert.equal(db.id, databaseName);
  } catch (error) {
    throw toHintedError('Cosmos RBAC 검증 실패', error);
  }
});

test('Azure 연결(Storage Blob) 확인', { skip: !runAzureTests }, async () => {
  const storageAccountName = requireEnv('STORAGE_ACCOUNT_NAME');
  const containerName = process.env.STORAGE_CONTAINER_NAME || 'images';
  const startsOn = new Date(Date.now() - 5 * 60 * 1000);
  const expiresOn = new Date(Date.now() + 5 * 60 * 1000);

  const blobServiceClient = new BlobServiceClient(
    `https://${storageAccountName}.blob.core.windows.net`,
    new DefaultAzureCredential()
  );

  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const exists = await containerClient.exists();
    assert.equal(exists, true);

    const delegationKey = await blobServiceClient.getUserDelegationKey(startsOn, expiresOn);
    assert.ok(delegationKey.signedOid);
  } catch (error) {
    throw toHintedError('Storage RBAC 검증 실패', error);
  }
});

if (!runAzureTests) {
  test('Azure 연결 테스트 실행 안내', () => {
    assert.ok(true, 'RUN_AZURE_TESTS=true로 실행하면 실제 Azure 연결 검증을 수행합니다.');
  });
}
