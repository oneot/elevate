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

function getPostsContainerName() {
  return process.env.COSMOS_CONTAINER_NAME || 'posts';
}

function getAssetsContainerName() {
  return process.env.COSMOS_ASSETS_CONTAINER_NAME || getPostsContainerName();
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

function getDatabase() {
  return getClient().database(getDatabaseName());
}

function getPostsContainer() {
  return getDatabase().container(getPostsContainerName());
}

function getAssetsContainer() {
  return getDatabase().container(getAssetsContainerName());
}

module.exports = {
  getClient,
  getDatabase,
  getPostsContainer,
  getAssetsContainer
};
