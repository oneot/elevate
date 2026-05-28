const { updateCalendarEvent } = require('../controllers/calendarEventController');
const { createControllerHandler } = require('./shared/httpHandler');

const adminCalendarEventUpdateHandler = createControllerHandler(updateCalendarEvent, {
  name: 'adminCalendarEventUpdate',
  requireAdminAuth: true
});

const functionDefinition = {
  name: 'adminCalendarEventUpdate',
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'api/admin/calendar-events/{eventId}',
  handler: adminCalendarEventUpdateHandler
};

module.exports = { functionDefinition, adminCalendarEventUpdateHandler };
