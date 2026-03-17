require('dotenv').config({ quiet: true });

const { app } = require('@azure/functions');

const { functionDefinition: health } = require('./health');
const { functionDefinition: publicPostsList } = require('./publicPostsList');
const { functionDefinition: publicPostDetail } = require('./publicPostDetail');
const { functionDefinition: publicSeriesPosts } = require('./publicSeriesPosts');
const { functionDefinition: publicTags } = require('./publicTags');
const { functionDefinition: adminCreatePost } = require('./adminCreatePost');
const { functionDefinition: adminUpdatePost } = require('./adminUpdatePost');
const { functionDefinition: adminDeletePost } = require('./adminDeletePost');
const { functionDefinition: adminIssueAssetSas } = require('./adminIssueAssetSas');
const { functionDefinition: adminCreateAsset } = require('./adminCreateAsset');
const { functionDefinition: adminDeleteAsset } = require('./adminDeleteAsset');
const { functionDefinition: adminAnalyticsSummary } = require('./adminAnalyticsSummary');

const functionDefinitions = [
  health,
  publicPostsList,
  publicPostDetail,
  publicSeriesPosts,
  publicTags,
  adminCreatePost,
  adminUpdatePost,
  adminDeletePost,
  adminIssueAssetSas,
  adminCreateAsset,
  adminDeleteAsset,
  adminAnalyticsSummary
];

for (const definition of functionDefinitions) {
  const { name, ...config } = definition;
  app.http(name, config);
}

module.exports = {
  functionDefinitions
};