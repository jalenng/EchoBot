const { botClient } = require('../../bot')
const { log, LogType } = require('../logger')
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
    log(`Error updating activity\n${error}\n${error.stack}`, LogType.Error)
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

botClient.on('ready', () => {
  // Set the status to online
  botClient.user.setStatus('online')

  // Update the activity every 10 seconds
  updateActivity()
  setInterval(updateActivity, ACTIVITY_UPDATE_INTERVAL)
})
