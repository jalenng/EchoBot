const { botClient } = require('../../bot')
const activities = require('./activities.json').activitiesList

function updateActivity () {
  try {
    if (activities && activities.length !== 0) {
      const activityIndex = Math.floor(Math.random() * activities.length)
      const activity = activities[activityIndex]
      botClient.user.setActivity(activity[1], { type: activity[0] })
    }
  } catch (err) {
    console.log(err)
  }
}

setInterval(updateActivity, 10000)
