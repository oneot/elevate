const { listCalendarEvents } = require('../controllers/calendarEventController');
const { createControllerHandler } = require('./shared/httpHandler');

const publicCalendarEventsListHandler = createControllerHandler(listCalendarEvents, {
  name: 'publicCalendarEventsList',
  requireAdminAuth: false
});

const functionDefinition = {
  name: 'publicCalendarEventsList',
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'api/public/calendar-events',
  handler: publicCalendarEventsListHandler
};

module.exports = { functionDefinition, publicCalendarEventsListHandler };
