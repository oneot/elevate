const { getTagList } = require('../controllers/postController');
const { createControllerHandler } = require('./shared/httpHandler');

const publicTagsHandler = createControllerHandler(getTagList, {
  name: 'publicTags'
});

const functionDefinition = {
  name: 'publicTags',
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'api/public/tags',
  handler: publicTagsHandler
};

module.exports = {
  functionDefinition,
  publicTagsHandler
};