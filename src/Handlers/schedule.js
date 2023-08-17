const cron = require('node-cron');
const { scheduleMessagesForTeams } = require('../Functions/new-messages');

function setupSchedules(client) {
    cron.schedule('0 8 * * 1', async function() {
        try {
            await scheduleMessagesForTeams(client);
            console.log('reseted times messages successfully!')
        } catch (error) {
            console.error("An error occurred during the scheduled task:", error);
        }
    }, {
        timezone: "America/New_York"
    });
}



module.exports = { setupSchedules }
