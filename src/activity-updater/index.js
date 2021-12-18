const activities = require("./activities.json")["activitiesList"];

module.exports.updateActivity = () => {
    try {
        if (activities && activities.length != 0) {
            const activityIndex = Math.floor(Math.random() * activities.length);
            const activity = activities[activityIndex];
            client.user.setActivity(activity[1], {type: activity[0]});
        }
    } 
    catch (err) {
        console.log(err)
    }
}