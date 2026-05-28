const { getCalendarEventDetail } = require('../controllers/calendarEventController');
const { createControllerHandler } = require('./shared/httpHandler');

const adminCalendarEventDetailHandler = createControllerHandler(getCalendarEventDetail, {
  name: 'adminCalendarEventDetail',
  requireAdminAuth: true
});

const functionDefinition = {
  name: 'adminCalendarEventDetail',
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'api/admin/calendar-events/{eventId}',
  handler: adminCalendarEventDetailHandler
};

module.exports = { functionDefinition, adminCalendarEventDetailHandler };
