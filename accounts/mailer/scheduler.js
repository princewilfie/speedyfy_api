const cron = require('node-cron');
const eventService = require('./path/to/events.service'); // Update the path to match your events.service file

// Schedule the notification function to run every day at 9:00 AM
cron.schedule('0 9 * * *', async () => {
    try {
        console.log('Running scheduled task to send upcoming event notifications...');
        await eventService.sendUpcomingEventNotifications();
    } catch (error) {
        console.error('Error running scheduled task:', error);
    }
}, {
    timezone: 'Asia/Manila' // Update 'Your/Timezone' with your actual timezone, e.g., 'America/New_York'
});

console.log('Scheduler initialized.');
