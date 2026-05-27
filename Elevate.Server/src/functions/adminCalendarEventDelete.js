const { deleteCalendarEvent } = require('../controllers/calendarEventController');
const { createControllerHandler } = require('./shared/httpHandler');

const adminCalendarEventDeleteHandler = createControllerHandler(deleteCalendarEvent, {
  name: 'adminCalendarEventDelete',
  requireAdminAuth: true
});

const functionDefinition = {
  name: 'adminCalendarEventDelete',
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'api/admin/calendar-events/{id}',
  handler: adminCalendarEventDeleteHandler
};

module.exports = { functionDefinition, adminCalendarEventDeleteHandler };
