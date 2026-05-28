require('dotenv').config({ quiet: true });

const { app } = require('@azure/functions');

const { functionDefinition: health } = require('./health');
const { functionDefinition: publicPostsList } = require('./publicPostsList');
const { functionDefinition: publicPostDetail } = require('./publicPostDetail');
const { functionDefinition: publicSeriesByCategory } = require('./publicSeriesByCategory');
const { functionDefinition: publicSeriesPosts } = require('./publicSeriesPosts');
const { functionDefinition: publicTags } = require('./publicTags');
const { functionDefinition: adminCalendarEventsList } = require('./adminCalendarEventsList');
const { functionDefinition: adminCalendarEventCreate } = require('./adminCalendarEventCreate');
const { functionDefinition: adminCalendarEventDetail } = require('./adminCalendarEventDetail');
const { functionDefinition: adminCalendarEventUpdate } = require('./adminCalendarEventUpdate');
const { functionDefinition: adminCalendarEventDelete } = require('./adminCalendarEventDelete');
const { functionDefinition: publicCalendarEventsList } = require('./publicCalendarEventsList');
const { functionDefinition: adminPostsList } = require('./adminPostsList');
const { functionDefinition: adminPostDetail } = require('./adminPostDetail');
const { functionDefinition: adminCreatePost } = require('./adminCreatePost');
const { functionDefinition: adminUpdatePost } = require('./adminUpdatePost');
const { functionDefinition: adminDeletePost } = require('./adminDeletePost');
const { functionDefinition: adminIssueAssetSas } = require('./adminIssueAssetSas');
const { functionDefinition: adminCreateAsset } = require('./adminCreateAsset');
const { functionDefinition: adminDeleteAsset } = require('./adminDeleteAsset');
const { functionDefinition: adminAnalyticsSummary } = require('./adminAnalyticsSummary');
const { functionDefinition: adminIssueFileSas } = require('./adminIssueFileSas');
const { functionDefinition: adminGetFiles } = require('./adminGetFiles');
const { functionDefinition: adminCreateFile } = require('./adminCreateFile');
const { functionDefinition: adminDeleteFile } = require('./adminDeleteFile');

const functionDefinitions = [
  health,
  publicPostsList,
  publicPostDetail,
  publicSeriesByCategory, // literal route (api/public/series) — must be before publicSeriesPosts
  publicSeriesPosts,
  publicTags,
  publicCalendarEventsList,       // literal route — before parameterized routes
  adminPostsList,
  adminPostDetail,
  adminCreatePost,
  adminUpdatePost,
  adminDeletePost,
  adminCalendarEventsList,        // literal route — before parameterized routes
  adminCalendarEventCreate,       // literal route — before parameterized routes
  adminCalendarEventDetail,       // parameterized route
  adminCalendarEventUpdate,       // parameterized route
  adminCalendarEventDelete,       // parameterized route
  adminIssueAssetSas,
  adminCreateAsset,
  adminDeleteAsset,
  adminIssueFileSas, // literal route (api/admin/files/sas) — must be before adminCreateFile and adminGetFiles
  adminGetFiles,
  adminCreateFile,
  adminDeleteFile,
  adminAnalyticsSummary
];

for (const definition of functionDefinitions) {
  const { name, ...config } = definition;
  app.http(name, config);
}

module.exports = {
  functionDefinitions
};