const { botClient } = require('../../bot')
const activities = require('./activities.json').activitiesList

// How long to wait between activity updates
const ACTIVITY_UPDATE_INTERVAL = 10000 // 10 seconds

/**
 * Updates the bot's activity
 */
function updateActivity () {
  try {
    const activity = getRandomActivity()
    botClient.user.setActivity(activity[1], { type: activity[0] })
  } catch (error) {
    console.log(error)
  }
}

/**
 * Get a random activity
 */
function getRandomActivity () {
  const hasActivities = activities && activities.length !== 0
  if (hasActivities) {
    return activities[Math.floor(Math.random() * activities.length)]
  } else {
    return [null, null]
  }
}

// Update the activity every 10 seconds
botClient.on('ready', () => {
  botClient.user.setStatus('online')

  updateActivity()
  setInterval(updateActivity, ACTIVITY_UPDATE_INTERVAL)
})
