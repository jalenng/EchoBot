const { update } = require("node-persist");

module.exports = {
    updateActivity: updateActivity
}

// Import files and modules
const activities = require("./activities.json")["activitiesList"];

/**
 * Updates the bot's activity message with a random one from the set
 */
function updateActivity() {
    try {
        if (activities && activities.length != 0) {
            const activityIndex = Math.floor(Math.random() * activities.length);
            const activity = activities[activityIndex];
            discordClient.user.setActivity(activity[1], {type: activity[0]});
        }
    } 
    catch (err) {
        console.log(err)
    }
}