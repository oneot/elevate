const { CosmosClient } = require('@azure/cosmos');
const { DefaultAzureCredential } = require('@azure/identity');

let client;

function getEndpoint() {
  const endpoint = process.env.COSMOS_ENDPOINT;

  if (!endpoint) {
    throw new Error('Please define COSMOS_ENDPOINT in your environment variables.');
  }

  return endpoint;
}

function getDatabaseName() {
  return process.env.COSMOS_DATABASE_NAME || process.env.COSMOS_DB_NAME || 'elevate';
}

function getClient() {
  if (!client) {
    const endpoint = getEndpoint();
    const accountKey = process.env.COSMOS_KEY;

    if (process.env.NODE_ENV !== 'production' && accountKey) {
      client = new CosmosClient({ endpoint, key: accountKey });
    } else {
      client = new CosmosClient({
        endpoint,
        aadCredentials: new DefaultAzureCredential()
      });
    }
  }

  return client;
}

const postsContainerName = 'posts';
const assetsContainerName = 'assets';

function getDatabase() {
  return getClient().database(getDatabaseName());
}

function getPostsContainer() {
  return getDatabase().container(postsContainerName);
}

function getAssetsContainer() {
  return getDatabase().container(assetsContainerName);
}

module.exports = {
  getClient,
  getDatabase,
  getPostsContainer,
  getAssetsContainer
};
