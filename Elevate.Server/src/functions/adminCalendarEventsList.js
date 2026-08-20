const { listCalendarEvents } = require('../controllers/calendarEventController');
const { createControllerHandler } = require('./shared/httpHandler');

const adminCalendarEventsListHandler = createControllerHandler(listCalendarEvents, {
  name: 'adminCalendarEventsList',
  requireAdminAuth: true
});

const functionDefinition = {
  name: 'adminCalendarEventsList',
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'api/admin/calendar-events',
  handler: adminCalendarEventsListHandler
};

module.exports = { functionDefinition, adminCalendarEventsListHandler };
