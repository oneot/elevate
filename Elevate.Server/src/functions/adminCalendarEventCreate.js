const { createCalendarEvent } = require('../controllers/calendarEventController');
const { createControllerHandler } = require('./shared/httpHandler');

const adminCalendarEventCreateHandler = createControllerHandler(createCalendarEvent, {
  name: 'adminCalendarEventCreate',
  requireAdminAuth: true
});

const functionDefinition = {
  name: 'adminCalendarEventCreate',
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'api/admin/calendar-events',
  handler: adminCalendarEventCreateHandler
};

module.exports = { functionDefinition, adminCalendarEventCreateHandler };
