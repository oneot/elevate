const { CosmosClient } = require("@azure/cosmos");
const { DefaultAzureCredential } = require("@azure/identity");

// Fallback logic for local development vs App Service Managed Identity
// The endpoint URL of the Cosmos DB account
const endpoint = process.env.COSMOS_ENDPOINT;

if (!endpoint) {
  throw new Error("Please define COSMOS_ENDPOINT in your .env file.");
}

let client;

try {
  // Try to use a connection key first (for local testing/Dev)
  const accountKey = process.env.COSMOS_KEY;
  
  if (process.env.NODE_ENV !== 'production' && accountKey) {
     client = new CosmosClient({ endpoint, key: accountKey });
     console.log("Cosmos DB Client initialized with Account Key (Local Mode)");
  } else {
    // Use DefaultAzureCredential which supports Managed Identity in App Service
    const credential = new DefaultAzureCredential();
    client = new CosmosClient({
      endpoint,
      aadCredentials: credential
    });
    console.log("Cosmos DB Client initialized with Azure AD Credentials (RBAC Mode)");
  }
} catch (error) {
  console.error("Failed to initialize Cosmos DB Client:", error);
}

const databaseName = process.env.COSMOS_DB_NAME || "elevate-db";
const postsContainerName = "posts";
const assetsContainerName = "assets";

function getDatabase() {
  return client.database(databaseName);
}

function getPostsContainer() {
  return getDatabase().container(postsContainerName);
}

function getAssetsContainer() {
  return getDatabase().container(assetsContainerName);
}

module.exports = {
  client,
  getDatabase,
  getPostsContainer,
  getAssetsContainer
};
